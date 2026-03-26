import { isAxiosError } from "axios";
import { coreApiClient } from "@/lib/core-api-client";
import type {
  LeadBulkImportResponse,
  LeadBulkImportSummary,
  LeadBulkRowPayload,
  LeadImportBatchRecord,
  LeadMetricsSnapshot,
  LeadRecord,
} from "@/types/core-leads.types";

function assertBulkSuccess(
  data: LeadBulkImportResponse
): asserts data is { success: true; data: LeadBulkImportSummary } {
  if (!data.success) {
    throw new Error(data.error.message);
  }
}

function assertSuccess<T>(
  data: { success: true; data: T } | { success: false; error: { message: string } }
): asserts data is { success: true; data: T } {
  if (!data.success) {
    throw new Error(data.error.message);
  }
}

/**
 * Importação em lote (payload já mapeado no browser).
 * Requer permissão `leads.write` e api-core em execução.
 */
export async function importLeadsBulkFn(
  leads: LeadBulkRowPayload[],
  options?: { fileName?: string }
): Promise<LeadBulkImportSummary> {
  try {
    const { data } = await coreApiClient.post<LeadBulkImportResponse>("/api/v1/leads/bulk", {
      leads,
      ...(options?.fileName ? { fileName: options.fileName } : {}),
    });
    assertBulkSuccess(data);
    return data.data;
  } catch (e) {
    if (isAxiosError(e) && e.response?.data && typeof e.response.data === "object") {
      const body = e.response.data as { error?: { message?: string } };
      const msg = body.error?.message;
      if (msg) throw new Error(msg);
    }
    throw e instanceof Error ? e : new Error("Falha ao importar leads.");
  }
}

export async function getLeadMetricsFn(): Promise<LeadMetricsSnapshot> {
  const { data } = await coreApiClient.get<
    { success: true; data: LeadMetricsSnapshot } | { success: false; error: { message: string } }
  >("/api/v1/leads/metrics");
  assertSuccess(data);
  return data.data;
}

export interface ListLeadsParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: "novo" | "em_atendimento" | "finalizado";
  importBatchId?: string;
  sort?:
    | "created_at_desc"
    | "created_at_asc"
    | "name_asc"
    | "name_desc"
    | "phone_asc"
    | "phone_desc"
    | "status_asc"
    | "status_desc";
}

export async function listLeadsFn(params: ListLeadsParams): Promise<{
  items: LeadRecord[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const { data } = await coreApiClient.get<
    | { success: true; data: { items: LeadRecord[]; total: number; page: number; pageSize: number } }
    | { success: false; error: { message: string } }
  >("/api/v1/leads", { params });
  assertSuccess(data);
  return data.data;
}

export async function listImportBatchesFn(params: {
  page?: number;
  pageSize?: number;
}): Promise<{ items: LeadImportBatchRecord[]; total: number; page: number; pageSize: number }> {
  const { data } = await coreApiClient.get<
    | {
        success: true;
        data: { items: LeadImportBatchRecord[]; total: number; page: number; pageSize: number };
      }
    | { success: false; error: { message: string } }
  >("/api/v1/leads/import-batches", { params });
  assertSuccess(data);
  return data.data;
}

export async function deleteLeadFn(id: string): Promise<void> {
  const { data } = await coreApiClient.delete<
    | { success: true; data: { ok: true } }
    | { success: false; error: { message: string } }
  >(`/api/v1/leads/${id}`);
  assertSuccess(data);
}
