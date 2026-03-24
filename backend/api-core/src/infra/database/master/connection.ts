import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { validateAndGetEnv } from "@/infra/env.js";
import * as masterSchema from "./schema.js";

type MasterSchema = typeof masterSchema;
type MasterDb = NodePgDatabase<MasterSchema>;

let masterPool: Pool | undefined;
let masterDb: MasterDb | undefined;

/**
 * Pool do Master DB (lazy): evita `validateAndGetEnv()` no carregamento do módulo,
 * para que o `server.ts` possa validar o ambiente após o Bun carregar `.env`.
 */
export function getMasterPool(): Pool {
  if (!masterPool) {
    const env = validateAndGetEnv();
    masterPool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 5,
    });
  }
  return masterPool;
}

export function getMasterDb(): MasterDb {
  if (!masterDb) {
    masterDb = drizzle(getMasterPool(), { schema: masterSchema });
  }
  return masterDb;
}
