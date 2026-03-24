/**
 * Status reutilizáveis para UI (ativo/inativo) e contas de empresa (incl. bloqueado por inadimplência).
 * Cores das bolinhas alinham-se ao significado semântico; labels vêm das props da tela.
 */

export type ActiveInactiveStatus = "active" | "inactive";

/** Empresa: ativa, inativa ou bloqueada (bloqueio de acesso por débito / política). */
export type CompanyAccountStatus = "active" | "inactive" | "blocked";

const DOT_ACTIVE = "bg-emerald-500";
/** Inativo (usuário / empresa): vermelho — destaque negativo claro */
const DOT_INACTIVE = "bg-red-500";
const DOT_BLOCKED = "bg-amber-500";

/** Bolinha à esquerda — ativo / inativo */
export function activeInactiveDotClass(status: ActiveInactiveStatus): string {
  return status === "active" ? DOT_ACTIVE : DOT_INACTIVE;
}

/** Bolinha à esquerda — empresa (inclui bloqueado) */
export function companyAccountDotClass(status: CompanyAccountStatus): string {
  if (status === "active") {
    return DOT_ACTIVE;
  }
  if (status === "blocked") {
    return DOT_BLOCKED;
  }
  return DOT_INACTIVE;
}

export interface ActiveInactiveLabels {
  active: string;
  inactive: string;
}

export interface CompanyAccountLabels {
  active: string;
  inactive: string;
  blocked: string;
}

export function labelActiveInactive(
  status: ActiveInactiveStatus,
  labels: ActiveInactiveLabels
): string {
  return status === "active" ? labels.active : labels.inactive;
}

export function labelCompanyAccount(
  status: CompanyAccountStatus,
  labels: CompanyAccountLabels
): string {
  if (status === "active") {
    return labels.active;
  }
  if (status === "blocked") {
    return labels.blocked;
  }
  return labels.inactive;
}
