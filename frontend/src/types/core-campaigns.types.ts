export type CampaignStatus = "draft" | "syncing" | "active" | "paused" | "completed";

export interface CampaignRecord {
  id: string;
  integrationId: string | null;
  name: string;
  externalCampaignId: string | null;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  integrationName: string | null;
  integrationProvider: string | null;
}

/** Detalhe para edição (GET /campaigns/:id). */
export interface CampaignDetailRecord extends CampaignRecord {
  leadsCount: number;
}
