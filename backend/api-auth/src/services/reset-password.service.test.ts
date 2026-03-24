import { describe, expect, it } from "bun:test";
import argon2 from "argon2";
import { ResetPasswordService } from "./reset-password.service.js";
import type { TenantEntity, TenantRepository } from "@/repositories/tenant.repository.js";
import type { UserRepository } from "@/repositories/user.repository.js";
import type {
  AsgardUserEntity,
  AsgardUserRepository,
} from "@/repositories/asgard-user.repository.js";

class TenantRepoStub implements TenantRepository {
  constructor(private readonly tenant: TenantEntity | null) {}
  async findByDomain(_domain: string): Promise<TenantEntity | null> {
    return this.tenant;
  }
}

class UserRepoStub implements UserRepository {
  public updatedPasswordHash: string | null = null;
  public invalidatedToken: string | null = null;

  constructor(
    private readonly tokenData: { userId: string; email: string } | null,
    private readonly masterTokenData: { userId: string; email: string } | null = null
  ) {}

  async findByEmail(): Promise<null> {
    return null;
  }

  async updatePassword(_tenantId: string, _userId: string, passwordHash: string): Promise<void> {
    this.updatedPasswordHash = passwordHash;
  }

  async savePasswordResetToken(): Promise<void> {}

  async findByPasswordResetToken(
    tenantId: string,
    _token: string
  ): Promise<{ userId: string; email: string } | null> {
    if (tenantId === "master") {
      return this.masterTokenData;
    }
    return this.tokenData;
  }

  async invalidatePasswordResetToken(_tenantId: string, token: string): Promise<void> {
    this.invalidatedToken = token;
  }

  async createInvitedUser(): Promise<{ id: string }> {
    return { id: "stub-id" };
  }

  async listTenantUsers() {
    return [];
  }

  async findTenantUserById() {
    return null;
  }

  async updateTenantUserPermissions(): Promise<void> {}

  async setTenantUserActive(): Promise<void> {}
}

class AsgardUserRepoStub implements AsgardUserRepository {
  public lastPasswordHash: string | null = null;

  constructor(private readonly user: AsgardUserEntity | null) {}

  async findByEmail(email: string): Promise<AsgardUserEntity | null> {
    if (!this.user) return null;
    if (this.user.email !== email.toLowerCase()) return null;
    return this.user;
  }

  async updatePasswordByEmail(_email: string, passwordHash: string): Promise<void> {
    this.lastPasswordHash = passwordHash;
  }

  async createInvitedUser(): Promise<{ id: string }> {
    return { id: "stub-asgard" };
  }

  async listAll() {
    return [];
  }

  async setActiveById(): Promise<boolean> {
    return false;
  }
}

describe("ResetPasswordService", () => {
  it("redefine senha com token válido", async () => {
    const tenant: TenantEntity = {
      id: "tenant-1",
      domain: "demo",
      dbName: "tenant_demo",
      features: ["crm"],
      active: true,
    };
    const userRepo = new UserRepoStub({ userId: "user-1", email: "user@demo.com" });
    const asgardRepo = new AsgardUserRepoStub(null);
    const service = new ResetPasswordService(new TenantRepoStub(tenant), userRepo, asgardRepo);

    const result = await service.execute({
      tenantDomain: "demo",
      token: "token-valido",
      newPassword: "NovaSenha@123",
    });

    expect(result).toEqual({ ok: true });
    expect(userRepo.updatedPasswordHash).not.toBeNull();
    expect(await argon2.verify(userRepo.updatedPasswordHash as string, "NovaSenha@123")).toBeTrue();
    expect(userRepo.invalidatedToken).toBe("token-valido");
  });

  it("falha quando tenant não existe", async () => {
    const userRepo = new UserRepoStub({ userId: "user-1", email: "user@demo.com" });
    const asgardRepo = new AsgardUserRepoStub(null);
    const service = new ResetPasswordService(new TenantRepoStub(null), userRepo, asgardRepo);

    await expect(
      service.execute({
        tenantDomain: "inexistente",
        token: "x",
        newPassword: "NovaSenha@123",
      })
    ).rejects.toThrow("Empresa não encontrada ou inativa.");
  });

  it("falha quando token é inválido", async () => {
    const tenant: TenantEntity = {
      id: "tenant-1",
      domain: "demo",
      dbName: "tenant_demo",
      features: ["crm"],
      active: true,
    };
    const userRepo = new UserRepoStub(null);
    const asgardRepo = new AsgardUserRepoStub(null);
    const service = new ResetPasswordService(new TenantRepoStub(tenant), userRepo, asgardRepo);

    await expect(
      service.execute({
        tenantDomain: "demo",
        token: "invalido",
        newPassword: "NovaSenha@123",
      })
    ).rejects.toThrow("Token inválido ou expirado.");
  });

  it("redefine senha de usuário Asgard (token gravado no fluxo master)", async () => {
    const asgardUser: AsgardUserEntity = {
      id: "asgard-1",
      email: "colab@asgardai.com.br",
      passwordHash: await argon2.hash("Antiga@123"),
      active: true,
    };
    const userRepo = new UserRepoStub(
      null,
      { userId: "asgard-reset", email: "colab@asgardai.com.br" }
    );
    const asgardRepo = new AsgardUserRepoStub(asgardUser);
    const service = new ResetPasswordService(new TenantRepoStub(null), userRepo, asgardRepo);

    const result = await service.execute({
      tenantDomain: "demo",
      token: "token-asgard",
      newPassword: "NovaSenha@456",
    });

    expect(result).toEqual({ ok: true });
    expect(asgardRepo.lastPasswordHash).not.toBeNull();
    expect(await argon2.verify(asgardRepo.lastPasswordHash as string, "NovaSenha@456")).toBeTrue();
    expect(userRepo.invalidatedToken).toBe("token-asgard");
    expect(userRepo.updatedPasswordHash).toBeNull();
  });
});
