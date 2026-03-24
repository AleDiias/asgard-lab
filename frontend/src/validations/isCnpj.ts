function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function allSame(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

const WEIGHTS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const WEIGHTS_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function cnpjCheckDigit(digits: string, weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += parseInt(digits[i], 10) * weights[i];
  }
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

export function isCnpj(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const digits = digitsOnly(value);
  if (digits.length !== 14) return false;
  if (allSame(digits)) return false;

  const d1 = cnpjCheckDigit(digits, WEIGHTS_1);
  if (d1 !== parseInt(digits[12], 10)) return false;
  const d2 = cnpjCheckDigit(digits, WEIGHTS_2);
  if (d2 !== parseInt(digits[13], 10)) return false;
  return true;
}
