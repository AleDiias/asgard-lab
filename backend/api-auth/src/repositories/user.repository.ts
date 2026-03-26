export interface UserEntity {
  id: string;
  name?: string;
  email: string;
  passwordHash: string | null;
  role: string;
  permissions: string[];
}

export interface TenantUserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

export interface CreateInvitedTenantUserInput {
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface UserRepository {
  findByEmail(tenantId: string, email: string): Promise<UserEntity | null>;
  createInvitedUser(
    tenantId: string,
    input: CreateInvitedTenantUserInput
  ): Promise<{ id: string }>;
  updatePassword(tenantId: string, userId: string, passwordHash: string): Promise<void>;
  savePasswordResetToken(tenantId: string, email: string, token: string, expiresAt: Date): Promise<void>;
  findByPasswordResetToken(tenantId: string, token: string): Promise<{ userId: string; email: string } | null>;
  invalidatePasswordResetToken(tenantId: string, token: string): Promise<void>;
  listTenantUsers(tenantId: string): Promise<TenantUserListItem[]>;
  findTenantUserById(
    tenantId: string,
    userId: string
  ): Promise<(UserEntity & { name: string; isActive: boolean }) | null>;
  updateTenantUserPermissions(tenantId: string, userId: string, permissions: string[]): Promise<void>;
  updateTenantUserRole(tenantId: string, userId: string, role: string): Promise<void>;
  setTenantUserActive(tenantId: string, userId: string, isActive: boolean): Promise<void>;
}

/**
 * Implementação real (Database-per-Tenant): arquivo `user.repository.drizzle.ts`.
 */
