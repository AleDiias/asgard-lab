import { apiClient } from "@/lib/api-client";
import type {
  LoginPayload,
  LoginSuccessData,
  LoginResponse,
  ForgotPasswordPayload,
  ForgotPasswordSuccessData,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordSuccessData,
  ResetPasswordResponse,
} from "@/types/auth.types";

export async function loginFn(payload: LoginPayload): Promise<LoginSuccessData> {
  const { data } = await apiClient.post<LoginResponse>("/login", payload);
  if (!data.success) {
    throw new Error(data.error.message);
  }
  return data.data;
}

export async function forgotPasswordFn(
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordSuccessData> {
  const { data } = await apiClient.post<ForgotPasswordResponse>(
    "/forgot-password",
    { email: payload.email, type: payload.type }
  );
  if (!data.success) {
    throw new Error(data.error.message);
  }
  return data.data;
}

export async function resetPasswordFn(
  payload: ResetPasswordPayload
): Promise<ResetPasswordSuccessData> {
  const { data } = await apiClient.post<ResetPasswordResponse>(
    "/reset-password",
    payload
  );
  if (!data.success) {
    throw new Error(data.error.message);
  }
  return data.data;
}
