import { isEmail, isPassword, isRequired } from "@/validations";

export const PASSWORD_MIN_LENGTH = 8;

export function validateLogin(email: string, password: string): string | null {
  if (!isEmail(email)) {
    return "Email inválido.";
  }
  if (!isPassword(password, { minLength: PASSWORD_MIN_LENGTH })) {
    return `Senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  return null;
}

export function validateForgot(email: string): string | null {
  if (!isEmail(email)) {
    return "Email inválido.";
  }
  return null;
}

export function validateResetPassword(
  token: string,
  password: string,
  confirmPassword: string,
): string | null {
  if (!isRequired(token)) {
    return "Token é obrigatório.";
  }
  if (!isPassword(password, { minLength: PASSWORD_MIN_LENGTH })) {
    return `Senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (password !== confirmPassword) {
    return "As senhas não coincidem.";
  }
  return null;
}
