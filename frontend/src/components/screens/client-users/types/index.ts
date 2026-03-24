import type { ActiveInactiveStatus } from "@/lib/status";

export interface ClientUserFormValues {
  name: string;
  email: string;
  /** Ativar ou inativar acesso (apenas em modo edição; novo usuário é sempre ativo até definir). */
  status: ActiveInactiveStatus;
  /** IDs das permissões marcadas */
  permissionIds: string[];
}

export interface ClientUserPermissionOption {
  id: string;
  label: string;
}

export interface ClientUserListRow {
  id: string;
  name: string;
  email: string;
  role?: string;
  /** Opcional: não exibido na lista de configurações (assume-se ativo). */
  status?: ActiveInactiveStatus;
  /**
   * Textos das permissões já resolvidos pelo container (API → labels).
   * Lista vazia = nenhuma permissão atribuída.
   */
  permissionLabels: string[];
}

export interface ClientUserFormFieldErrors {
  name?: string;
  email?: string;
  status?: string;
  permissions?: string;
}
