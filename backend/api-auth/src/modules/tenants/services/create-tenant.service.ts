import crypto from "node:crypto";
import { createPostgresTenantDatabase } from "@/infra/database/master/connection.js";
import { users } from "@/infra/database/tenant/schema.js";
import { getTenantDb, toTenantDatabaseName } from "@/infra/database/tenant/connection-manager.js";
import { runTenantMigrations } from "@/infra/database/tenant/migrator.js";
import { ConflictError } from "@/errors/app-error.js";
import { sendTokenEmail } from "@/infra/email.js";
import type { UserRepository } from "@/repositories/user.repository.js";
import type { TenantAdminRepository } from "@/modules/tenants/repositories/tenant-admin.repository.js";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

export interface CreateTenantServiceInput {
  domain: string;
  features: string[];
  adminEmail: string;
  adminName?: string;
  companyName?: string;
  cnpj?: string;
  billingDate?: string;
  phone?: string;
}

export class CreateTenantService {
  constructor(
    private readonly tenantRepo: TenantAdminRepository,
    private readonly userRepo: UserRepository
  ) {}

  async execute(input: CreateTenantServiceInput) {
    const domain = input.domain.trim().toLowerCase();
    const adminEmail = input.adminEmail.trim().toLowerCase();
    const adminName =
      input.adminName?.trim() && input.adminName.trim().length > 0
        ? input.adminName.trim()
        : "Administrator";

    const existing = await this.tenantRepo.findByDomain(domain);
    if (existing) {
      throw new ConflictError("Já existe um tenant com este domínio.");
    }

    const dbName = this.generateDbName(domain);
    const tenantDatabaseName = toTenantDatabaseName(dbName);

    await createPostgresTenantDatabase(tenantDatabaseName);

    await runTenantMigrations(tenantDatabaseName);

    const tenant = await this.tenantRepo.createTenant({
      domain,
      dbName,
      features: input.features,
      companyName: input.companyName?.trim() || adminName || null,
      cnpj: input.cnpj?.trim() || null,
      billingDate: input.billingDate?.trim() || null,
      ownerEmail: adminEmail,
      phone: input.phone?.trim() || null,
    });

    const tenantDb = getTenantDb(tenantDatabaseName);

    await tenantDb.insert(users).values({
      name: adminName,
      email: adminEmail,
      passwordHash: null,
      role: "admin",
      permissions: ["*"],
      isActive: true,
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    await this.userRepo.savePasswordResetToken(tenant.id, adminEmail, token, expiresAt);
    await sendTokenEmail(adminEmail, token, "activation", { tenantDomain: domain });

    return {
      ...tenant,
      database: tenantDatabaseName,
    };
  }

  private generateDbName(domain: string): string {
    const sanitized = domain.replace(/[^a-z0-9_]/g, "_");
    if (!sanitized) {
      throw new Error("Domínio inválido para provisionamento.");
    }
    return sanitized;
  }
}
