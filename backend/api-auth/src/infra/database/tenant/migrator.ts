import { migrate } from "drizzle-orm/node-postgres/migrator";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getTenantDb } from "./connection-manager.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Aplica migrations do schema de tenant no banco indicado.
 * @param databaseName Nome físico do database PostgreSQL (ex.: `tenant_acme_localhost`).
 */
export async function runTenantMigrations(databaseName: string): Promise<void> {
  const db = getTenantDb(databaseName);
  const migrationsFolder = join(__dirname, "migrations");
  await migrate(db, { migrationsFolder });
}
