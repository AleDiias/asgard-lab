import { z } from "zod";
import { leadStatusSchema } from "./lead.schema.js";

/** Linha já mapeada pelo cliente (CSV → campos do CRM). */
export const bulkLeadRowSchema = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().min(1).max(32),
  email: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  status: leadStatusSchema.optional(),
});

export const bulkImportBodySchema = z.object({
  /** Nome do ficheiro CSV (para histórico de importações no tenant). */
  fileName: z.string().min(1).max(512).optional(),
  leads: z.array(bulkLeadRowSchema).min(1).max(10_000),
});

export type BulkLeadRow = z.infer<typeof bulkLeadRowSchema>;
