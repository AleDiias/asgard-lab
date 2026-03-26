import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { TenantRepository } from "@/repositories/tenant.repository.js";
import type { UserRepository } from "@/repositories/user.repository.js";
import type { AsgardUserRepository } from "@/repositories/asgard-user.repository.js";
import { logger } from "@/infra/logger.js";
import { validateAndGetEnv } from "@/infra/env.js";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/errors/app-error.js";

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
const env = validateAndGetEnv();
const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

export interface AuthenticateInput {
  email: string;
  password: string;
  tenantDomain: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isSuperAdmin: boolean;
    permissions: string[];
    features: string[];
    tenantId: string;
  };
}

export class AuthenticateUserService {
  constructor(
    private readonly tenantRepo: TenantRepository,
    private readonly userRepo: UserRepository,
    private readonly asgardUserRepo: AsgardUserRepository
  ) { }

  async execute(input: AuthenticateInput): Promise<AuthResult> {
    const { email, password, tenantDomain } = input;
    const normalizedEmail = email.trim().toLowerCase();
    const asgardEmail = isAsgardEmail(normalizedEmail);

    if (asgardEmail) {
      return this.authenticateAsgardEmployee(normalizedEmail, password);
    }

    const tenant = await this.tenantRepo.findByDomain(tenantDomain);
    if (!tenant || !tenant.active) {
      logger.warn("Tenant não encontrado ou inativo", { tenantDomain });
      throw new NotFoundError("Empresa não encontrada ou inativa.");
    }

    const user = await this.userRepo.findByEmail(tenant.id, normalizedEmail);
    if (!user) {
      logger.warn("Usuário tenant não encontrado", { tenantDomain, email: normalizedEmail });
      throw new UnauthorizedError("Credenciais inválidas.");
    }

    if (user.passwordHash == null || user.passwordHash === "") {
      logger.warn("Utilizador sem senha definida (ativação pendente)", { tenantDomain, email: normalizedEmail });
      throw new UnauthorizedError(
        "Defina sua senha pelo link de ativação enviado por e-mail antes de entrar."
      );
    }

    const passwordValid = await argon2.verify(user.passwordHash, password);
    if (!passwordValid) {
      logger.warn("Senha inválida (tenant)", { tenantDomain, email: normalizedEmail });
      throw new UnauthorizedError("Credenciais inválidas.");
    }

    const payload = {
      tenantId: tenant.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      isSuperAdmin: false,
      permissions: user.permissions,
      features: tenant.features,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    return {
      token,
      user: {
        id: user.id,
        name: user.name ?? user.email.split("@")[0],
        email: user.email,
        role: user.role,
        isSuperAdmin: false,
        permissions: user.permissions,
        features: tenant.features,
        tenantId: tenant.id,
      },
    };
  }

  private async authenticateAsgardEmployee(
    email: string,
    password: string
  ): Promise<AuthResult> {
    const candidates = asgardEmailCandidates(email);
    let asgardUser = null;
    for (const candidate of candidates) {
      asgardUser = await this.asgardUserRepo.findByEmail(candidate);
      if (asgardUser) break;
    }
    if (!asgardUser) {
      logger.warn("Usuário Asgard não encontrado", { email, tried: candidates });
      throw new UnauthorizedError("Credenciais inválidas.");
    }

    if (!asgardUser.active) {
      logger.warn("Usuário Asgard inativo", { email });
      throw new ForbiddenError("Usuário inativo.");
    }

    if (asgardUser.passwordHash == null || asgardUser.passwordHash === "") {
      logger.warn("Utilizador Asgard sem senha (ativação pendente)", { email });
      throw new UnauthorizedError(
        "Defina sua senha pelo link de ativação enviado por e-mail antes de entrar."
      );
    }

    const passwordValid = await argon2.verify(asgardUser.passwordHash, password);
    if (!passwordValid) {
      logger.warn("Senha inválida (Asgard)", { email });
      throw new UnauthorizedError("Credenciais inválidas.");
    }

    const payload = {
      tenantId: "master",
      userId: asgardUser.id,
      email: asgardUser.email,
      role: "asgard_employee",
      isSuperAdmin: true,
      permissions: ["*"],
      features: ["*"],
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    return {
      token,
      user: {
        id: asgardUser.id,
        name: asgardUser.name ?? asgardUser.email.split("@")[0],
        email: asgardUser.email,
        role: "asgard_employee",
        isSuperAdmin: true,
        permissions: ["*"],
        features: ["*"],
        tenantId: "master",
      },
    };
  }
}
