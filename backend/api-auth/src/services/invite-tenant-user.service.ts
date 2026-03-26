import crypto from "node:crypto";
import type { TenantRepository } from "@/repositories/tenant.repository.js";
import type { UserRepository } from "@/repositories/user.repository.js";
import { sendTokenEmail } from "@/infra/email.js";
import { ConflictError, ForbiddenError, NotFoundError } from "@/errors/app-error.js";
import { logger } from "@/infra/logger.js";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export interface InviteTenantUserInput {
  tenantDomain: string;
  /** JWT: utilizador a convidar (deve coincidir com o tenant do header, ou super-admin). */
  actorTenantId: string;
  actorIsSuperAdmin: boolean;
  name: string;
  email: string;
  permissionIds: string[];
  role?: "admin" | "user";
}

export class InviteTenantUserService {
  constructor(
    private readonly tenantRepo: TenantRepository,
    private readonly userRepo: UserRepository
  ) {}

  async execute(input: InviteTenantUserInput): Promise<{ ok: true; email: string }> {
    const domain = input.tenantDomain.trim().toLowerCase();
    const email = input.email.trim().toLowerCase();

    const tenant = await this.tenantRepo.findByDomain(domain);
    if (!tenant || !tenant.active) {
      throw new NotFoundError("Empresa não encontrada ou inativa.");
    }

    const sameTenant = tenant.id === input.actorTenantId;
    if (!sameTenant && !input.actorIsSuperAdmin) {
      throw new ForbiddenError("Você não pode convidar utilizadores para esta empresa.");
    }

    const existing = await this.userRepo.findByEmail(tenant.id, email);
    if (existing) {
      throw new ConflictError("Já existe um utilizador com este e-mail.");
    }

    await this.userRepo.createInvitedUser(tenant.id, {
      name: input.name.trim(),
      email,
      role: input.role ?? "user",
      permissions: [...input.permissionIds],
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    await this.userRepo.savePasswordResetToken(tenant.id, email, token, expiresAt);
    await sendTokenEmail(email, token, "activation", { tenantDomain: domain });

    logger.info("Convite de utilizador tenant enviado", { tenantDomain: domain, email });

    return { ok: true, email };
  }
}
