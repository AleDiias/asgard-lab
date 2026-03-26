import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { ConflictError } from "@/errors/app-error.js";
import type { TenantDb } from "@/infra/database/tenant/connection-manager.js";
import {
  leadImportBatches,
  leads,
  type LeadInsert,
  type LeadRow,
} from "@/infra/database/tenant/schema.js";
import { isPgUniqueViolation } from "@/utils/pg-error.js";
import type {
  ImportBatchListParams,
  ImportBatchListResult,
  LeadListParams,
  LeadListResult,
  LeadMetricsSnapshot,
  LeadRepository,
  LeadUpdateFields,
} from "./lead.repository.js";

const BULK_INSERT_CHUNK = 250;

function sanitizeLikeFragment(raw: string): string {
  return raw.replace(/[%_\\]/g, "").trim();
}

export class LeadRepositoryDrizzle implements LeadRepository {
  async create(db: TenantDb, data: LeadInsert): Promise<LeadRow> {
    try {
      const [row] = await db.insert(leads).values(data).returning();
      if (!row) {
        throw new Error("Falha ao criar lead.");
      }
      return row;
    } catch (e) {
      if (isPgUniqueViolation(e)) {
        throw new ConflictError("Já existe um lead com este telefone.");
      }
      throw e;
    }
  }

  async findById(db: TenantDb, id: string): Promise<LeadRow | null> {
    const [row] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return row ?? null;
  }

  async remove(db: TenantDb, id: string): Promise<boolean> {
    const deleted = await db.delete(leads).where(eq(leads.id, id)).returning({ id: leads.id });
    return deleted.length > 0;
  }

  async list(db: TenantDb, params: LeadListParams): Promise<LeadListResult> {
    const conditions = [];

    const q = params.q ? sanitizeLikeFragment(params.q) : "";
    if (q.length > 0) {
      const pattern = `%${q}%`;
      conditions.push(
        or(
          ilike(leads.name, pattern),
          ilike(leads.phone, pattern),
          ilike(leads.email, pattern)
        )
      );
    }

    if (params.status) {
      conditions.push(eq(leads.status, params.status));
    }

    if (params.importBatchId) {
      conditions.push(eq(leads.importBatchId, params.importBatchId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ value: totalRaw }] = await db
      .select({ value: count() })
      .from(leads)
      .where(whereClause);
    const total = Number(totalRaw);

    const orderBy = (() => {
      switch (params.sort) {
        case "created_at_asc":
          return [asc(leads.createdAt)];
        case "name_asc":
          return [asc(leads.name)];
        case "name_desc":
          return [desc(leads.name)];
        case "phone_asc":
          return [asc(leads.phone)];
        case "phone_desc":
          return [desc(leads.phone)];
        case "status_asc":
          return [asc(leads.status)];
        case "status_desc":
          return [desc(leads.status)];
        case "created_at_desc":
        default:
          return [desc(leads.createdAt)];
      }
    })();

    const items = await db
      .select()
      .from(leads)
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(params.limit)
      .offset(params.offset);

    return { items, total };
  }

  async update(db: TenantDb, id: string, data: LeadUpdateFields): Promise<LeadRow | null> {
    try {
      const [row] = await db
        .update(leads)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, id))
        .returning();
      return row ?? null;
    } catch (e) {
      if (isPgUniqueViolation(e)) {
        throw new ConflictError("Já existe um lead com este telefone.");
      }
      throw e;
    }
  }

  async bulkInsertSkipDuplicatePhones(db: TenantDb, rows: LeadInsert[]): Promise<number> {
    let imported = 0;
    for (let i = 0; i < rows.length; i += BULK_INSERT_CHUNK) {
      const slice = rows.slice(i, i + BULK_INSERT_CHUNK);
      const inserted = await db
        .insert(leads)
        .values(slice)
        .onConflictDoNothing({ target: leads.phone })
        .returning({ id: leads.id });
      imported += inserted.length;
    }
    return imported;
  }

  async getMetrics(db: TenantDb): Promise<LeadMetricsSnapshot> {
    const [{ c: totalLeads }] = await db.select({ c: count() }).from(leads);

    const [{ c: novos }] = await db
      .select({ c: count() })
      .from(leads)
      .where(eq(leads.status, "novo"));

    const [{ c: emAtendimento }] = await db
      .select({ c: count() })
      .from(leads)
      .where(eq(leads.status, "em_atendimento"));

    const [{ c: finalizados }] = await db
      .select({ c: count() })
      .from(leads)
      .where(eq(leads.status, "finalizado"));

    const [{ c: totalImportFiles }] = await db.select({ c: count() }).from(leadImportBatches);

    const [sumRow] = await db
      .select({
        lines: sql<number>`coalesce(sum(${leadImportBatches.importedCount}), 0)::int`,
      })
      .from(leadImportBatches);

    return {
      totalLeads: Number(totalLeads),
      novos: Number(novos),
      emAtendimento: Number(emAtendimento),
      finalizados: Number(finalizados),
      totalImportFiles: Number(totalImportFiles),
      totalLinesImported: Number(sumRow?.lines ?? 0),
    };
  }

  async listImportBatches(
    db: TenantDb,
    params: ImportBatchListParams
  ): Promise<ImportBatchListResult> {
    const [{ c: totalRaw }] = await db.select({ c: count() }).from(leadImportBatches);
    const total = Number(totalRaw);

    const items = await db
      .select()
      .from(leadImportBatches)
      .orderBy(desc(leadImportBatches.createdAt))
      .limit(params.limit)
      .offset(params.offset);

    return { items, total };
  }

  async listIdsByImportBatch(db: TenantDb, importBatchId: string): Promise<string[]> {
    const rows = await db
      .select({ id: leads.id })
      .from(leads)
      .where(eq(leads.importBatchId, importBatchId));
    return rows.map((r) => r.id);
  }

  async findManyByIds(db: TenantDb, ids: string[]): Promise<LeadRow[]> {
    if (ids.length === 0) {
      return [];
    }
    return db.select().from(leads).where(inArray(leads.id, ids));
  }
}
