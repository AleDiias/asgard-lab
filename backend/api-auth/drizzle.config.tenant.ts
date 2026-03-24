import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL não definida para o Drizzle (tenant).");
}

export default defineConfig({
  schema: "./src/infra/database/tenant/schema.ts",
  out: "./src/infra/database/tenant/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
