import { useCallback, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ActionBar, Button, FormPageShell } from "@/components/ui";
import {
  CLIENT_REGISTER_ROUTES,
  ClientFormUI,
  clientRegisterScreen,
  DEFAULT_MODULE_OPTIONS,
  type ClientFormFieldErrors,
  type ClientFormValues,
} from "@/components/screens/client-register";
import {
  mapZodErrorToClientFormFieldErrors,
} from "@/pages/app/schemas/client-register-new.schema";
import { clientRegisterEditSchema } from "@/pages/app/schemas/client-register-edit.schema";
import { getTenantFn, updateTenantFn } from "@/api/admin/admin.api";
import { getErrorMessage } from "@/utils/feedback";

const CLIENT_REGISTER_EDIT_FORM_ID = "client-register-edit-form";

const EDIT_SUBMIT_LABEL = "Guardar alterações";

export default function ClientsRegisterEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fieldErrors, setFieldErrors] = useState<ClientFormFieldErrors | undefined>();

  const {
    data: tenant,
    isLoading: isLoadingTenant,
    isError,
    error: loadError,
  } = useQuery({
    queryKey: ["admin", "tenants", id],
    queryFn: () => getTenantFn(id!),
    enabled: Boolean(id),
  });

  const initialValues = useMemo<Partial<ClientFormValues> | undefined>(() => {
    if (!tenant) return undefined;
    return {
      companyName: tenant.companyName?.trim() ?? "",
      cnpj: tenant.cnpj ?? "",
      billingDate: tenant.billingDate ?? "",
      ownerEmail: tenant.ownerEmail?.trim() ?? "",
      phone: tenant.phone ?? "",
      domain: tenant.domain,
      moduleIds: [...tenant.features],
      accountStatus: tenant.isActive ? "active" : "inactive",
    };
  }, [tenant]);

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateTenantFn>[1]) =>
      updateTenantFn(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      toast.success("Alterações guardadas.");
      navigate(CLIENT_REGISTER_ROUTES.list);
    },
  });

  const handleSubmit = useCallback(
    async (data: ClientFormValues) => {
      const parsed = clientRegisterEditSchema.safeParse(data);
      if (!parsed.success) {
        setFieldErrors(mapZodErrorToClientFormFieldErrors(parsed.error));
        return;
      }
      setFieldErrors(undefined);
      try {
        await updateMutation.mutateAsync({
          domain: parsed.data.domain.trim().toLowerCase(),
          features: [...parsed.data.moduleIds],
          isActive: parsed.data.accountStatus === "active",
          companyName: parsed.data.companyName.trim() || null,
          cnpj: parsed.data.cnpj.trim() || null,
          billingDate: parsed.data.billingDate.trim() || null,
          ownerEmail: parsed.data.ownerEmail.trim().toLowerCase() || null,
          phone: parsed.data.phone.trim() || null,
        });
      } catch (err: unknown) {
        if (isAxiosError(err) && err.response?.status === 409) {
          setFieldErrors({
            domain: getErrorMessage(err, "Este domínio já está em uso."),
          });
          return;
        }
        toast.error(getErrorMessage(err, "Não foi possível guardar as alterações."));
      }
    },
    [updateMutation]
  );

  if (!id) {
    return (
      <p className="text-sm text-destructive">Identificador da empresa inválido.</p>
    );
  }

  if (isLoadingTenant) {
    return (
      <p className="text-sm text-muted-foreground">A carregar dados da empresa…</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {loadError instanceof Error ? loadError.message : "Empresa não encontrada."}
      </p>
    );
  }

  if (!tenant || !initialValues) {
    return <p className="text-sm text-destructive">Empresa não encontrada.</p>;
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <ActionBar
        title={clientRegisterScreen.editCompany.title}
        breadcrumb={[...clientRegisterScreen.editCompany.breadcrumb]}
        actions={
          <>
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
              <Link to={CLIENT_REGISTER_ROUTES.list} aria-label="Voltar à lista">
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              type="submit"
              form={CLIENT_REGISTER_EDIT_FORM_ID}
              size="sm"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  {EDIT_SUBMIT_LABEL}
                </>
              ) : (
                EDIT_SUBMIT_LABEL
              )}
            </Button>
          </>
        }
      />
      <FormPageShell maxWidth="wide" fullWidth>
        <ClientFormUI
          formId={CLIENT_REGISTER_EDIT_FORM_ID}
          variant="edit"
          hideSubmitButton
          moduleOptions={DEFAULT_MODULE_OPTIONS}
          values={initialValues}
          fieldErrors={fieldErrors}
          isLoading={updateMutation.isPending}
          onSubmit={handleSubmit}
          hideTitle
          labels={{ submit: EDIT_SUBMIT_LABEL }}
        />
      </FormPageShell>
    </section>
  );
}
