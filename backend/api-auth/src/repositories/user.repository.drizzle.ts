import { and, eq, gt, isNotNull, sql } from "drizzle-orm";
import { masterDb } from "@/infra/database/master/connection.js";
import { tenants } from "@/infra/database/master/schema.js";
import {
  getTenantDb,
  toTenantDatabaseName,
} from "@/infra/database/tenant/connection-manager.js";
import { runTenantMigrations } from "@/infra/database/tenant/migrator.js";
import { users } from "@/infra/database/tenant/schema.js";
import { asc } from "drizzle-orm";
import type {
  CreateInvitedTenantUserInput,
  TenantUserListItem,
  UserEntity,
  UserRepository,
} from "./user.repository.js";

const MASTER_TENANT_ID = "master";

/** Tokens de reset para fluxo Asgard (Master); armazenamento em memória no processo. */
const masterResetByToken = new Map<
  string,
  { userId: string; email: string; expiresAt: Date }
>();
const authMigrationsByDatabase = new Map<string, Promise<void>>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function resolveTenantDatabaseName(tenantId: string): Promise<string> {
  const [row] = await masterDb
    .select({ dbName: tenants.dbName })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!row) {
    throw new Error("Tenant não encontrado.");
  }

  return toTenantDatabaseName(row.dbName);
}

async function ensureTenantAuthSchema(databaseName: string): Promise<void> {
  let p = authMigrationsByDatabase.get(databaseName);
  if (!p) {
    p = runTenantMigrations(databaseName).catch((error) => {
      authMigrationsByDatabase.delete(databaseName);
      throw error;
    });
    authMigrationsByDatabase.set(databaseName, p);
  }
  await p;
}

export class UserRepositoryDrizzle implements UserRepository {
  private tenantDb(tenantId: string) {
    if (tenantId === MASTER_TENANT_ID) {
      return null;
    }
    return resolveTenantDatabaseName(tenantId).then(async (dbName) => {
      await ensureTenantAuthSchema(dbName);
      return getTenantDb(dbName);
    });
  }

  async findByEmail(tenantId: string, email: string): Promise<UserEntity | null> {
    const normalized = normalizeEmail(email);

    if (tenantId === MASTER_TENANT_ID) {
      return null;
    }

    const db = await this.tenantDb(tenantId);
    if (!db) {
      return null;
    }

    const [row] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        passwordHash: users.passwordHash,
        role: users.role,
        permissions: users.permissions,
        isActive: users.isActive,
      })
      .from(users)
      .where(
        and(
          sql`lower(${users.email}) = ${normalized}`,
          eq(users.isActive, true)
        )
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash ?? null,
      role: row.role,
      permissions: row.permissions ?? [],
    };
  }

  async createInvitedUser(
    tenantId: string,
    input: CreateInvitedTenantUserInput
  ): Promise<{ id: string }> {
    if (tenantId === MASTER_TENANT_ID) {
      throw new Error("Não é possível criar utilizador de tenant no contexto master.");
    }

    const db = await this.tenantDb(tenantId);
    if (!db) {
      throw new Error("Tenant não encontrado.");
    }

    const normalized = normalizeEmail(input.email);

    const [created] = await db
      .insert(users)
      .values({
        name: input.name.trim(),
        email: normalized,
        passwordHash: null,
        role: input.role,
        permissions: input.permissions,
        isActive: true,
      })
      .returning({ id: users.id });

    if (!created) {
      throw new Error("Falha ao criar utilizador.");
    }

    return { id: created.id };
  }

  async updatePassword(
    tenantId: string,
    userId: string,
    passwordHash: string
  ): Promise<void> {
    if (tenantId === MASTER_TENANT_ID) {
      return;
    }

    const db = await this.tenantDb(tenantId);
    if (!db) {
      return;
    }

    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId));
  }

  async savePasswordResetToken(
    tenantId: string,
    email: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    const normalized = normalizeEmail(email);

    if (tenantId === MASTER_TENANT_ID) {
      masterResetByToken.set(token, {
        userId: "asgard-reset",
        email: normalized,
        expiresAt,
      });
      return;
    }

    const db = await this.tenantDb(tenantId);
    if (!db) {
      return;
    }

    await db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetTokenExpiresAt: expiresAt,
      })
      .where(sql`lower(${users.email}) = ${normalized}`);
  }

  async findByPasswordResetToken(
    tenantId: string,
    token: string
  ): Promise<{ userId: string; email: string } | null> {
    if (tenantId === MASTER_TENANT_ID) {
      const data = masterResetByToken.get(token);
      if (!data || data.expiresAt < new Date()) {
        return null;
      }
      return { userId: data.userId, email: data.email };
    }

    const db = await this.tenantDb(tenantId);
    if (!db) {
      return null;
    }

    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, token),
          isNotNull(users.passwordResetTokenExpiresAt),
          gt(users.passwordResetTokenExpiresAt, new Date())
        )
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return { userId: row.id, email: row.email };
  }

  async invalidatePasswordResetToken(tenantId: string, token: string): Promise<void> {
    if (tenantId === MASTER_TENANT_ID) {
      masterResetByToken.delete(token);
      return;
    }

    const db = await this.tenantDb(tenantId);
    if (!db) {
      return;
    }

    await db
      .update(users)
      .set({
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
      })
      .where(eq(users.passwordResetToken, token));
  }

  async listTenantUsers(tenantId: string): Promise<TenantUserListItem[]> {
    if (tenantId === MASTER_TENANT_ID) {
      return [];
    }

    const db = await this.tenantDb(tenantId);
    if (!db) {
      return [];
    }

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        permissions: users.permissions,
        isActive: users.isActive,
      })
      .from(users)
      .orderBy(asc(users.name));

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      permissions: r.permissions ?? [],
      isActive: r.isActive,
    }));
  }

  async findTenantUserById(
    tenantId: string,
    userId: string
  ): Promise<(UserEntity & { name: string; isActive: boolean }) | null> {
    if (tenantId === MASTER_TENANT_ID) {
      return null;
    }

    const db = await this.tenantDb(tenantId);
    if (!db) {
      return null;
    }

    const [row] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        passwordHash: users.passwordHash,
        role: users.role,
        permissions: users.permissions,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash ?? null,
      role: row.role,
      permissions: row.permissions ?? [],
      isActive: row.isActive,
    };
  }

  async updateTenantUserPermissions(
    tenantId: string,
    userId: string,
    permissions: string[]
  ): Promise<void> {
    if (tenantId === MASTER_TENANT_ID) {
      return;
    }

    const db = await this.tenantDb(tenantId);
    if (!db) {
      return;
    }

    await db
      .update(users)
      .set({ permissions })
      .where(eq(users.id, userId));
  }

  async setTenantUserActive(
    tenantId: string,
    userId: string,
    isActive: boolean
  ): Promise<void> {
    if (tenantId === MASTER_TENANT_ID) {
      return;
    }

    const db = await this.tenantDb(tenantId);
    if (!db) {
      return;
    }

    await db.update(users).set({ isActive }).where(eq(users.id, userId));
  }
}
