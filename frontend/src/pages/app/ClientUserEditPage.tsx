import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { isAxiosError } from "axios";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ZodError } from "zod";
import { toast } from "sonner";
import { ActionBar, Button, FormPageShell } from "@/components/ui";
import {
  CLIENT_USERS_ROUTES,
  ClientUserFormUI,
  clientUsersEditBreadcrumb,
  clientUserFormUiDefaultLabels,
  type ClientUserFormFieldErrors,
  type ClientUserFormValues,
  type ClientUserPermissionOption,
} from "@/components/screens/client-users";
import {
  listTenantUsersFn,
  patchTenantUserStatusFn,
  updateTenantUserPermissionsFn,
} from "@/api/admin/admin.api";
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
import { getErrorMessage } from "@/utils/feedback";
import { useAuthStore } from "@/stores/auth.store";
import { isAsgardInternalUser } from "@/utils/asgard-access";

const CLIENT_USER_EDIT_FORM_ID = "client-user-edit-form-page";
const DEFAULT_PERMISSION_OPTIONS: ClientUserPermissionOption[] = [
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

export default function ClientUserEditPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const authUser = useAuthStore((s) => s.user);
  const canManageRole = isAsgardInternalUser(authUser);
  const [fieldErrors, setFieldErrors] = useState<ClientUserFormFieldErrors | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ["tenant", "users"],
    queryFn: listTenantUsersFn,
  });

  const user = useMemo(() => (data ?? []).find((u) => u.id === id) ?? null, [data, id]);

  const updateMutation = useMutation({
    mutationFn: async (form: ClientUserFormValues) => {
      const parsed = clientUserEditFormSchema.safeParse(form);
      if (!parsed.success) {
        throw parsed.error;
      }
      await updateTenantUserPermissionsFn(id, {
        permissionIds: parsed.data.permissionIds,
        role: canManageRole ? parsed.data.role : undefined,
      });
      await patchTenantUserStatusFn(id, {
        isActive: parsed.data.status === "active",
      });
    },
    onSuccess: async () => {
      toast.success("Usuário atualizado com sucesso.");
      await qc.invalidateQueries({ queryKey: ["tenant", "users"] });
      navigate(CLIENT_USERS_ROUTES.list);
    },
    onError: (error: unknown) => {
      if (error instanceof ZodError) {
        setFieldErrors(mapZodErrorToClientUserFormFieldErrors(error));
        return;
      }
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error("Conflito ao atualizar usuário.");
        return;
      }
      toast.error(getErrorMessage(error, "Não foi possível atualizar o usuário."));
    },
  });

  const handleSubmit = useCallback(
    (form: ClientUserFormValues) => {
      setFieldErrors(undefined);
      updateMutation.mutate(form);
    },
    [updateMutation]
  );

  if (!id) return <Navigate to={CLIENT_USERS_ROUTES.list} replace />;
  if (!isLoading && !user) return <Navigate to={CLIENT_USERS_ROUTES.list} replace />;

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <ActionBar
        title="Editar usuário"
        breadcrumb={clientUsersEditBreadcrumb(user?.name ?? "Usuário")}
        actions={
          <>
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
              <Link to={CLIENT_USERS_ROUTES.list} aria-label="Voltar à lista">
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button type="submit" form={CLIENT_USER_EDIT_FORM_ID} size="sm" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  {clientUserFormUiDefaultLabels.submit}
                </>
              ) : (
                clientUserFormUiDefaultLabels.submit
              )}
            </Button>
          </>
        }
      />
      <FormPageShell maxWidth="wide" fullWidth>
        <ClientUserFormUI
          mode="edit"
          formId={CLIENT_USER_EDIT_FORM_ID}
          hideSubmitButton
          permissionOptions={DEFAULT_PERMISSION_OPTIONS}
          values={{
            name: user?.name ?? "",
            email: user?.email ?? "",
            role: user?.role === "admin" ? "admin" : "user",
            status: user?.isActive ? "active" : "inactive",
            permissionIds: user?.permissions ?? [],
          }}
          fieldErrors={fieldErrors}
          isLoading={isLoading || updateMutation.isPending}
          showRoleField={canManageRole}
          onSubmit={handleSubmit}
          hideTitle
        />
      </FormPageShell>
    </section>
  );
}
