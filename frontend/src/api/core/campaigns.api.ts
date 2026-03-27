import { coreApiClient } from "@/lib/core-api-client";
import type { CampaignDetailRecord, CampaignRecord, CampaignStatus } from "@/types/core-campaigns.types";

function assertSuccess<T>(
  data: { success: true; data: T } | { success: false; error: { message: string } }
): asserts data is { success: true; data: T } {
  if (!data.success) {
    throw new Error(data.error.message);
  }
}

export async function listCampaignsFn(): Promise<CampaignRecord[]> {
  const { data } = await coreApiClient.get<
    { success: true; data: CampaignRecord[] } | { success: false; error: { message: string } }
  >("/api/v1/campaigns");
  assertSuccess(data);
  return data.data;
}

export async function getCampaignByIdFn(id: string): Promise<CampaignDetailRecord> {
  const { data } = await coreApiClient.get<
    { success: true; data: CampaignDetailRecord } | { success: false; error: { message: string } }
  >(`/api/v1/campaigns/${id}`);
  assertSuccess(data);
  return data.data;
}

export async function updateCampaignFn(
  id: string,
  body: {
    name?: string;
    integrationId?: string | null;
    queueId?: string | null;
    status?: CampaignStatus;
  }
): Promise<CampaignRecord> {
  const { data } = await coreApiClient.patch<
    { success: true; data: CampaignRecord } | { success: false; error: { message: string } }
  >(`/api/v1/campaigns/${id}`, body);
  assertSuccess(data);
  return data.data;
}

export async function createCampaignFn(body: {
  name: string;
  integrationId?: string | null;
  queueId?: string | null;
}): Promise<CampaignRecord> {
  const { data } = await coreApiClient.post<
    { success: true; data: CampaignRecord } | { success: false; error: { message: string } }
  >("/api/v1/campaigns", body);
  assertSuccess(data);
  return data.data;
}

export async function syncCampaignLeadsFn(
  campaignId: string,
  body: { leadIds?: string[]; importBatchId?: string; importBatchIds?: string[] }
): Promise<{ campaignId: string; syncedCount: number; status: string }> {
  const { data } = await coreApiClient.post<
    | { success: true; data: { campaignId: string; syncedCount: number; status: string } }
    | { success: false; error: { message: string } }
  >(`/api/v1/campaigns/${campaignId}/leads/sync`, body);
  assertSuccess(data);
  return data.data;
}
