import { Worker } from "bullmq";
import { and, eq, inArray } from "drizzle-orm";
import { getMasterDb } from "@/infra/database/master/connection.js";
import { tenants } from "@/infra/database/master/schema.js";
import { logger } from "@/infra/logger.js";
import { getTenantDb } from "@/infra/database/tenant/connection-manager.js";
import { campaignLeads, integrations, leads } from "@/infra/database/tenant/schema.js";
import { getDialerAdapter } from "@/modules/integrations/dialers/dialer-factory.js";
import { getQueueConnection } from "./connection.js";
import { dialerResultsQueue } from "./queues.js";
import type { DialerResultsJobPayload, DialerSyncJobPayload } from "./job-types.js";

async function loadIntegrationConfig(tenantDatabaseName: string, integrationId: string) {
  const db = getTenantDb(tenantDatabaseName);
  const [row] = await db
    .select({
      provider: integrations.provider,
      baseUrl: integrations.baseUrl,
      credentials: integrations.credentials,
      isActive: integrations.isActive,
    })
    .from(integrations)
    .where(eq(integrations.id, integrationId))
    .limit(1);
  if (!row || !row.isActive) {
    throw new Error("Integração não encontrada ou inativa para o job.");
  }
  const credentials =
    row.credentials && typeof row.credentials === "object" && !Array.isArray(row.credentials)
      ? (row.credentials as Record<string, unknown>)
      : {};
  const apiKey = String(credentials.apiKey ?? "");
  if (!apiKey) {
    throw new Error("API Key da integração ausente.");
  }
  return {
    provider: row.provider,
    config: {
      baseUrl: row.baseUrl,
      apiKey,
    },
  };
}

let workersStarted = false;
export function startQueueWorkers(): void {
  if (workersStarted) return;
  workersStarted = true;

  const connection = getQueueConnection();

  new Worker<DialerSyncJobPayload>(
    "dialer-sync-queue",
    async (job) => {
      const { action, tenantDatabaseName, integrationId } = job.data;
      const { provider, config } = await loadIntegrationConfig(tenantDatabaseName, integrationId);
      const adapter = getDialerAdapter(provider);
      const db = getTenantDb(tenantDatabaseName);

      if (action === "add_single") {
        await adapter.addSingleContact(
          config,
          job.data.contactId!,
          job.data.contactName!,
          job.data.queueId!,
          job.data.phone!
        );
        return;
      }
      if (action === "add_bulk") {
        await adapter.addBulkContacts(config, job.data.queueId!, job.data.contacts ?? []);
        return;
      }
      if (action === "remove_single") {
        await adapter.removeSingleContact(config, job.data.contactId!);
        if (job.data.campaignId && job.data.contactId) {
          await db
            .update(campaignLeads)
            .set({ syncStatus: "failed", tabulation: "removed_from_dialer" })
            .where(
              and(
                eq(campaignLeads.campaignId, job.data.campaignId),
                eq(campaignLeads.externalLeadId, job.data.contactId)
              )
            );
        }
        return;
      }
      if (action === "remove_bulk") {
        await adapter.removeBulkContacts(config, job.data.queueId!);
      }
    },
    { connection }
  );

  new Worker<DialerResultsJobPayload>(
    "dialer-results-queue",
    async () => {
      const masterDb = getMasterDb();
      const activeTenants = await masterDb
        .select({ dbName: tenants.dbName })
        .from(tenants)
        .where(eq(tenants.isActive, true));

      for (const tenant of activeTenants) {
        const tenantDatabaseName = `tenant_${tenant.dbName}`;
        const db = getTenantDb(tenantDatabaseName);
        const activeIntegrations = await db
          .select({ id: integrations.id, provider: integrations.provider })
          .from(integrations)
          .where(eq(integrations.isActive, true));

        for (const integration of activeIntegrations) {
          try {
            const { config } = await loadIntegrationConfig(tenantDatabaseName, integration.id);
            const adapter = getDialerAdapter(integration.provider);
            const results = await adapter.fetchResults(config);
            const byContactId = results
              .map((r) => ({
                contactId: String(r.contactId ?? r.id ?? ""),
                tabulation:
                  r.tabulation == null ? null : String(r.tabulation),
              }))
              .filter((r) => r.contactId.length > 0);
            if (byContactId.length === 0) continue;

            const contactIds = byContactId.map((r) => r.contactId);
            await db
              .update(campaignLeads)
              .set({ syncStatus: "synced" })
              .where(inArray(campaignLeads.externalLeadId, contactIds));

            for (const row of byContactId) {
              if (!row.tabulation) continue;
              await db
                .update(campaignLeads)
                .set({ tabulation: row.tabulation })
                .where(eq(campaignLeads.externalLeadId, row.contactId));
              const normalized = row.tabulation.toLowerCase();
              if (normalized.includes("final")) {
                const mapped = await db
                  .select({ leadId: campaignLeads.leadId })
                  .from(campaignLeads)
                  .where(eq(campaignLeads.externalLeadId, row.contactId));
                const leadIds = mapped.map((m) => m.leadId);
                if (leadIds.length === 0) continue;
                await db
                  .update(leads)
                  .set({ status: "finalizado" })
                  .where(inArray(leads.id, leadIds));
              }
            }
          } catch (error) {
            logger.error("Erro ao processar polling de resultados Vonix", {
              tenantDatabaseName,
              integrationId: integration.id,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }
    },
    { connection }
  );

  void dialerResultsQueue.add(
    "dialer-results-polling",
    { runAt: new Date().toISOString() },
    {
      repeat: { every: 5 * 60 * 1000 },
      removeOnComplete: 100,
      removeOnFail: 100,
    }
  );
}
