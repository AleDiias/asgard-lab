import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const asgardUsers = pgTable("asgard_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  /** `null` até o utilizador definir senha pelo link de ativação. */
  passwordHash: text("password_hash"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  domain: text("domain").notNull().unique(),
  dbName: text("db_name").notNull().unique(),
  features: jsonb("features").notNull().$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  /** Dados cadastrais exibidos no CRM (listagem/edição). */
  companyName: text("company_name"),
  cnpj: text("cnpj"),
  /** ISO `YYYY-MM-DD` */
  billingDate: text("billing_date"),
  ownerEmail: text("owner_email"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
