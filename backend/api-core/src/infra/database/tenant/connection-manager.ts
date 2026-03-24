import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { validateAndGetEnv } from "@/infra/env.js";
import * as tenantSchema from "./schema.js";

export type TenantDb = NodePgDatabase<typeof tenantSchema>;

const poolByDatabase = new Map<string, Pool>();
const dbByDatabase = new Map<string, TenantDb>();

function buildConnectionStringForDatabase(
  baseConnectionString: string,
  databaseName: string
): string {
  const url = new URL(baseConnectionString);
  url.pathname = `/${databaseName}`;
  return url.toString();
}

/**
 * Nome físico do banco PostgreSQL do tenant (ex.: `tenant_demo`).
 * O slug `dbName` no Master (`tenants.db_name`) não inclui o prefixo `tenant_`.
 */
export function toTenantDatabaseName(dbNameSlug: string): string {
  return `tenant_${dbNameSlug}`;
}

/**
 * Pool + Drizzle em cache por database físico.
 */
export function getTenantDb(databaseName: string): TenantDb {
  let db = dbByDatabase.get(databaseName);
  if (db) {
    return db;
  }

  const env = validateAndGetEnv();
  const connectionString = buildConnectionStringForDatabase(
    env.DATABASE_URL,
    databaseName
  );

  const pool = new Pool({
    connectionString,
    max: 10,
  });

  poolByDatabase.set(databaseName, pool);
  db = drizzle(pool, { schema: tenantSchema });
  dbByDatabase.set(databaseName, db);
  return db;
}
