export interface IsLengthOptions {
  min?: number;
  max?: number;
}

export function isLength(
  value: unknown,
  options: IsLengthOptions,
): boolean {
  const { min = 0, max = Number.MAX_SAFE_INTEGER } = options;
  let length: number;
  if (typeof value === "string") {
    length = value.length;
  } else if (Array.isArray(value)) {
    length = value.length;
  } else {
    return false;
  }
  return length >= min && length <= max;
}
