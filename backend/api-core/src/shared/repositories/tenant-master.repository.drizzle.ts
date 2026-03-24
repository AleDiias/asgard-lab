import { eq } from "drizzle-orm";
import { getMasterDb } from "@/infra/database/master/connection.js";
import { tenants } from "@/infra/database/master/schema.js";
import type {
  TenantMasterEntity,
  TenantMasterRepository,
} from "./tenant-master.repository.js";

export class TenantMasterRepositoryDrizzle implements TenantMasterRepository {
  async findById(id: string): Promise<TenantMasterEntity | null> {
    const [row] = await getMasterDb()
      .select({
        id: tenants.id,
        domain: tenants.domain,
        dbName: tenants.dbName,
        isActive: tenants.isActive,
      })
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);

    if (!row) return null;
    return {
      id: row.id,
      domain: row.domain,
      dbName: row.dbName,
      active: row.isActive,
    };
  }

  async findByDomain(domain: string): Promise<TenantMasterEntity | null> {
    const normalized = domain.trim().toLowerCase();
    const [row] = await getMasterDb()
      .select({
        id: tenants.id,
        domain: tenants.domain,
        dbName: tenants.dbName,
        isActive: tenants.isActive,
      })
      .from(tenants)
      .where(eq(tenants.domain, normalized))
      .limit(1);

    if (!row) return null;
    return {
      id: row.id,
      domain: row.domain,
      dbName: row.dbName,
      active: row.isActive,
    };
  }
}

export const tenantMasterRepository = new TenantMasterRepositoryDrizzle();
