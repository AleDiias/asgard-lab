export interface AuthUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  features: string[];
  tenantId?: string;
  /** Presente quando a API devolve utilizador Asgard / super-admin. */
  isSuperAdmin?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginSuccessData {
  token: string;
  user: AuthUser;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: { message: string };
}

export type LoginResponse = ApiSuccessResponse<LoginSuccessData> | ApiErrorResponse;

export interface ForgotPasswordPayload {
  email: string;
  type?: "forgot" | "activation";
}

export interface ForgotPasswordSuccessData {
  message: string;
}

export type ForgotPasswordResponse =
  | ApiSuccessResponse<ForgotPasswordSuccessData>
  | ApiErrorResponse;

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ResetPasswordSuccessData {
  message: string;
}

export type ResetPasswordResponse =
  | ApiSuccessResponse<ResetPasswordSuccessData>
  | ApiErrorResponse;
