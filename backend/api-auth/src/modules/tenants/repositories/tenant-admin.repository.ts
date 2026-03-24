import { desc, eq } from "drizzle-orm";
import { ConflictError } from "@/errors/app-error.js";
import { masterDb } from "@/infra/database/master/connection.js";
import { tenants } from "@/infra/database/master/schema.js";

export interface CreateTenantInput {
  domain: string;
  dbName: string;
  features: string[];
  companyName?: string | null;
  cnpj?: string | null;
  billingDate?: string | null;
  ownerEmail?: string | null;
  phone?: string | null;
}

export interface TenantRow {
  id: string;
  domain: string;
  dbName: string;
  features: string[];
  isActive: boolean;
  companyName: string | null;
  cnpj: string | null;
  billingDate: string | null;
  ownerEmail: string | null;
  phone: string | null;
}

export interface TenantAdminRepository {
  findByDomain(domain: string): Promise<{ id: string } | null>;
  createTenant(input: CreateTenantInput): Promise<TenantRow>;
  listTenants(): Promise<TenantRow[]>;
  findTenantById(id: string): Promise<TenantRow | null>;
  updateTenant(
    id: string,
    input: {
      domain?: string;
      features?: string[];
      isActive?: boolean;
      companyName?: string | null;
      cnpj?: string | null;
      billingDate?: string | null;
      ownerEmail?: string | null;
      phone?: string | null;
    }
  ): Promise<TenantRow | null>;
}

const tenantRowSelect = {
  id: tenants.id,
  domain: tenants.domain,
  dbName: tenants.dbName,
  features: tenants.features,
  isActive: tenants.isActive,
  companyName: tenants.companyName,
  cnpj: tenants.cnpj,
  billingDate: tenants.billingDate,
  ownerEmail: tenants.ownerEmail,
  phone: tenants.phone,
} as const;

export class TenantAdminRepositoryDrizzle implements TenantAdminRepository {
  async findByDomain(domain: string): Promise<{ id: string } | null> {
    const [row] = await masterDb
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.domain, domain))
      .limit(1);
    return row ?? null;
  }

  async createTenant(input: CreateTenantInput) {
    const [created] = await masterDb
      .insert(tenants)
      .values({
        domain: input.domain,
        dbName: input.dbName,
        features: input.features,
        companyName: input.companyName ?? null,
        cnpj: input.cnpj ?? null,
        billingDate: input.billingDate ?? null,
        ownerEmail: input.ownerEmail ?? null,
        phone: input.phone ?? null,
      })
      .returning(tenantRowSelect);

    return created;
  }

  async listTenants(): Promise<TenantRow[]> {
    return masterDb
      .select(tenantRowSelect)
      .from(tenants)
      .orderBy(desc(tenants.createdAt));
  }

  async findTenantById(id: string): Promise<TenantRow | null> {
    const [row] = await masterDb
      .select(tenantRowSelect)
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);
    return row ?? null;
  }

  async updateTenant(
    id: string,
    input: {
      domain?: string;
      features?: string[];
      isActive?: boolean;
      companyName?: string | null;
      cnpj?: string | null;
      billingDate?: string | null;
      ownerEmail?: string | null;
      phone?: string | null;
    }
  ): Promise<TenantRow | null> {
    const existing = await this.findTenantById(id);
    if (!existing) {
      return null;
    }

    const nextDomain = input.domain !== undefined ? input.domain.trim().toLowerCase() : undefined;

    if (nextDomain !== undefined && nextDomain !== existing.domain) {
      const [conflict] = await masterDb
        .select({ id: tenants.id })
        .from(tenants)
        .where(eq(tenants.domain, nextDomain))
        .limit(1);
      if (conflict && conflict.id !== id) {
        throw new ConflictError("Já existe um tenant com este domínio.");
      }
    }

    const [updated] = await masterDb
      .update(tenants)
      .set({
        ...(nextDomain !== undefined ? { domain: nextDomain } : {}),
        ...(input.features !== undefined ? { features: input.features } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.companyName !== undefined ? { companyName: input.companyName } : {}),
        ...(input.cnpj !== undefined ? { cnpj: input.cnpj } : {}),
        ...(input.billingDate !== undefined ? { billingDate: input.billingDate } : {}),
        ...(input.ownerEmail !== undefined ? { ownerEmail: input.ownerEmail } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
      })
      .where(eq(tenants.id, id))
      .returning(tenantRowSelect);

    return updated ?? null;
  }
}
