import { coreApiClient } from "@/lib/core-api-client";
import type { IntegrationRecord } from "@/types/core-integrations.types";

function assertSuccess<T>(
  data: { success: true; data: T } | { success: false; error: { message: string } }
): asserts data is { success: true; data: T } {
  if (!data.success) {
    throw new Error(data.error.message);
  }
}

export async function listIntegrationsFn(options?: { activeOnly?: boolean }): Promise<
  IntegrationRecord[]
> {
  const { data } = await coreApiClient.get<
    { success: true; data: IntegrationRecord[] } | { success: false; error: { message: string } }
  >("/api/v1/integrations", {
    params: options?.activeOnly ? { activeOnly: "true" } : undefined,
  });
  assertSuccess(data);
  return data.data;
}

export async function updateIntegrationFn(
  id: string,
  body: {
    name?: string;
    isActive?: boolean;
    credentials?: { apiKey: string; baseUrl: string };
  }
): Promise<IntegrationRecord> {
  const { data } = await coreApiClient.patch<
    { success: true; data: IntegrationRecord } | { success: false; error: { message: string } }
  >(`/api/v1/integrations/${id}`, body);
  assertSuccess(data);
  return data.data;
}

export async function createIntegrationFn(body: {
  provider: IntegrationRecord["provider"];
  name: string;
  credentials: { apiKey: string; baseUrl: string };
  isActive?: boolean;
}): Promise<IntegrationRecord> {
  const { data } = await coreApiClient.post<
    { success: true; data: IntegrationRecord } | { success: false; error: { message: string } }
  >("/api/v1/integrations", body);
  assertSuccess(data);
  return data.data;
}
