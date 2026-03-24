export interface IsPasswordOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
}

const UPPERCASE = /[A-Z]/;
const LOWERCASE = /[a-z]/;
const NUMBER = /[0-9]/;
const SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export function isPassword(
  value: unknown,
  options: IsPasswordOptions = {},
): boolean {
  if (typeof value !== "string") return false;
  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecial = false,
  } = options;

  if (value.length < minLength) return false;
  if (requireUppercase && !UPPERCASE.test(value)) return false;
  if (requireLowercase && !LOWERCASE.test(value)) return false;
  if (requireNumber && !NUMBER.test(value)) return false;
  if (requireSpecial && !SPECIAL.test(value)) return false;
  return true;
}
