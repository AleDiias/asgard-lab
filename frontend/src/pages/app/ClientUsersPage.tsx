import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { ActionBar, Button } from "@/components/ui";
import { TablePaginationBar } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DEFAULT_CONFIG_PAGE_SIZE,
  usePaginationSlice,
} from "@/hooks/use-pagination-slice";
import {
  CLIENT_USERS_ROUTES,
  ClientUserFormUI,
  ClientUserListUI,
  clientUsersScreen,
} from "@/components/screens/client-users";
import type { ClientUserListRow } from "@/components/screens/client-users/types";
import type { ClientUserFormFieldErrors, ClientUserFormValues } from "@/components/screens/client-users";
import { listTenantUsersFn, patchTenantUserStatusFn, updateTenantUserPermissionsFn } from "@/api/admin/admin.api";
import type { TenantUserRecord } from "@/types/admin.types";
import { getErrorMessage } from "@/utils/feedback";
import { isAsgardInternalUser } from "@/utils/asgard-access";
import { useAuthStore } from "@/stores/auth.store";
import {
  clientUserEditFormSchema,
  mapZodErrorToClientUserFormFieldErrors,
} from "@/pages/app/schemas/client-user-form.schema";
import {
  PERMISSION_CAMPAIGNS_READ,
  PERMISSION_CAMPAIGNS_WRITE,
  PERMISSION_INTEGRATIONS_READ,
  PERMISSION_INTEGRATIONS_WRITE,
  PERMISSION_LEADS_READ,
  PERMISSION_LEADS_WRITE,
  PERMISSION_USERS_MANAGE,
} from "@/constants/permissions";

const DEFAULT_PERMISSION_OPTIONS = [
  { id: "dashboard.view", label: "Visualizar Dashboard" },
  { id: "agents.manage", label: "Gerenciar Agentes" },
  { id: PERMISSION_USERS_MANAGE, label: "Gerir utilizadores do tenant" },
  { id: PERMISSION_LEADS_READ, label: "Leads - consultar" },
  { id: PERMISSION_LEADS_WRITE, label: "Leads - importar e alterar" },
  { id: PERMISSION_CAMPAIGNS_READ, label: "Campanhas - consultar" },
  { id: PERMISSION_CAMPAIGNS_WRITE, label: "Campanhas - criar e sincronizar" },
  { id: PERMISSION_INTEGRATIONS_READ, label: "Integracoes - consultar" },
  { id: PERMISSION_INTEGRATIONS_WRITE, label: "Integracoes - configurar" },
];

const PERMISSION_LABEL: Record<string, string> = Object.fromEntries(
  DEFAULT_PERMISSION_OPTIONS.map((p) => [p.id, p.label])
);
const translatePermission = (permission: string): string => PERMISSION_LABEL[permission] ?? permission;

function mapToRow(u: TenantUserRecord): ClientUserListRow {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.isActive ? "active" : "inactive",
    permissionLabels: u.permissions.map(translatePermission),
  };
}

export default function ClientUsersPage() {
  const qc = useQueryClient();
  const [editingRow, setEditingRow] = useState<ClientUserListRow | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<ClientUserFormFieldErrors | undefined>();
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const authUser = useAuthStore((s) => s.user);
  const canManageRole = isAsgardInternalUser(authUser);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tenant", "users"],
    queryFn: listTenantUsersFn,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => patchTenantUserStatusFn(id, { isActive: false }),
    onSuccess: async () => {
      toast.success("Usuário desativado com sucesso.");
      await qc.invalidateQueries({ queryKey: ["tenant", "users"] });
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e, "Não foi possível desativar o usuário."));
    },
  });

  const rows: ClientUserListRow[] = useMemo(() => (data ?? []).map(mapToRow), [data]);
  const {
    paginatedItems,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
  } = usePaginationSlice(rows, {
    initialPageSize: DEFAULT_CONFIG_PAGE_SIZE,
  });

  const handleDelete = useCallback(
    (row: ClientUserListRow) => {
      const ok = window.confirm(`Desativar o usuário ${row.name}?`);
      if (!ok) return;
      deactivateMutation.mutate(row.id);
    },
    [deactivateMutation]
  );

  const handleEditSubmit = useCallback(
    async (form: ClientUserFormValues) => {
      if (!editingRow) return;
      const parsed = clientUserEditFormSchema.safeParse({
        name: form.name,
        email: form.email,
        role: form.role,
        permissionIds: form.permissionIds,
        status: form.status,
      });
      if (!parsed.success) {
        setEditFieldErrors(mapZodErrorToClientUserFormFieldErrors(parsed.error));
        return;
      }
      setEditFieldErrors(undefined);
      setIsSavingEdit(true);
      try {
        await updateTenantUserPermissionsFn(editingRow.id, {
          permissionIds: parsed.data.permissionIds,
          role: canManageRole ? parsed.data.role : undefined,
        });
        await patchTenantUserStatusFn(editingRow.id, {
          isActive: parsed.data.status === "active",
        });
        toast.success("Usuário atualizado com sucesso.");
        setEditingRow(null);
        await qc.invalidateQueries({ queryKey: ["tenant", "users"] });
      } catch (e: unknown) {
        if (isAxiosError(e) && e.response?.status === 409) {
          toast.error("Conflito ao atualizar usuário.");
          return;
        }
        toast.error(getErrorMessage(e, "Não foi possível atualizar o usuário."));
      } finally {
        setIsSavingEdit(false);
      }
    },
    [canManageRole, editingRow, qc]
  );

  return (
    <section className="space-y-3">
      <ActionBar
        title={clientUsersScreen.list.title}
        breadcrumb={[...clientUsersScreen.list.breadcrumb]}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label="Filtros"
            >
              <Filter className="h-4 w-4" aria-hidden />
            </Button>
            <Button type="button" size="sm" className="gap-1.5" asChild>
              <Link to={CLIENT_USERS_ROUTES.newUser}>
                <UserPlus className="h-4 w-4" aria-hidden />
                Novo usuário
              </Link>
            </Button>
          </>
        }
      />
      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Erro ao carregar utilizadores."}
        </p>
      ) : (
        <>
          <ClientUserListUI
            loading={isLoading}
            rows={paginatedItems}
            hideTitle
            onEdit={(row) => setEditingRow(row)}
            onDelete={handleDelete}
          />
          <TablePaginationBar
            totalItems={totalItems}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            className="mt-2 rounded-lg border border-border"
          />
        </>
      )}

      <Dialog
        open={editingRow !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingRow(null);
            setEditFieldErrors(undefined);
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
          </DialogHeader>
          {editingRow ? (
            <ClientUserFormUI
              mode="edit"
              formId="client-user-edit-form"
              hideSubmitButton={false}
              permissionOptions={DEFAULT_PERMISSION_OPTIONS}
              values={{
                name: editingRow.name,
                email: editingRow.email,
                role: (editingRow.role as "admin" | "user") ?? "user",
                status: editingRow.status,
                permissionIds: (data ?? [])
                  .find((u) => u.id === editingRow.id)
                  ?.permissions.map((p) => p) ?? [],
              }}
              fieldErrors={editFieldErrors}
              isLoading={isSavingEdit}
              showRoleField={canManageRole}
              onSubmit={handleEditSubmit}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
