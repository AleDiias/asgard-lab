import type { TenantDb } from "@/infra/database/tenant/connection-manager.js";
import type { IntegrationInsert, IntegrationRow } from "@/infra/database/tenant/schema.js";

export interface IntegrationRepository {
  create(db: TenantDb, data: IntegrationInsert): Promise<IntegrationRow>;
  list(db: TenantDb, options?: { activeOnly?: boolean }): Promise<IntegrationRow[]>;
  findById(db: TenantDb, id: string): Promise<IntegrationRow | null>;
  update(
    db: TenantDb,
    id: string,
    patch: {
      name?: string;
      isActive?: boolean;
      credentials?: Record<string, unknown>;
      updatedAt?: Date;
    }
  ): Promise<IntegrationRow | null>;
}
