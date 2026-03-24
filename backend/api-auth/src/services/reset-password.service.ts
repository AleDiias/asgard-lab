import argon2 from "argon2";
import type { TenantRepository } from "@/repositories/tenant.repository.js";
import type { UserRepository } from "@/repositories/user.repository.js";
import type { AsgardUserRepository } from "@/repositories/asgard-user.repository.js";
import { logger } from "@/infra/logger.js";

const SUPER_ADMIN_DOMAIN = "@asgardai.com.br";
/** Mesmo valor usado em `UserRepositoryDrizzle` para tokens de reset do fluxo Asgard (mapa em memória). */
const MASTER_TENANT_ID = "master";

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
      if (!email.endsWith(SUPER_ADMIN_DOMAIN)) {
        logger.warn("Token master com e-mail inesperado", { email });
        throw new Error("Token inválido ou expirado.");
      }
      const asgardUser = await this.asgardUserRepo.findByEmail(email);
      if (!asgardUser) {
        logger.warn("Reset Asgard: usuário não encontrado após token master", { email });
        throw new Error("Token inválido ou expirado.");
      }
      const passwordHash = await argon2.hash(newPassword);
      await this.asgardUserRepo.updatePasswordByEmail(email, passwordHash);
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
