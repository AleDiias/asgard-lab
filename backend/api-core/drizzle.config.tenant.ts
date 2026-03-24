import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/** Carrega `backend/api-core/.env` (dotenv). Para um tenant concreto, use a URL desse banco (ex. `tenant_demo`), não o master. */
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL não definida para o Drizzle (tenant — api-core). " +
      "Crie `backend/api-core/.env` a partir de `.env.example` ou execute: " +
      'DATABASE_URL="postgres://user:pass@127.0.0.1:5432/tenant_xxx" bun run db:migrate:tenant'
  );
}

export default defineConfig({
  schema: "./src/infra/database/tenant/schema.ts",
  out: "./src/infra/database/tenant/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
