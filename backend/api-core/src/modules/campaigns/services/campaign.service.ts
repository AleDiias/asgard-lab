import crypto from "node:crypto";
import { BadRequestError, NotFoundError } from "@/errors/app-error.js";
import type { TenantDb } from "@/infra/database/tenant/connection-manager.js";
import { enqueueDialerSyncJob } from "@/infra/queue/enqueue.js";
import type { LeadRepository } from "@/modules/leads/repositories/lead.repository.js";
import type { IntegrationRepository } from "@/modules/integrations/repositories/integration.repository.js";
import type {
  CampaignCreateBody,
  CampaignSyncLeadsBody,
  CampaignUpdateBody,
} from "../schemas/campaign.schema.js";
import type { CampaignListRow, CampaignRepository } from "../repositories/campaign.repository.js";

export class CampaignService {
  constructor(
    private readonly campaignRepo: CampaignRepository,
    private readonly integrationRepo: IntegrationRepository,
    private readonly leadRepo: LeadRepository
  ) {}

  async create(db: TenantDb, body: CampaignCreateBody) {
    if (!body.integrationId && body.queueId) {
      throw new BadRequestError("queueId exige integração selecionada.");
    }
    if (body.integrationId) {
      const integ = await this.integrationRepo.findById(db, body.integrationId);
      if (!integ) {
        throw new NotFoundError("Integração não encontrada.");
      }
      if (!integ.isActive) {
        throw new BadRequestError("Integração inativa.");
      }
      if (body.queueId) {
        const queues = integ.queues ?? [];
        if (!queues.some((q) => q.id === body.queueId)) {
          throw new BadRequestError("Fila da integração inválida.");
        }
      }
    }
    return this.campaignRepo.create(db, {
      name: body.name,
      integrationId: body.integrationId ?? null,
      queueId: body.queueId ?? null,
      status: "draft",
    });
  }

  async list(db: TenantDb): Promise<CampaignListRow[]> {
    return this.campaignRepo.list(db);
  }

  async getById(
    db: TenantDb,
    id: string
  ): Promise<(CampaignListRow & { leadsCount: number }) | null> {
    const row = await this.campaignRepo.findById(db, id);
    if (!row) {
      return null;
    }
    let integrationName: string | null = null;
    let integrationProvider: string | null = null;
    if (row.integrationId) {
      const integ = await this.integrationRepo.findById(db, row.integrationId);
      if (integ) {
        integrationName = integ.name;
        integrationProvider = integ.provider;
      }
    }
    const leadsCount = await this.campaignRepo.countLeads(db, id);
    return {
      ...row,
      integrationName,
      integrationProvider,
      leadsCount,
    };
  }

  async update(db: TenantDb, id: string, body: CampaignUpdateBody) {
    const campaign = await this.campaignRepo.findById(db, id);
    if (!campaign) {
      throw new NotFoundError("Campanha não encontrada.");
    }
    if (body.integrationId !== undefined && body.integrationId !== null) {
      const integ = await this.integrationRepo.findById(db, body.integrationId);
      if (!integ) {
        throw new NotFoundError("Integração não encontrada.");
      }
      if (!integ.isActive) {
        throw new BadRequestError("Integração inativa.");
      }
      if (body.queueId && !(integ.queues ?? []).some((q) => q.id === body.queueId)) {
        throw new BadRequestError("Fila da integração inválida.");
      }
    }
    if (body.queueId !== undefined && body.integrationId === undefined) {
      if (!campaign.integrationId && body.queueId) {
        throw new BadRequestError("queueId exige integração selecionada.");
      }
      if (campaign.integrationId && body.queueId) {
        const integ = await this.integrationRepo.findById(db, campaign.integrationId);
        if (!integ || !(integ.queues ?? []).some((q) => q.id === body.queueId)) {
          throw new BadRequestError("Fila da integração inválida.");
        }
      }
    }
    if (body.integrationId === null && body.queueId) {
      throw new BadRequestError("queueId exige integração selecionada.");
    }
    const updated = await this.campaignRepo.update(db, id, {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.integrationId !== undefined ? { integrationId: body.integrationId } : {}),
      ...(body.queueId !== undefined ? { queueId: body.queueId } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    });
    if (!updated) {
      throw new NotFoundError("Campanha não encontrada.");
    }
    return updated;
  }

  async syncLeads(
    db: TenantDb,
    campaignId: string,
    body: CampaignSyncLeadsBody,
    tenantDatabaseName: string
  ): Promise<{ campaignId: string; syncedCount: number; status: string }> {
    const campaign = await this.campaignRepo.findById(db, campaignId);
    if (!campaign) {
      throw new NotFoundError("Campanha não encontrada.");
    }

    let candidateIds = [...new Set(body.leadIds ?? [])];
    if (body.importBatchId) {
      const batchIds = await this.leadRepo.listIdsByImportBatch(db, body.importBatchId);
      candidateIds = [...new Set([...candidateIds, ...batchIds])];
    }
    if (body.importBatchIds && body.importBatchIds.length > 0) {
      for (const importBatchId of body.importBatchIds) {
        const batchIds = await this.leadRepo.listIdsByImportBatch(db, importBatchId);
        candidateIds = [...new Set([...candidateIds, ...batchIds])];
      }
    }
    if (candidateIds.length === 0) {
      throw new BadRequestError("Nenhum lead a sincronizar.");
    }

    const leads = await this.leadRepo.findManyByIds(db, candidateIds);
    const leadIds = leads.map((l) => l.id);
    if (leadIds.length === 0) {
      throw new BadRequestError("Nenhum lead válido encontrado.");
    }

    if (!campaign.integrationId) {
      throw new BadRequestError("Campanha sem integração.");
    }
    if (!campaign.queueId) {
      throw new BadRequestError("Campanha sem fila (queueId).");
    }
    const integration = await this.integrationRepo.findById(db, campaign.integrationId);
    if (!integration) {
      throw new NotFoundError("Integração da campanha não encontrada.");
    }
    if (!integration.isActive) {
      throw new BadRequestError("Integração inativa.");
    }

    await this.campaignRepo.update(db, campaignId, { status: "syncing" });
    await this.campaignRepo.upsertLeadsPending(db, campaignId, leadIds);
    const payload = leads.map((l) => ({
      leadId: l.id,
      contactId: crypto.randomUUID(),
      phone: l.phone,
      name: l.name,
    }));
    await this.campaignRepo.markLeadsSynced(
      db,
      campaignId,
      Object.fromEntries(payload.map((p) => [p.leadId, p.contactId]))
    );

    if (payload.length === 1) {
      const p = payload[0]!;
      await enqueueDialerSyncJob({
        action: "add_single",
        tenantDatabaseName,
        integrationId: campaign.integrationId,
        campaignId,
        queueId: campaign.queueId,
        contactId: p.contactId,
        contactName: p.name,
        phone: p.phone,
      });
    } else {
      await enqueueDialerSyncJob({
        action: "add_bulk",
        tenantDatabaseName,
        integrationId: campaign.integrationId,
        campaignId,
        queueId: campaign.queueId,
        contacts: payload.map((p) => ({
          contactId: p.contactId,
          name: p.name,
          phone: p.phone,
        })),
      });
    }

    return {
      campaignId,
      syncedCount: payload.length,
      status: "syncing",
    };
  }
}
