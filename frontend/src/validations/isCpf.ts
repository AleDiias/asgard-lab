function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function allSame(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

function cpfCheckDigit(digits: string, factor: number): number {
  let sum = 0;
  for (let i = 0; i < factor; i++) {
    sum += parseInt(digits[i], 10) * (factor + 1 - i);
  }
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

export function isCpf(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const digits = digitsOnly(value);
  if (digits.length !== 11) return false;
  if (allSame(digits)) return false;

  const d1 = cpfCheckDigit(digits, 9);
  if (d1 !== parseInt(digits[9], 10)) return false;
  const d2 = cpfCheckDigit(digits, 10);
  if (d2 !== parseInt(digits[10], 10)) return false;
  return true;
}
