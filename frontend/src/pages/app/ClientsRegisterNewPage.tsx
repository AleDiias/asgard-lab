import { useCallback, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ActionBar, Button, FormPageShell } from "@/components/ui";
import {
  CLIENT_REGISTER_ROUTES,
  ClientFormUI,
  clientFormUiDefaultLabels,
  clientRegisterScreen,
  type ClientFormFieldErrors,
  type ClientFormValues,
} from "@/components/screens/client-register";
import {
  clientRegisterNewSchema,
  mapZodErrorToClientFormFieldErrors,
} from "@/pages/app/schemas/client-register-new.schema";
import { createTenantFn } from "@/api/admin/admin.api";
import { getErrorMessage, successMessages } from "@/utils/feedback";
import { DEFAULT_MODULE_OPTIONS } from "@/components/screens/client-register";

const CLIENT_REGISTER_NEW_FORM_ID = "client-register-new-form";

export default function ClientsRegisterNewPage() {
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState<ClientFormFieldErrors | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: ClientFormValues) => {
      const { accountStatus: _ignored, ...rest } = data;
      const parsed = clientRegisterNewSchema.safeParse(rest);
      if (!parsed.success) {
        setFieldErrors(mapZodErrorToClientFormFieldErrors(parsed.error));
        return;
      }
      setFieldErrors(undefined);
      setIsLoading(true);
      try {
        await createTenantFn({
          domain: parsed.data.domain.trim().toLowerCase(),
          features: [...parsed.data.moduleIds],
          adminEmail: parsed.data.ownerEmail.trim().toLowerCase(),
          adminName: parsed.data.companyName.trim(),
          companyName: parsed.data.companyName.trim(),
          cnpj: parsed.data.cnpj,
          billingDate: parsed.data.billingDate,
          phone: parsed.data.phone,
        });
        toast.success(successMessages.inviteSent(parsed.data.ownerEmail.trim().toLowerCase()));
        navigate(CLIENT_REGISTER_ROUTES.list);
      } catch (error: unknown) {
        if (isAxiosError(error) && error.response?.status === 409) {
          setFieldErrors({
            domain: getErrorMessage(error, "Este domínio já está em uso."),
          });
          return;
        }
        toast.error(getErrorMessage(error, "Não foi possível criar a empresa."));
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <ActionBar
        title={clientRegisterScreen.newCompany.title}
        breadcrumb={[...clientRegisterScreen.newCompany.breadcrumb]}
        actions={
          <>
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
              <Link to={CLIENT_REGISTER_ROUTES.list} aria-label="Voltar à lista">
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button type="submit" form={CLIENT_REGISTER_NEW_FORM_ID} size="sm" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  {clientFormUiDefaultLabels.submit}
                </>
              ) : (
                clientFormUiDefaultLabels.submit
              )}
            </Button>
          </>
        }
      />
      <FormPageShell maxWidth="wide" fullWidth>
        <ClientFormUI
          formId={CLIENT_REGISTER_NEW_FORM_ID}
          hideSubmitButton
          moduleOptions={DEFAULT_MODULE_OPTIONS}
          fieldErrors={fieldErrors}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          hideTitle
        />
      </FormPageShell>
    </section>
  );
}
