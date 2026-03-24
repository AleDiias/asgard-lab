import { eq } from "drizzle-orm";
import type { TenantDb } from "@/infra/database/tenant/connection-manager.js";
import { leadImportBatches } from "@/infra/database/tenant/schema.js";
import type { LeadInsert } from "@/infra/database/tenant/schema.js";
import type { BulkLeadRow } from "../schemas/import-leads.schema.js";
import type { LeadRepository } from "../repositories/lead.repository.js";

export interface ImportLeadsSummary {
  imported: number;
  duplicatesSkipped: number;
  invalidSkipped: number;
  /** Linhas válidas enviadas à base (após filtro de nome/telefone vazios). */
  attempted: number;
  batchId?: string;
}

export class ImportLeadsService {
  constructor(private readonly leadRepo: LeadRepository) {}

  async execute(
    db: TenantDb,
    input: { leads: BulkLeadRow[]; fileName?: string }
  ): Promise<ImportLeadsSummary> {
    const { leads: rows, fileName } = input;
    const { valid, invalidSkipped } = this.normalizeRows(rows);
    const attempted = valid.length;

    if (attempted === 0) {
      return {
        imported: 0,
        duplicatesSkipped: 0,
        invalidSkipped,
        attempted: 0,
      };
    }

    const trimmedFile = fileName?.trim();

    if (trimmedFile) {
      return await db.transaction(async (tx) => {
        const [batch] = await tx
          .insert(leadImportBatches)
          .values({
            fileName: trimmedFile,
            importedCount: 0,
            removedCount: 0,
          })
          .returning({ id: leadImportBatches.id });

        if (!batch) {
          throw new Error("Falha ao criar registo de importação.");
        }

        const withBatch: LeadInsert[] = valid.map((r) => ({
          ...r,
          importBatchId: batch.id,
        }));

        const imported = await this.leadRepo.bulkInsertSkipDuplicatePhones(tx, withBatch);
        const duplicatesSkipped = attempted - imported;

        await tx
          .update(leadImportBatches)
          .set({
            importedCount: imported,
            removedCount: duplicatesSkipped,
          })
          .where(eq(leadImportBatches.id, batch.id));

        return {
          imported,
          duplicatesSkipped,
          invalidSkipped,
          attempted,
          batchId: batch.id,
        };
      });
    }

    const imported = await this.leadRepo.bulkInsertSkipDuplicatePhones(db, valid);
    const duplicatesSkipped = attempted - imported;

    return {
      imported,
      duplicatesSkipped,
      invalidSkipped,
      attempted,
    };
  }

  private normalizeRows(rows: BulkLeadRow[]): {
    valid: LeadInsert[];
    invalidSkipped: number;
  } {
    const valid: LeadInsert[] = [];
    let invalidSkipped = 0;

    for (const r of rows) {
      const name = r.name.trim();
      const phone = r.phone.trim();
      if (!name || !phone) {
        invalidSkipped++;
        continue;
      }

      let email: string | null = null;
      if (r.email !== undefined && r.email !== null && r.email !== "") {
        email = String(r.email).trim().toLowerCase();
      }

      valid.push({
        name,
        phone,
        email,
        status: r.status ?? "novo",
      });
    }

    return { valid, invalidSkipped };
  }
}
