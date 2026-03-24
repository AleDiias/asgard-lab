/** Formata `YYYY-MM-DD` para exibição `DD/MM/AAAA`. */
export function formatIsoDatePt(iso: string): string {
  const t = iso.trim();
  if (!t) return "";
  const [y, m, d] = t.slice(0, 10).split("-");
  if (!y || !m || !d) return t;
  return `${d}/${m}/${y}`;
}

/** Valor de célula: texto vazio vira traço longo. */
export function cellOrDash(value: string): string {
  return value.trim().length > 0 ? value : "—";
}
