import { NotFoundError } from "@/errors/app-error.js";
import type { TenantDb } from "@/infra/database/tenant/connection-manager.js";
import type { IntegrationCreateBody, IntegrationUpdateBody } from "../schemas/integration.schema.js";
import type { IntegrationRepository } from "../repositories/integration.repository.js";

export type IntegrationPublic = {
  id: string;
  provider: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toPublic(row: {
  id: string;
  provider: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): IntegrationPublic {
  return {
    id: row.id,
    provider: row.provider,
    name: row.name,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class IntegrationService {
  constructor(private readonly integrationRepo: IntegrationRepository) {}

  async create(db: TenantDb, body: IntegrationCreateBody): Promise<IntegrationPublic> {
    const row = await this.integrationRepo.create(db, {
      provider: body.provider,
      name: body.name,
      credentials: body.credentials as unknown as Record<string, unknown>,
      isActive: body.isActive ?? true,
    });
    return toPublic(row);
  }

  async list(db: TenantDb, activeOnly?: boolean): Promise<IntegrationPublic[]> {
    const rows = await this.integrationRepo.list(db, { activeOnly });
    return rows.map(toPublic);
  }

  async update(db: TenantDb, id: string, body: IntegrationUpdateBody): Promise<IntegrationPublic> {
    const existing = await this.integrationRepo.findById(db, id);
    if (!existing) {
      throw new NotFoundError("Integração não encontrada.");
    }
    const prevCreds =
      existing.credentials && typeof existing.credentials === "object" && !Array.isArray(existing.credentials)
        ? (existing.credentials as Record<string, unknown>)
        : {};
    const credentials =
      body.credentials !== undefined
        ? { ...prevCreds, ...body.credentials }
        : undefined;
    const row = await this.integrationRepo.update(db, id, {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      ...(credentials !== undefined ? { credentials } : {}),
    });
    if (!row) {
      throw new NotFoundError("Integração não encontrada.");
    }
    return toPublic(row);
  }
}
