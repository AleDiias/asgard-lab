function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function isPhone(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const digits = digitsOnly(value);
  if (digits.length === 11) {
    return digits[2] === "9";
  }
  if (digits.length === 10) {
    return true;
  }
  return false;
}
