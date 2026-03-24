import { BadRequestError, NotFoundError } from "@/errors/app-error.js";
import type { TenantDb } from "@/infra/database/tenant/connection-manager.js";
import type { LeadRepository } from "@/modules/leads/repositories/lead.repository.js";
import { getDialerAdapter } from "@/modules/integrations/dialers/dialer-factory.js";
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
    if (body.integrationId) {
      const integ = await this.integrationRepo.findById(db, body.integrationId);
      if (!integ) {
        throw new NotFoundError("Integração não encontrada.");
      }
      if (!integ.isActive) {
        throw new BadRequestError("Integração inativa.");
      }
    }
    return this.campaignRepo.create(db, {
      name: body.name,
      integrationId: body.integrationId ?? null,
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
    }
    const updated = await this.campaignRepo.update(db, id, {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.integrationId !== undefined ? { integrationId: body.integrationId } : {}),
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
    body: CampaignSyncLeadsBody
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
    if (candidateIds.length === 0) {
      throw new BadRequestError("Nenhum lead a sincronizar.");
    }

    const leads = await this.leadRepo.findManyByIds(db, candidateIds);
    const leadIds = leads.map((l) => l.id);
    if (leadIds.length === 0) {
      throw new BadRequestError("Nenhum lead válido encontrado.");
    }

    let integration = null;
    if (campaign.integrationId) {
      integration = await this.integrationRepo.findById(db, campaign.integrationId);
      if (!integration) {
        throw new NotFoundError("Integração da campanha não encontrada.");
      }
      if (!integration.isActive) {
        throw new BadRequestError("Integração inativa.");
      }
    }

    const provider = integration?.provider ?? "vonix";
    const adapter = getDialerAdapter(provider);

    await this.campaignRepo.update(db, campaignId, { status: "syncing" });
    await this.campaignRepo.upsertLeadsPending(db, campaignId, leadIds);

    let externalCampaignId = campaign.externalCampaignId;
    if (!externalCampaignId) {
      const created = await adapter.createCampaign({ name: campaign.name });
      externalCampaignId = created.externalCampaignId;
      await this.campaignRepo.update(db, campaignId, {
        externalCampaignId,
      });
    }

    const payload = leads.map((l) => ({
      leadId: l.id,
      phone: l.phone,
      name: l.name,
    }));

    const { externalLeadIdsByLeadId } = await adapter.sendLeads(externalCampaignId, payload);
    await this.campaignRepo.markLeadsSynced(db, campaignId, externalLeadIdsByLeadId);

    const updated = await this.campaignRepo.update(db, campaignId, { status: "active" });

    return {
      campaignId,
      syncedCount: Object.keys(externalLeadIdsByLeadId).length,
      status: updated?.status ?? "active",
    };
  }
}
