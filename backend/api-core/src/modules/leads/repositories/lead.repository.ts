import type { TenantDb } from "@/infra/database/tenant/connection-manager.js";
import type { LeadImportBatchRow, LeadInsert, LeadRow } from "@/infra/database/tenant/schema.js";

export type LeadSortOption =
  | "created_at_desc"
  | "created_at_asc"
  | "name_asc"
  | "name_desc"
  | "phone_asc"
  | "phone_desc"
  | "status_asc"
  | "status_desc";

export interface LeadListParams {
  limit: number;
  offset: number;
  q?: string;
  status?: "novo" | "em_atendimento" | "finalizado";
  importBatchId?: string;
  sort?: LeadSortOption;
}

export interface LeadListResult {
  items: LeadRow[];
  total: number;
}

export type LeadUpdateFields = Partial<
  Pick<LeadInsert, "name" | "phone" | "email" | "status">
>;

export interface LeadMetricsSnapshot {
  totalLeads: number;
  novos: number;
  emAtendimento: number;
  finalizados: number;
  totalImportFiles: number;
  totalLinesImported: number;
}

export interface ImportBatchListParams {
  limit: number;
  offset: number;
}

export interface ImportBatchListResult {
  items: LeadImportBatchRow[];
  total: number;
}

export interface LeadRepository {
  create(db: TenantDb, data: LeadInsert): Promise<LeadRow>;
  findById(db: TenantDb, id: string): Promise<LeadRow | null>;
  remove(db: TenantDb, id: string): Promise<boolean>;
  list(db: TenantDb, params: LeadListParams): Promise<LeadListResult>;
  update(db: TenantDb, id: string, data: LeadUpdateFields): Promise<LeadRow | null>;
  bulkInsertSkipDuplicatePhones(db: TenantDb, rows: LeadInsert[]): Promise<number>;
  getMetrics(db: TenantDb): Promise<LeadMetricsSnapshot>;
  listImportBatches(db: TenantDb, params: ImportBatchListParams): Promise<ImportBatchListResult>;
  /** IDs de leads associados a um lote de importação. */
  listIdsByImportBatch(db: TenantDb, importBatchId: string): Promise<string[]>;
  findManyByIds(db: TenantDb, ids: string[]): Promise<LeadRow[]>;
}
