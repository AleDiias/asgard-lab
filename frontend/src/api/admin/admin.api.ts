import { isAxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import type {
  AsgardUserListResponse,
  AsgardUserRecord,
  CreateAsgardUserPayload,
  CreateAsgardUserResponse,
  CreateAsgardUserResult,
  CreateTenantPayload,
  CreateTenantResponse,
  CreateTenantResult,
  InviteTenantUserPayload,
  InviteTenantUserResponse,
  InviteTenantUserResult,
  PatchUserStatusPayload,
  TenantDetailResponse,
  TenantListResponse,
  TenantRecord,
  TenantUserListResponse,
  TenantUserRecord,
  UpdateTenantPayload,
  UpdateTenantUserPermissionsPayload,
} from "@/types/admin.types";
import type { ApiErrorResponse } from "@/types/auth.types";

function assertSuccess<T>(
  data: { success: true; data: T } | ApiErrorResponse
): asserts data is { success: true; data: T } {
  if (!data.success) {
    throw new Error(data.error.message);
  }
}

/**
 * Provisiona tenant (super-admin). O admin inicial recebe e-mail de ativação (sem senha no payload).
 */
export async function createTenantFn(payload: CreateTenantPayload): Promise<CreateTenantResult> {
  const { data } = await apiClient.post<CreateTenantResponse | ApiErrorResponse>(
    "/admin/tenants",
    payload
  );
  assertSuccess<CreateTenantResult>(data);
  return data.data;
}

export async function listTenantsFn(): Promise<TenantRecord[]> {
  const { data } = await apiClient.get<TenantListResponse | ApiErrorResponse>("/admin/tenants");
  assertSuccess<TenantRecord[]>(data);
  return data.data;
}

export async function getTenantFn(id: string): Promise<TenantRecord> {
  const { data } = await apiClient.get<TenantDetailResponse | ApiErrorResponse>(
    `/admin/tenants/${id}`
  );
  assertSuccess<TenantRecord>(data);
  return data.data;
}

export async function updateTenantFn(id: string, payload: UpdateTenantPayload): Promise<TenantRecord> {
  const { data } = await apiClient.put<TenantDetailResponse | ApiErrorResponse>(
    `/admin/tenants/${id}`,
    payload
  );
  assertSuccess<TenantRecord>(data);
  return data.data;
}

/**
 * Cria utilizador interno Asgard (super-admin). Convite por e-mail.
 */
export async function createAsgardUserFn(
  payload: CreateAsgardUserPayload
): Promise<CreateAsgardUserResult> {
  const { data } = await apiClient.post<CreateAsgardUserResponse | ApiErrorResponse>(
    "/admin/asgard/users",
    payload
  );
  assertSuccess<CreateAsgardUserResult>(data);
  return data.data;
}

export async function listAsgardUsersFn(): Promise<AsgardUserRecord[]> {
  const { data } = await apiClient.get<AsgardUserListResponse | ApiErrorResponse>(
    "/admin/asgard/users"
  );
  assertSuccess<AsgardUserRecord[]>(data);
  return data.data;
}

export async function patchAsgardUserStatusFn(
  id: string,
  payload: PatchUserStatusPayload
): Promise<void> {
  const { data } = await apiClient.patch<{ success: true; data: { ok: true } } | ApiErrorResponse>(
    `/admin/asgard/users/${id}/status`,
    payload
  );
  assertSuccess(data);
}

/**
 * Convida utilizador do tenant atual. Requer `X-Tenant-Domain` (interceptor) e JWT.
 */
export async function inviteTenantUserFn(
  payload: InviteTenantUserPayload
): Promise<InviteTenantUserResult> {
  const { data } = await apiClient.post<InviteTenantUserResponse | ApiErrorResponse>(
    "/users",
    payload
  );
  assertSuccess<InviteTenantUserResult>(data);
  return data.data;
}

export async function listTenantUsersFn(): Promise<TenantUserRecord[]> {
  try {
    const { data } = await apiClient.get<TenantUserListResponse | ApiErrorResponse>("/users");
    assertSuccess<TenantUserRecord[]>(data);
    return data.data ?? [];
  } catch (e: unknown) {
    /** Sem utilizadores ou recurso não encontrado: mostrar estado vazio (evita 404 genérico do axios). */
    if (isAxiosError(e) && e.response?.status === 404) {
      return [];
    }
    throw e;
  }
}

export async function updateTenantUserPermissionsFn(
  id: string,
  payload: UpdateTenantUserPermissionsPayload
): Promise<void> {
  const { data } = await apiClient.put<{ success: true; data: { ok: true } } | ApiErrorResponse>(
    `/users/${id}`,
    payload
  );
  assertSuccess(data);
}

export async function patchTenantUserStatusFn(
  id: string,
  payload: PatchUserStatusPayload
): Promise<void> {
  const { data } = await apiClient.patch<{ success: true; data: { ok: true } } | ApiErrorResponse>(
    `/users/${id}/status`,
    payload
  );
  assertSuccess(data);
}
