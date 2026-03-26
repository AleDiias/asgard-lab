import type { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/errors/app-error.js";
import {
  getTenantDb,
  toTenantDatabaseName,
} from "@/infra/database/tenant/connection-manager.js";
import { runCoreTenantMigrations } from "@/infra/database/tenant/migrator.js";
import type { TenantMasterRepository } from "@/shared/repositories/tenant-master.repository.js";

const migrationsByDatabase = new Map<string, Promise<void>>();

async function ensureTenantCoreSchema(databaseName: string): Promise<void> {
  let p = migrationsByDatabase.get(databaseName);
  if (!p) {
    p = runCoreTenantMigrations(databaseName)
      .catch((error) => {
        migrationsByDatabase.delete(databaseName);
        throw error;
      });
    migrationsByDatabase.set(databaseName, p);
  }
  await p;
}

/**
 * Após `requireAuth`, resolve o Tenant DB:
 * - Utilizador tenant: `tenantId` do JWT → lookup no Master.
 * - Super Admin: obrigatório `X-Tenant-Domain` → lookup por domínio.
 */
export function createResolveTenantDbMiddleware(repo: TenantMasterRepository) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;
    if (!user) {
      return next(new BadRequestError("Contexto de autenticação ausente."));
    }

    try {
      if (user.isSuperAdmin) {
        const raw = req.headers["x-tenant-domain"];
        if (typeof raw !== "string" || !raw.trim()) {
          return next(
            new BadRequestError(
              "Cabeçalho X-Tenant-Domain é obrigatório para utilizadores Asgard."
            )
          );
        }
        const tenant = await repo.findByDomain(raw);
        if (!tenant) {
          return next(new NotFoundError("Empresa não encontrada."));
        }
        if (!tenant.active) {
          return next(new ForbiddenError("Empresa inativa."));
        }
        const databaseName = toTenantDatabaseName(tenant.dbName);
        await ensureTenantCoreSchema(databaseName);
        req.tenantDb = getTenantDb(databaseName);
        req.tenantContext = {
          tenantId: tenant.id,
          domain: tenant.domain,
          databaseName,
        };
        return next();
      }

      if (user.tenantId === "master") {
        return next(new ForbiddenError("Token sem contexto operacional de cliente."));
      }

      const tenant = await repo.findById(user.tenantId);
      if (!tenant) {
        return next(new NotFoundError("Empresa não encontrada."));
      }
      if (!tenant.active) {
        return next(new ForbiddenError("Empresa inativa."));
      }

      const databaseName = toTenantDatabaseName(tenant.dbName);
      await ensureTenantCoreSchema(databaseName);
      req.tenantDb = getTenantDb(databaseName);
      req.tenantContext = {
        tenantId: tenant.id,
        domain: tenant.domain,
        databaseName,
      };
      return next();
    } catch (e) {
      return next(e instanceof Error ? e : new Error(String(e)));
    }
  };
}
