import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Schema Drizzle exclusivo dos bancos de tenant (Database-per-Tenant).
 * Tabela base de usuários do cliente; campos extras suportam JWT e forgot/reset.
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  /** `null` até o utilizador definir senha pelo link de ativação. */
  passwordHash: text("password_hash"),
  role: text("role").notNull(),
  /** Permissões RBAC serializadas no JWT para usuários de tenant */
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  passwordResetToken: text("password_reset_token"),
  passwordResetTokenExpiresAt: timestamp("password_reset_token_expires_at", {
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
