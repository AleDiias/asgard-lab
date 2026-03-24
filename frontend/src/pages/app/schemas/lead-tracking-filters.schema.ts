import { z } from "zod";

/**
 * Validação ao aplicar filtros na página de Leads (orquestração + Zod).
 * `importBatchId` deve ser `all` ou um UUID presente em `batchIds`.
 */
export function buildLeadTrackingFiltersApplySchema(batchIds: readonly string[]) {
  const idSet = new Set(batchIds);
  return z
    .object({
      importBatchId: z.union([
        z.literal("all"),
        z.string().uuid("ID de importação inválido."),
      ]),
    })
    .refine(
      (data) => data.importBatchId === "all" || idSet.has(data.importBatchId),
      {
        message: "Selecione um arquivo de importação válido.",
        path: ["importBatchId"],
      }
    );
}

export type LeadTrackingFiltersApplyValues = { importBatchId: string | "all" };

export function mapLeadTrackingFiltersFieldErrors(
  error: z.ZodError
): { importBatchId?: string } {
  const msg = error.flatten().fieldErrors.importBatchId?.[0];
  return msg ? { importBatchId: msg } : {};
}
