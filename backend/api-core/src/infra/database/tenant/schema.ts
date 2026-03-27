import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Estados do lead no CRM (por tenant).
 */
export const leadStatusEnum = pgEnum("lead_status", [
  "novo",
  "em_atendimento",
  "finalizado",
]);

/**
 * Registo de um ficheiro CSV importado (estatísticas agregadas).
 */
export const leadImportBatches = pgTable("lead_import_batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileName: text("file_name").notNull(),
  importedCount: integer("imported_count").notNull(),
  removedCount: integer("removed_count").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Schema Drizzle exclusivo dos Tenant DBs (api-core).
 */
export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  /** Único por base (tenant). */
  phone: text("phone").notNull().unique(),
  email: text("email"),
  status: leadStatusEnum("status").notNull().default("novo"),
  /** Origem do mailing (quando importado com ficheiro). */
  importBatchId: uuid("import_batch_id").references(() => leadImportBatches.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LeadRow = typeof leads.$inferSelect;
export type LeadInsert = typeof leads.$inferInsert;

export type LeadImportBatchRow = typeof leadImportBatches.$inferSelect;

/** Provedor de discador parceiro (orquestração — sem discagem nativa). */
export const dialerProviderEnum = pgEnum("dialer_provider", [
  "vonix",
  "aspect",
  "3c",
  "custom",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "syncing",
  "active",
  "paused",
  "completed",
]);

export const campaignLeadSyncStatusEnum = pgEnum("campaign_lead_sync_status", [
  "pending",
  "synced",
  "failed",
]);

/**
 * Credenciais e URL base do parceiro (JSON — cifrado em camadas superiores quando aplicável).
 * Ex.: `{ "apiKey": "...", "baseUrl": "https://api.partner.com" }`
 */
export const integrations = pgTable("integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: dialerProviderEnum("provider").notNull(),
  name: text("name").notNull(),
  baseUrl: text("base_url").notNull(),
  credentials: jsonb("credentials").notNull().default({}),
  queues: jsonb("queues").$type<Array<{ id: string; name: string; description?: string | null }>>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  /** Opcional até o tenant associar uma integração ativa. */
  integrationId: uuid("integration_id").references(() => integrations.id),
  queueId: text("queue_id"),
  name: text("name").notNull(),
  externalCampaignId: text("external_campaign_id"),
  status: campaignStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const campaignLeads = pgTable(
  "campaign_leads",
  {
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    syncStatus: campaignLeadSyncStatusEnum("sync_status").notNull().default("pending"),
    externalLeadId: text("external_lead_id"),
    tabulation: text("tabulation"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.campaignId, t.leadId] }),
  })
);

export type IntegrationRow = typeof integrations.$inferSelect;
export type IntegrationInsert = typeof integrations.$inferInsert;
export type CampaignRow = typeof campaigns.$inferSelect;
export type CampaignInsert = typeof campaigns.$inferInsert;
export type CampaignLeadRow = typeof campaignLeads.$inferSelect;
export type CampaignLeadInsert = typeof campaignLeads.$inferInsert;
