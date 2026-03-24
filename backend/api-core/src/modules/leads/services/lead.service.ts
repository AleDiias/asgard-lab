import { NotFoundError } from "@/errors/app-error.js";
import type { TenantDb } from "@/infra/database/tenant/connection-manager.js";
import type { LeadImportBatchRow, LeadRow } from "@/infra/database/tenant/schema.js";
import type { CreateLeadBody, ListLeadsQuery, UpdateLeadBody } from "../schemas/lead.schema.js";
import type { LeadRepository, LeadUpdateFields } from "../repositories/lead.repository.js";

export class LeadService {
  constructor(private readonly leadRepo: LeadRepository) {}

  async create(db: TenantDb, body: CreateLeadBody): Promise<LeadRow> {
    const email =
      body.email === undefined || body.email === "" ? null : body.email.trim().toLowerCase();

    return this.leadRepo.create(db, {
      name: body.name.trim(),
      phone: body.phone.trim(),
      email,
      status: body.status ?? "novo",
    });
  }

  async list(db: TenantDb, query: ListLeadsQuery): Promise<{
    items: LeadRow[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = query.page;
    const pageSize = query.pageSize;
    const offset = (page - 1) * pageSize;
    const { items, total } = await this.leadRepo.list(db, {
      limit: pageSize,
      offset,
      q: query.q?.trim() || undefined,
      status: query.status,
      importBatchId: query.importBatchId,
      sort: query.sort ?? "created_at_desc",
    });
    return { items, total, page, pageSize };
  }

  async getMetrics(db: TenantDb) {
    return this.leadRepo.getMetrics(db);
  }

  async listImportBatches(
    db: TenantDb,
    query: { page: number; pageSize: number }
  ): Promise<{
    items: LeadImportBatchRow[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const offset = (query.page - 1) * query.pageSize;
    const { items, total } = await this.leadRepo.listImportBatches(db, {
      limit: query.pageSize,
      offset,
    });
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async getById(db: TenantDb, id: string): Promise<LeadRow> {
    const lead = await this.leadRepo.findById(db, id);
    if (!lead) {
      throw new NotFoundError("Lead não encontrado.");
    }
    return lead;
  }

  async update(db: TenantDb, id: string, body: UpdateLeadBody): Promise<LeadRow> {
    const existing = await this.leadRepo.findById(db, id);
    if (!existing) {
      throw new NotFoundError("Lead não encontrado.");
    }

    const patch: LeadUpdateFields = {};
    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.phone !== undefined) patch.phone = body.phone.trim();
    if (body.email !== undefined) {
      patch.email =
        body.email === "" ? null : body.email.trim().toLowerCase();
    }
    if (body.status !== undefined) patch.status = body.status;

    const updated = await this.leadRepo.update(db, id, patch);
    if (!updated) {
      throw new NotFoundError("Lead não encontrado.");
    }
    return updated;
  }
}
