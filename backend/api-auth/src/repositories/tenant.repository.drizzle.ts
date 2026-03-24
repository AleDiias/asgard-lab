import { eq } from "drizzle-orm";
import { masterDb } from "@/infra/database/master/connection.js";
import { tenants } from "@/infra/database/master/schema.js";
import type { TenantEntity, TenantRepository } from "./tenant.repository.js";

export class TenantRepositoryDrizzle implements TenantRepository {
  async findByDomain(domain: string): Promise<TenantEntity | null> {
    const normalized = domain.trim().toLowerCase();
    const [row] = await masterDb
      .select({
        id: tenants.id,
        domain: tenants.domain,
        dbName: tenants.dbName,
        features: tenants.features,
        isActive: tenants.isActive,
      })
      .from(tenants)
      .where(eq(tenants.domain, normalized))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      domain: row.domain,
      dbName: row.dbName,
      features: row.features ?? [],
      active: row.isActive,
    };
  }
}
