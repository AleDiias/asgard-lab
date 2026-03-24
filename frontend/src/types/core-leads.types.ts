/** Corpo enviado para `POST /api/v1/leads/bulk`. */
export interface LeadBulkRowPayload {
  name: string;
  phone: string;
  email?: string | null;
  status?: "novo" | "em_atendimento" | "finalizado";
}

/** Resumo devolvido pela api-core após importação em lote. */
export interface LeadBulkImportSummary {
  imported: number;
  duplicatesSkipped: number;
  invalidSkipped: number;
  attempted: number;
  batchId?: string;
}

/** `GET /api/v1/leads/metrics` */
export interface LeadMetricsSnapshot {
  totalLeads: number;
  novos: number;
  emAtendimento: number;
  finalizados: number;
  totalImportFiles: number;
  totalLinesImported: number;
}

/** Registo de importação (`lead_import_batches`). */
export interface LeadImportBatchRecord {
  id: string;
  fileName: string;
  importedCount: number;
  removedCount: number;
  createdAt: string;
}

/** Lead devolvido pela API. */
export interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: "novo" | "em_atendimento" | "finalizado";
  importBatchId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LeadBulkImportResponse =
  | { success: true; data: LeadBulkImportSummary }
  | { success: false; error: { message: string } };
