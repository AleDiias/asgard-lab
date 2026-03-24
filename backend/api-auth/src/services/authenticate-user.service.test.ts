import { beforeAll, describe, expect, it } from "bun:test";
import argon2 from "argon2";
import type { AsgardUserEntity, AsgardUserRepository } from "@/repositories/asgard-user.repository.js";
import type { TenantEntity, TenantRepository } from "@/repositories/tenant.repository.js";
import type { UserEntity, UserRepository } from "@/repositories/user.repository.js";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/errors/app-error.js";

class TenantRepoStub implements TenantRepository {
  constructor(private readonly tenant: TenantEntity | null) {}

  async findByDomain(_domain: string): Promise<TenantEntity | null> {
    return this.tenant;
  }
}

class UserRepoStub implements UserRepository {
  constructor(private readonly user: UserEntity | null) {}

  async findByEmail(_tenantId: string, _email: string): Promise<UserEntity | null> {
    return this.user;
  }

  async updatePassword(_tenantId: string, _userId: string, _passwordHash: string): Promise<void> {}
  async savePasswordResetToken(
    _tenantId: string,
    _email: string,
    _token: string,
    _expiresAt: Date
  ): Promise<void> {}
  async findByPasswordResetToken(
    _tenantId: string,
    _token: string
  ): Promise<{ userId: string; email: string } | null> {
    return null;
  }
  async invalidatePasswordResetToken(_tenantId: string, _token: string): Promise<void> {}

  async createInvitedUser(): Promise<{ id: string }> {
    return { id: "stub-user-id" };
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
  constructor(private readonly user: AsgardUserEntity | null) {}

  async findByEmail(_email: string): Promise<AsgardUserEntity | null> {
    return this.user;
  }

  async createInvitedUser(): Promise<{ id: string }> {
    return { id: "stub-asgard-id" };
  }

  async updatePasswordByEmail(): Promise<void> {}

  async listAll() {
    return [];
  }

  async setActiveById(): Promise<boolean> {
    return false;
  }
}

describe("AuthenticateUserService", () => {
  let AuthenticateUserServiceCtor: typeof import("./authenticate-user.service.js").AuthenticateUserService;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";

    ({ AuthenticateUserService: AuthenticateUserServiceCtor } = await import(
      "./authenticate-user.service.js"
    ));
  });

  it("autentica usuário tenant e retorna token com isSuperAdmin false", async () => {
    const passwordHash = await argon2.hash("senha123");
    const tenant: TenantEntity = {
      id: "tenant-1",
      domain: "demo",
      dbName: "tenant_demo",
      features: ["crm"],
      active: true,
    };
    const user: UserEntity = {
      id: "user-1",
      email: "user@demo.com",
      passwordHash,
      role: "admin",
      permissions: ["users:read"],
    };

    const service = new AuthenticateUserServiceCtor(
      new TenantRepoStub(tenant),
      new UserRepoStub(user),
      new AsgardUserRepoStub(null)
    );

    const result = await service.execute({
      email: "user@demo.com",
      password: "senha123",
      tenantDomain: "demo",
    });

    expect(result.token.length).toBeGreaterThan(10);
    expect(result.user.isSuperAdmin).toBeFalse();
    expect(result.user.tenantId).toBe("tenant-1");
    expect(result.user.features).toEqual(["crm"]);
  });

  it("autentica usuário asgard e retorna role asgard_employee", async () => {
    const passwordHash = await argon2.hash("Senha@123");
    const asgardUser: AsgardUserEntity = {
      id: "asgard-1",
      email: "admin@asgardai.com.br",
      passwordHash,
      active: true,
    };

    const service = new AuthenticateUserServiceCtor(
      new TenantRepoStub(null),
      new UserRepoStub(null),
      new AsgardUserRepoStub(asgardUser)
    );

    const result = await service.execute({
      email: "admin@asgardai.com.br",
      password: "Senha@123",
      tenantDomain: "qualquer",
    });

    expect(result.user.isSuperAdmin).toBeTrue();
    expect(result.user.role).toBe("asgard_employee");
    expect(result.user.tenantId).toBe("master");
  });

  it("bloqueia usuário asgard inativo", async () => {
    const passwordHash = await argon2.hash("Senha@123");
    const service = new AuthenticateUserServiceCtor(
      new TenantRepoStub(null),
      new UserRepoStub(null),
      new AsgardUserRepoStub({
        id: "asgard-2",
        email: "inactive@asgardai.com.br",
        passwordHash,
        active: false,
      })
    );

    await expect(
      service.execute({
        email: "inactive@asgardai.com.br",
        password: "Senha@123",
        tenantDomain: "demo",
      })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("retorna erro quando tenant não existe para usuário client", async () => {
    const service = new AuthenticateUserServiceCtor(
      new TenantRepoStub(null),
      new UserRepoStub(null),
      new AsgardUserRepoStub(null)
    );

    await expect(
      service.execute({
        email: "client@demo.com",
        password: "123",
        tenantDomain: "nao-existe",
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("retorna credenciais inválidas para senha errada", async () => {
    const passwordHash = await argon2.hash("senha-correta");
    const tenant: TenantEntity = {
      id: "tenant-1",
      domain: "demo",
      dbName: "tenant_demo",
      features: ["crm"],
      active: true,
    };
    const user: UserEntity = {
      id: "user-1",
      email: "user@demo.com",
      passwordHash,
      role: "admin",
      permissions: ["users:read"],
    };

    const service = new AuthenticateUserServiceCtor(
      new TenantRepoStub(tenant),
      new UserRepoStub(user),
      new AsgardUserRepoStub(null)
    );

    await expect(
      service.execute({
        email: "user@demo.com",
        password: "senha-errada",
        tenantDomain: "demo",
      })
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
