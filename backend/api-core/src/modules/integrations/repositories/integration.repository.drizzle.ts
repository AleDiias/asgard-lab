import { asc, desc, eq } from "drizzle-orm";
import type { TenantDb } from "@/infra/database/tenant/connection-manager.js";
import { integrations, type IntegrationInsert, type IntegrationRow } from "@/infra/database/tenant/schema.js";
import type { IntegrationRepository } from "./integration.repository.js";

export class IntegrationRepositoryDrizzle implements IntegrationRepository {
  async create(db: TenantDb, data: IntegrationInsert): Promise<IntegrationRow> {
    const [row] = await db.insert(integrations).values(data).returning();
    if (!row) {
      throw new Error("Falha ao criar integração.");
    }
    return row;
  }

  async list(db: TenantDb, options?: { activeOnly?: boolean }): Promise<IntegrationRow[]> {
    if (options?.activeOnly) {
      return db
        .select()
        .from(integrations)
        .where(eq(integrations.isActive, true))
        .orderBy(asc(integrations.name));
    }
    return db.select().from(integrations).orderBy(desc(integrations.createdAt));
  }

  async findById(db: TenantDb, id: string): Promise<IntegrationRow | null> {
    const [row] = await db.select().from(integrations).where(eq(integrations.id, id)).limit(1);
    return row ?? null;
  }

  async update(
    db: TenantDb,
    id: string,
    patch: {
      name?: string;
      isActive?: boolean;
      baseUrl?: string;
      credentials?: Record<string, unknown>;
      queues?: Array<{ id: string; name: string; description?: string | null }>;
      updatedAt?: Date;
    }
  ): Promise<IntegrationRow | null> {
    const [row] = await db
      .update(integrations)
      .set({
        ...patch,
        updatedAt: patch.updatedAt ?? new Date(),
      })
      .where(eq(integrations.id, id))
      .returning();
    return row ?? null;
  }
}
