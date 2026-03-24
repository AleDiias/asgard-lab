/** Apenas dígitos */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Máscara CNPJ: 00.000.000/0000-00 */
export function formatCnpjInput(raw: string): string {
  const d = digitsOnly(raw).slice(0, 14);
  if (d.length <= 2) {
    return d;
  }
  if (d.length <= 5) {
    return `${d.slice(0, 2)}.${d.slice(2)}`;
  }
  if (d.length <= 8) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  }
  if (d.length <= 12) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  }
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

/** Máscara telefone BR (celular 11 dígitos ou fixo 10) */
export function formatPhoneBrInput(raw: string): string {
  const d = digitsOnly(raw).slice(0, 11);
  if (d.length === 0) {
    return "";
  }
  if (d.length <= 2) {
    return `(${d}`;
  }
  if (d.length <= 6) {
    return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  }
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}
