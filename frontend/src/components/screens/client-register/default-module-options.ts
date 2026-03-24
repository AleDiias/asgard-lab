import type { ClientModuleOption } from "./types";

/** Opções de módulos (alinhado com `features` persistido no master). */
export const DEFAULT_MODULE_OPTIONS: ClientModuleOption[] = [
  { id: "crm", label: "CRM" },
  { id: "dialer", label: "Discador" },
  { id: "whatsapp", label: "WhatsApp" },
];

/** Texto para células de tabela / resumos. */
export function moduleIdsToLabels(
  ids: string[],
  options: ClientModuleOption[] = DEFAULT_MODULE_OPTIONS
): string {
  if (ids.length === 0) return "";
  return ids
    .map((id) => options.find((o) => o.id === id)?.label ?? id)
    .join(", ");
}
