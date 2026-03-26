import type { TenantRepository } from "@/repositories/tenant.repository.js";
import type { UserRepository } from "@/repositories/user.repository.js";
import { ForbiddenError, NotFoundError } from "@/errors/app-error.js";

export class TenantUserManagementService {
  constructor(
    private readonly tenantRepo: TenantRepository,
    private readonly userRepo: UserRepository
  ) {}

  private async resolveTenantForActor(
    tenantDomain: string,
    actorTenantId: string,
    actorIsSuperAdmin: boolean
  ) {
    const tenant = await this.tenantRepo.findByDomain(tenantDomain);
    if (!tenant || !tenant.active) {
      throw new NotFoundError("Empresa não encontrada ou inativa.");
    }
    if (!actorIsSuperAdmin && tenant.id !== actorTenantId) {
      throw new ForbiddenError("Você não pode acessar esta empresa.");
    }
    return tenant;
  }

  async listUsers(input: {
    tenantDomain: string;
    actorTenantId: string;
    actorIsSuperAdmin: boolean;
  }) {
    const tenant = await this.resolveTenantForActor(
      input.tenantDomain,
      input.actorTenantId,
      input.actorIsSuperAdmin
    );
    return this.userRepo.listTenantUsers(tenant.id);
  }

  async updatePermissions(input: {
    tenantDomain: string;
    userId: string;
    permissionIds: string[];
    actorUserId: string;
    actorTenantId: string;
    actorIsSuperAdmin: boolean;
    actorPermissions: string[];
    role?: "admin" | "user";
  }) {
    const tenant = await this.resolveTenantForActor(
      input.tenantDomain,
      input.actorTenantId,
      input.actorIsSuperAdmin
    );
    const target = await this.userRepo.findTenantUserById(tenant.id, input.userId);
    if (!target) {
      throw new NotFoundError("Usuário não encontrado.");
    }

    if (!input.actorIsSuperAdmin) {
      if (!canAssignPermissions(input.actorPermissions, input.permissionIds)) {
        throw new ForbiddenError("Você não pode conceder permissões que não possui.");
      }
    }

    await this.userRepo.updateTenantUserPermissions(
      tenant.id,
      input.userId,
      input.permissionIds
    );
    if (input.role) {
      await this.userRepo.updateTenantUserRole(tenant.id, input.userId, input.role);
    }
  }

  async setActive(input: {
    tenantDomain: string;
    userId: string;
    isActive: boolean;
    actorUserId: string;
    actorTenantId: string;
    actorIsSuperAdmin: boolean;
  }) {
    const tenant = await this.resolveTenantForActor(
      input.tenantDomain,
      input.actorTenantId,
      input.actorIsSuperAdmin
    );
    const target = await this.userRepo.findTenantUserById(tenant.id, input.userId);
    if (!target) {
      throw new NotFoundError("Usuário não encontrado.");
    }

    if (!input.actorIsSuperAdmin && target.id === input.actorUserId && !input.isActive) {
      throw new ForbiddenError("Você não pode inativar a si mesmo.");
    }

    await this.userRepo.setTenantUserActive(tenant.id, input.userId, input.isActive);
  }
}

function canAssignPermissions(actorPermissions: string[], target: string[]): boolean {
  if (actorPermissions.includes("*")) {
    return true;
  }
  return target.every((p) => actorPermissions.includes(p));
}
