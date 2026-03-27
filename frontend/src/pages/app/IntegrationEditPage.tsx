import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ActionBar, Button, FormPageShell } from "@/components/ui";
import {
  INTEGRATIONS_SETTINGS_ROUTES,
  IntegrationFormUI,
  integrationsSettingsScreen,
} from "@/components/screens/integrations";
import { listIntegrationsFn, updateIntegrationFn } from "@/api/core/integrations.api";
import type { DialerProvider } from "@/types/core-integrations.types";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessIntegrationsWrite } from "@/utils/asgard-access";

const INTEGRATION_EDIT_FORM_ID = "integration-edit-form";

export default function IntegrationEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canWrite = canAccessIntegrationsWrite(user);

  const [provider, setProvider] = useState<DialerProvider>("vonix");
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data: integrations = [], isLoading: listLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => listIntegrationsFn(),
  });

  const row = id ? integrations.find((i) => i.id === id) : undefined;

  useEffect(() => {
    if (!row) return;
    setProvider(row.provider);
    setName(row.name);
    setApiKey("");
    setBaseUrl("");
    setIsActive(row.isActive);
  }, [row]);

  const updateMutation = useMutation({
    mutationFn: (body: Parameters<typeof updateIntegrationFn>[1]) =>
      updateIntegrationFn(id!, body),
    onSuccess: () => {
      toast.success("Integração atualizada.");
      void qc.invalidateQueries({ queryKey: ["integrations"] });
      void qc.invalidateQueries({ queryKey: ["integrations-active"] });
      navigate(INTEGRATIONS_SETTINGS_ROUTES.list);
    },
    onError: (e: Error) => toast.error(e.message ?? "Falha ao atualizar."),
  });

  const handleSubmit = useCallback(() => {
    const n = name.trim();
    if (!n) {
      toast.error("Indique o nome.");
      return;
    }
    const body: Parameters<typeof updateIntegrationFn>[1] = {
      name: n,
      isActive,
    };
    const k = apiKey.trim();
    const u = baseUrl.trim();
    if (k || u) {
      if (!k || !u) {
        toast.error("Para alterar credenciais, preencha API Key e URL base.");
        return;
      }
      body.baseUrl = u;
      body.credentials = { apiKey: k };
    }
    updateMutation.mutate(body);
  }, [apiKey, baseUrl, isActive, name, updateMutation]);

  if (!canWrite) {
    return <Navigate to={INTEGRATIONS_SETTINGS_ROUTES.list} replace />;
  }

  if (!id) {
    return <Navigate to={INTEGRATIONS_SETTINGS_ROUTES.list} replace />;
  }

  if (!listLoading && !row) {
    return <Navigate to={INTEGRATIONS_SETTINGS_ROUTES.list} replace />;
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <ActionBar
        title={integrationsSettingsScreen.edit.title}
        breadcrumb={[...integrationsSettingsScreen.edit.breadcrumb]}
        actions={
          <>
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
              <Link to={INTEGRATIONS_SETTINGS_ROUTES.list} aria-label="Voltar à lista">
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              type="submit"
              form={INTEGRATION_EDIT_FORM_ID}
              size="sm"
              disabled={updateMutation.isPending || !name.trim() || listLoading || !row}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Guardar
                </>
              ) : (
                "Guardar alterações"
              )}
            </Button>
          </>
        }
      />
      <FormPageShell maxWidth="wide" fullWidth>
        {listLoading || !row ? (
          <p className="text-sm text-muted-foreground">A carregar…</p>
        ) : (
          <IntegrationFormUI
            variant="edit"
            formId={INTEGRATION_EDIT_FORM_ID}
            provider={provider}
            onProviderChange={setProvider}
            providerDisabled
            name={name}
            onNameChange={setName}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            baseUrl={baseUrl}
            onBaseUrlChange={setBaseUrl}
            isActive={isActive}
            onIsActiveChange={setIsActive}
            onSubmit={handleSubmit}
            loading={updateMutation.isPending}
            hideSubmitButton
          />
        )}
      </FormPageShell>
    </section>
  );
}
