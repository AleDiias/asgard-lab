import {
  PERMISSION_CAMPAIGNS_READ,
  PERMISSION_CAMPAIGNS_WRITE,
  PERMISSION_INTEGRATIONS_READ,
  PERMISSION_INTEGRATIONS_WRITE,
  PERMISSION_LEADS_READ,
  PERMISSION_LEADS_WRITE,
  PERMISSION_USERS_MANAGE,
} from "@/constants/permissions";

/** Domínio interno Asgard (equipe / super-admin). */
export const ASGARD_INTERNAL_EMAIL_SUFFIX = "@asgardai.com.br";

export interface AsgardAccessUserLike {
  email?: string | null;
  isSuperAdmin?: boolean | null;
  permissions?: string[] | null;
}

/**
 * Utilizadores com e-mail @asgardai.com.br ou flag de super-admin da API.
 */
export function isAsgardInternalUser(user: AsgardAccessUserLike | null | undefined): boolean {
  if (!user) return false;
  if (user.isSuperAdmin === true) return true;
  const e = user.email?.trim().toLowerCase() ?? "";
  return e.endsWith(ASGARD_INTERNAL_EMAIL_SUFFIX);
}

/**
 * Pode ver /app/users e chamar GET /users: equipe Asgard (domínio via subdomínio + header)
 * ou utilizador do tenant com `*` / `users.manage`.
 */
export function canAccessTenantUsersView(user: AsgardAccessUserLike | null | undefined): boolean {
  if (!user) return false;
  if (isAsgardInternalUser(user)) return true;
  const perms = user.permissions ?? [];
  return perms.includes("*") || perms.includes(PERMISSION_USERS_MANAGE);
}

/**
 * Importação de leads (CSV): `leads.write` ou `*`, ou equipe Asgard.
 */
export function canAccessLeadsImport(user: AsgardAccessUserLike | null | undefined): boolean {
  if (!user) return false;
  if (isAsgardInternalUser(user)) return true;
  const perms = user.permissions ?? [];
  return perms.includes("*") || perms.includes(PERMISSION_LEADS_WRITE);
}

/** Listagem, métricas e importações — `leads.read` / `leads.write` / `*`, ou equipe Asgard. */
export function canAccessLeadsTracking(user: AsgardAccessUserLike | null | undefined): boolean {
  if (!user) return false;
  if (isAsgardInternalUser(user)) return true;
  const perms = user.permissions ?? [];
  return (
    perms.includes("*") ||
    perms.includes(PERMISSION_LEADS_READ) ||
    perms.includes(PERMISSION_LEADS_WRITE)
  );
}

/** Campanhas (listar): `campaigns.read` / `campaigns.write` / `*`, ou equipe Asgard. */
export function canAccessCampaignsView(user: AsgardAccessUserLike | null | undefined): boolean {
  if (!user) return false;
  if (isAsgardInternalUser(user)) return true;
  const perms = user.permissions ?? [];
  return (
    perms.includes("*") ||
    perms.includes(PERMISSION_CAMPAIGNS_READ) ||
    perms.includes(PERMISSION_CAMPAIGNS_WRITE)
  );
}

/** Campanhas (criar / sincronizar leads): `campaigns.write` / `*`, ou equipe Asgard. */
export function canAccessCampaignsWrite(user: AsgardAccessUserLike | null | undefined): boolean {
  if (!user) return false;
  if (isAsgardInternalUser(user)) return true;
  const perms = user.permissions ?? [];
  return perms.includes("*") || perms.includes(PERMISSION_CAMPAIGNS_WRITE);
}

/** Integrações de discador (Configurações): `integrations.read` / `integrations.write` / `*`, ou Asgard. */
export function canAccessIntegrationsSettings(
  user: AsgardAccessUserLike | null | undefined
): boolean {
  if (!user) return false;
  if (isAsgardInternalUser(user)) return true;
  const perms = user.permissions ?? [];
  return (
    perms.includes("*") ||
    perms.includes(PERMISSION_INTEGRATIONS_READ) ||
    perms.includes(PERMISSION_INTEGRATIONS_WRITE)
  );
}

/** Criar/editar integrações: `integrations.write` / `*`, ou Asgard. */
export function canAccessIntegrationsWrite(
  user: AsgardAccessUserLike | null | undefined
): boolean {
  if (!user) return false;
  if (isAsgardInternalUser(user)) return true;
  const perms = user.permissions ?? [];
  return perms.includes("*") || perms.includes(PERMISSION_INTEGRATIONS_WRITE);
}
