import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { validateAndGetEnv } from "@/infra/env.js";
import * as masterSchema from "./schema.js";

const env = validateAndGetEnv();

export const masterPool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
});

export const masterDb = drizzle(masterPool, { schema: masterSchema });

const PG_IDENT_MAX = 63;

/**
 * Cria a base PostgreSQL do tenant com `pg` diretamente (autocommit).
 * `CREATE DATABASE` não pode correr dentro de uma transação; evitar `masterDb.execute`
 * reduz risco de falhas com alguns drivers / proxies.
 */
export async function createPostgresTenantDatabase(databaseName: string): Promise<void> {
  if (!/^tenant_[a-z0-9_]+$/.test(databaseName)) {
    throw new Error(`Nome de base inválido para provisionamento: ${databaseName}`);
  }
  if (databaseName.length > PG_IDENT_MAX) {
    throw new Error(
      `Nome de base excede o limite de ${PG_IDENT_MAX} caracteres do PostgreSQL.`
    );
  }
  const escaped = databaseName.replace(/"/g, '""');
  await masterPool.query(`CREATE DATABASE "${escaped}"`);
}
