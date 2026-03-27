import type { TenantDb } from "@/infra/database/tenant/connection-manager.js";
import type { CampaignInsert, CampaignRow } from "@/infra/database/tenant/schema.js";

export type CampaignListRow = CampaignRow & {
  integrationName: string | null;
  integrationProvider: string | null;
};

export interface CampaignRepository {
  create(db: TenantDb, data: CampaignInsert): Promise<CampaignRow>;
  list(db: TenantDb): Promise<CampaignListRow[]>;
  findById(db: TenantDb, id: string): Promise<CampaignRow | null>;
  update(
    db: TenantDb,
    id: string,
    patch: Partial<
      Pick<CampaignRow, "name" | "status" | "externalCampaignId" | "integrationId" | "queueId">
    > & {
      updatedAt?: Date;
    }
  ): Promise<CampaignRow | null>;
  countLeads(db: TenantDb, campaignId: string): Promise<number>;
  upsertLeadsPending(db: TenantDb, campaignId: string, leadIds: string[]): Promise<void>;
  markLeadsSynced(
    db: TenantDb,
    campaignId: string,
    externalLeadIdsByLeadId: Record<string, string>
  ): Promise<void>;
}
