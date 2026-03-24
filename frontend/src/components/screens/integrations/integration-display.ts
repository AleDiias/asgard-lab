/** Valor de célula: texto vazio vira traço longo. */
export function cellOrDash(value: string): string {
  return value.trim().length > 0 ? value : "—";
}

/** ISO datetime da API → texto curto pt-PT. */
export function formatIntegrationDateTimePt(iso: string): string {
  const t = iso.trim();
  if (!t) return "—";
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return t;
  return d.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
}

const PROVIDER_LABEL: Record<string, string> = {
  vonix: "Vonix",
  "3c": "3C Plus",
  aspect: "Aspect",
  custom: "Personalizado",
};

export function labelDialerProvider(provider: string): string {
  return PROVIDER_LABEL[provider] ?? provider.toUpperCase();
}
