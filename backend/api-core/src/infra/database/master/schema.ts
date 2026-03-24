import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Subconjunto do Master DB — apenas leitura para resolver `tenantId` / domínio → `db_name`.
 * Mantido alinhado com `api-auth` (`tenants`).
 */
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  domain: text("domain").notNull().unique(),
  dbName: text("db_name").notNull().unique(),
  features: jsonb("features").notNull().$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  companyName: text("company_name"),
  cnpj: text("cnpj"),
  billingDate: text("billing_date"),
  ownerEmail: text("owner_email"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
