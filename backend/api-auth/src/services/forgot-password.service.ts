import crypto from "node:crypto";
import type { TenantRepository } from "@/repositories/tenant.repository.js";
import type { UserRepository } from "@/repositories/user.repository.js";
import type { AsgardUserRepository } from "@/repositories/asgard-user.repository.js";
import { logger } from "@/infra/logger.js";
import { sendTokenEmail, type TokenEmailType } from "@/infra/email.js";
import { ForbiddenError, NotFoundError } from "@/errors/app-error.js";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1h
const SUPER_ADMIN_DOMAINS = ["@asgardai.com.br", "@asgardai"];

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

export interface ForgotPasswordInput {
  email: string;
  tenantDomain: string;
  type?: TokenEmailType;
}

export class ForgotPasswordService {
  constructor(
    private readonly tenantRepo: TenantRepository,
    private readonly userRepo: UserRepository,
    private readonly asgardUserRepo: AsgardUserRepository
  ) { }

  async execute(input: ForgotPasswordInput): Promise<{ ok: true }> {
    const { email, tenantDomain, type = "forgot" } = input;
    const normalizedEmail = email.trim().toLowerCase();
    const asgardEmail = isAsgardEmail(normalizedEmail);

    if (asgardEmail) {
      const candidates = asgardEmailCandidates(normalizedEmail);
      let asgardUser = null;
      for (const candidate of candidates) {
        asgardUser = await this.asgardUserRepo.findByEmail(candidate);
        if (asgardUser) break;
      }
      if (!asgardUser) {
        logger.info("Forgot/activation Asgard: e-mail não encontrado (não revelar)", {
          email: normalizedEmail,
        });
        return { ok: true };
      }
      if (!asgardUser.active) {
        throw new ForbiddenError("Usuário inativo.");
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
      await this.userRepo.savePasswordResetToken("master", asgardUser.email, token, expiresAt);
      await sendTokenEmail(asgardUser.email, token, type);
      return { ok: true };
    }

    const tenant = await this.tenantRepo.findByDomain(tenantDomain);
    if (!tenant || !tenant.active) {
      logger.warn("Tenant não encontrado ou inativo no forgot-password", {
        tenantDomain,
      });
      throw new NotFoundError("Empresa não encontrada ou inativa.");
    }

    const user = await this.userRepo.findByEmail(tenant.id, normalizedEmail);
    if (!user) {
      logger.info("Forgot/activation: e-mail não encontrado (não revelar)", {
        tenantDomain,
      });
      return { ok: true };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    await this.userRepo.savePasswordResetToken(tenant.id, normalizedEmail, token, expiresAt);

    await sendTokenEmail(normalizedEmail, token, type, { tenantDomain });

    return { ok: true };
  }
}
