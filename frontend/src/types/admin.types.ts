import type { ApiSuccessResponse } from "./auth.types";

/** POST /admin/tenants */
export interface CreateTenantPayload {
  domain: string;
  features: string[];
  adminEmail: string;
  adminName?: string;
  companyName?: string;
  cnpj?: string;
  billingDate?: string;
  phone?: string;
}

export interface CreateTenantResult {
  id: string;
  domain: string;
  dbName: string;
  features: string[];
  isActive: boolean;
  companyName: string | null;
  cnpj: string | null;
  billingDate: string | null;
  ownerEmail: string | null;
  phone: string | null;
  database: string;
}

/** GET /admin/tenants, GET /admin/tenants/:id, PUT */
export interface TenantRecord {
  id: string;
  domain: string;
  dbName: string;
  features: string[];
  isActive: boolean;
  companyName: string | null;
  cnpj: string | null;
  billingDate: string | null;
  ownerEmail: string | null;
  phone: string | null;
}

export interface UpdateTenantPayload {
  domain?: string;
  features?: string[];
  isActive?: boolean;
  companyName?: string | null;
  cnpj?: string | null;
  billingDate?: string | null;
  ownerEmail?: string | null;
  phone?: string | null;
}

/** POST /admin/asgard/users */
export interface CreateAsgardUserPayload {
  name: string;
  email: string;
}

export interface CreateAsgardUserResult {
  ok: true;
  email: string;
}

/** GET /admin/asgard/users */
export interface AsgardUserRecord {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

/** POST /users (convite tenant) */
export interface InviteTenantUserPayload {
  name: string;
  email: string;
  permissionIds: string[];
  role?: "admin" | "user";
}

export interface InviteTenantUserResult {
  ok: true;
  email: string;
}

/** GET /users */
export interface TenantUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

export interface UpdateTenantUserPermissionsPayload {
  permissionIds: string[];
  role?: "admin" | "user";
}

export interface PatchUserStatusPayload {
  isActive: boolean;
}

export type CreateTenantResponse = ApiSuccessResponse<CreateTenantResult>;
export type CreateAsgardUserResponse = ApiSuccessResponse<CreateAsgardUserResult>;
export type InviteTenantUserResponse = ApiSuccessResponse<InviteTenantUserResult>;
export type TenantListResponse = ApiSuccessResponse<TenantRecord[]>;
export type TenantDetailResponse = ApiSuccessResponse<TenantRecord>;
export type AsgardUserListResponse = ApiSuccessResponse<AsgardUserRecord[]>;
export type TenantUserListResponse = ApiSuccessResponse<TenantUserRecord[]>;
