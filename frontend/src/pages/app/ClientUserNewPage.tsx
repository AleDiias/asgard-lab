import { useCallback, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ActionBar, Button, FormPageShell } from "@/components/ui";
import {
  CLIENT_USERS_ROUTES,
  ClientUserFormUI,
  clientUserFormUiDefaultLabels,
  clientUsersScreen,
  type ClientUserFormFieldErrors,
  type ClientUserFormValues,
} from "@/components/screens/client-users";
import {
  clientUserNewFormSchema,
  mapZodErrorToClientUserFormFieldErrors,
} from "@/pages/app/schemas/client-user-form.schema";
import { inviteTenantUserFn } from "@/api/admin/admin.api";
import { getErrorMessage, successMessages } from "@/utils/feedback";
import type { ClientUserPermissionOption } from "@/components/screens/client-users";
import {
  PERMISSION_CAMPAIGNS_READ,
  PERMISSION_CAMPAIGNS_WRITE,
  PERMISSION_INTEGRATIONS_READ,
  PERMISSION_INTEGRATIONS_WRITE,
  PERMISSION_LEADS_READ,
  PERMISSION_LEADS_WRITE,
  PERMISSION_USERS_MANAGE,
} from "@/constants/permissions";

/** TODO: carregar da API de permissões do tenant. Placeholder para permitir convite end-to-end. */
const DEFAULT_PERMISSION_OPTIONS: ClientUserPermissionOption[] = [
  { id: "dashboard.view", label: "Visualizar Dashboard" },
  { id: "agents.manage", label: "Gerenciar Agentes" },
  { id: PERMISSION_USERS_MANAGE, label: "Gerir utilizadores do tenant" },
  { id: PERMISSION_LEADS_READ, label: "Leads — consultar" },
  { id: PERMISSION_LEADS_WRITE, label: "Leads — importar e alterar" },
  { id: PERMISSION_CAMPAIGNS_READ, label: "Campanhas — consultar" },
  { id: PERMISSION_CAMPAIGNS_WRITE, label: "Campanhas — criar e sincronizar" },
  { id: PERMISSION_INTEGRATIONS_READ, label: "Integrações — consultar" },
  { id: PERMISSION_INTEGRATIONS_WRITE, label: "Integrações — configurar" },
];

const CLIENT_USER_NEW_FORM_ID = "client-user-new-form";

export default function ClientUserNewPage() {
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState<ClientUserFormFieldErrors | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: ClientUserFormValues) => {
      const parsed = clientUserNewFormSchema.safeParse({
        name: data.name,
        email: data.email,
        permissionIds: data.permissionIds,
      });
      if (!parsed.success) {
        setFieldErrors(mapZodErrorToClientUserFormFieldErrors(parsed.error));
        return;
      }
      setFieldErrors(undefined);
      setIsLoading(true);
      try {
        const result = await inviteTenantUserFn({
          name: parsed.data.name.trim(),
          email: parsed.data.email.trim().toLowerCase(),
          permissionIds: [...parsed.data.permissionIds],
        });
        toast.success(successMessages.inviteSent(result.email));
        navigate(CLIENT_USERS_ROUTES.list);
      } catch (error: unknown) {
        if (isAxiosError(error) && error.response?.status === 409) {
          setFieldErrors({
            email: getErrorMessage(error, "Este e-mail já está cadastrado."),
          });
          return;
        }
        toast.error(getErrorMessage(error, "Não foi possível enviar o convite."));
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <ActionBar
        title={clientUsersScreen.newUser.title}
        breadcrumb={[...clientUsersScreen.newUser.breadcrumb]}
        actions={
          <>
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
              <Link to={CLIENT_USERS_ROUTES.list} aria-label="Voltar à lista">
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button type="submit" form={CLIENT_USER_NEW_FORM_ID} size="sm" disabled={isLoading}>
              {isLoading ? (
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
          mode="new"
          formId={CLIENT_USER_NEW_FORM_ID}
          hideSubmitButton
          permissionOptions={DEFAULT_PERMISSION_OPTIONS}
          fieldErrors={fieldErrors}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          hideTitle
        />
      </FormPageShell>
    </section>
  );
}
