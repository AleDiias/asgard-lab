import argon2 from "argon2";
import type { TenantRepository } from "@/repositories/tenant.repository.js";
import type { UserRepository } from "@/repositories/user.repository.js";
import type { AsgardUserRepository } from "@/repositories/asgard-user.repository.js";
import { logger } from "@/infra/logger.js";

const SUPER_ADMIN_DOMAINS = ["@asgardai.com.br", "@asgardai"];
/** Mesmo valor usado em `UserRepositoryDrizzle` para tokens de reset do fluxo Asgard (mapa em memória). */
const MASTER_TENANT_ID = "master";

function isAsgardEmail(email: string): boolean {
  return SUPER_ADMIN_DOMAINS.some((domain) => email.endsWith(domain));
}

function asgardEmailCandidates(email: string): string[] {
  const normalized = email.trim().toLowerCase();
  if (normalized.endsWith("@asgardai.com.br")) {
    return [normalized, normalized.replace(/@asgardai\.com\.br$/, "@asgardai")];
  }
  if (normalized.endsWith("@asgardai")) {
    return [normalized, `${normalized}.com.br`];
  }
  return [normalized];
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
  tenantDomain: string;
}

export class ResetPasswordService {
  constructor(
    private readonly tenantRepo: TenantRepository,
    private readonly userRepo: UserRepository,
    private readonly asgardUserRepo: AsgardUserRepository
  ) {}

  async execute(input: ResetPasswordInput): Promise<{ ok: true }> {
    const { token, newPassword, tenantDomain } = input;

    /** Fluxo Asgard: `ForgotPasswordService` grava o token com `tenantId === "master"` (mapa em memória). */
    const masterTokenData = await this.userRepo.findByPasswordResetToken(
      MASTER_TENANT_ID,
      token
    );
    if (masterTokenData) {
      const email = masterTokenData.email.trim().toLowerCase();
      if (!isAsgardEmail(email)) {
        logger.warn("Token master com e-mail inesperado", { email });
        throw new Error("Token inválido ou expirado.");
      }
      const candidates = asgardEmailCandidates(email);
      let asgardUser = null;
      for (const candidate of candidates) {
        asgardUser = await this.asgardUserRepo.findByEmail(candidate);
        if (asgardUser) break;
      }
      if (!asgardUser) {
        logger.warn("Reset Asgard: usuário não encontrado após token master", { email });
        throw new Error("Token inválido ou expirado.");
      }
      const passwordHash = await argon2.hash(newPassword);
      await this.asgardUserRepo.updatePasswordByEmail(asgardUser.email, passwordHash);
      await this.userRepo.invalidatePasswordResetToken(MASTER_TENANT_ID, token);
      logger.info("Senha redefinida com sucesso (Asgard)", { email });
      return { ok: true };
    }

    const tenant = await this.tenantRepo.findByDomain(tenantDomain);
    if (!tenant || !tenant.active) {
      throw new Error("Empresa não encontrada ou inativa.");
    }

    const data = await this.userRepo.findByPasswordResetToken(tenant.id, token);
    if (!data) {
      logger.warn("Token de reset inválido ou expirado", { tenantDomain });
      throw new Error("Token inválido ou expirado.");
    }

    const passwordHash = await argon2.hash(newPassword);
    await this.userRepo.updatePassword(tenant.id, data.userId, passwordHash);
    await this.userRepo.invalidatePasswordResetToken(tenant.id, token);

    logger.info("Senha redefinida com sucesso", {
      tenantDomain,
      email: data.email,
    });

    return { ok: true };
  }
}
