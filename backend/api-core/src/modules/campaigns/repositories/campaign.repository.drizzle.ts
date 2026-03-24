import { and, count, desc, eq } from "drizzle-orm";
import type { TenantDb } from "@/infra/database/tenant/connection-manager.js";
import {
  campaignLeads,
  campaigns,
  integrations,
  type CampaignInsert,
  type CampaignRow,
} from "@/infra/database/tenant/schema.js";
import type { CampaignListRow, CampaignRepository } from "./campaign.repository.js";

export class CampaignRepositoryDrizzle implements CampaignRepository {
  async create(db: TenantDb, data: CampaignInsert): Promise<CampaignRow> {
    const [row] = await db.insert(campaigns).values(data).returning();
    if (!row) {
      throw new Error("Falha ao criar campanha.");
    }
    return row;
  }

  async list(db: TenantDb): Promise<CampaignListRow[]> {
    const rows = await db
      .select({
        campaign: campaigns,
        integrationName: integrations.name,
        integrationProvider: integrations.provider,
      })
      .from(campaigns)
      .leftJoin(integrations, eq(campaigns.integrationId, integrations.id))
      .orderBy(desc(campaigns.createdAt));

    return rows.map((r) => ({
      ...r.campaign,
      integrationName: r.integrationName,
      integrationProvider: r.integrationProvider,
    }));
  }

  async findById(db: TenantDb, id: string): Promise<CampaignRow | null> {
    const [row] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
    return row ?? null;
  }

  async update(
    db: TenantDb,
    id: string,
    patch: Partial<
      Pick<CampaignRow, "name" | "status" | "externalCampaignId" | "integrationId">
    > & {
      updatedAt?: Date;
    }
  ): Promise<CampaignRow | null> {
    const [row] = await db
      .update(campaigns)
      .set({
        ...patch,
        updatedAt: patch.updatedAt ?? new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();
    return row ?? null;
  }

  async countLeads(db: TenantDb, campaignId: string): Promise<number> {
    const [row] = await db
      .select({ c: count() })
      .from(campaignLeads)
      .where(eq(campaignLeads.campaignId, campaignId));
    return Number(row?.c ?? 0);
  }

  async upsertLeadsPending(db: TenantDb, campaignId: string, leadIds: string[]): Promise<void> {
    if (leadIds.length === 0) {
      return;
    }
    const now = new Date();
    const values = leadIds.map((leadId) => ({
      campaignId,
      leadId,
      syncStatus: "pending" as const,
      updatedAt: now,
    }));
    await db
      .insert(campaignLeads)
      .values(values)
      .onConflictDoUpdate({
        target: [campaignLeads.campaignId, campaignLeads.leadId],
        set: { syncStatus: "pending", updatedAt: now },
      });
  }

  async markLeadsSynced(
    db: TenantDb,
    campaignId: string,
    externalLeadIdsByLeadId: Record<string, string>
  ): Promise<void> {
    const now = new Date();
    for (const [leadId, externalLeadId] of Object.entries(externalLeadIdsByLeadId)) {
      await db
        .update(campaignLeads)
        .set({
          syncStatus: "synced",
          externalLeadId,
          updatedAt: now,
        })
        .where(
          and(eq(campaignLeads.campaignId, campaignId), eq(campaignLeads.leadId, leadId))
        );
    }
  }
}
