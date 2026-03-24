export interface AuthenticatedUser {
  tenantId: string;
  userId: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  permissions: string[];
  features?: string[];
}
