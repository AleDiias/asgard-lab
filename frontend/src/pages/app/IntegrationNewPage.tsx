import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ActionBar, Button, FormPageShell } from "@/components/ui";
import {
  INTEGRATIONS_SETTINGS_ROUTES,
  IntegrationFormUI,
  integrationsSettingsScreen,
} from "@/components/screens/integrations";
import { createIntegrationFn } from "@/api/core/integrations.api";
import type { DialerProvider } from "@/types/core-integrations.types";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessIntegrationsWrite } from "@/utils/asgard-access";

const INTEGRATION_NEW_FORM_ID = "integration-new-form";

export default function IntegrationNewPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canWrite = canAccessIntegrationsWrite(user);

  const [provider, setProvider] = useState<DialerProvider>("vonix");
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  const createMutation = useMutation({
    mutationFn: createIntegrationFn,
    onSuccess: () => {
      toast.success("Integração guardada.");
      void qc.invalidateQueries({ queryKey: ["integrations"] });
      void qc.invalidateQueries({ queryKey: ["integrations-active"] });
      navigate(INTEGRATIONS_SETTINGS_ROUTES.list);
    },
    onError: (e: Error) => toast.error(e.message ?? "Falha ao guardar."),
  });

  const handleSubmit = useCallback(() => {
    const n = name.trim();
    if (!n || !apiKey.trim() || !baseUrl.trim()) {
      toast.error("Preencha nome, API Key e URL base.");
      return;
    }
    createMutation.mutate({
      provider,
      name: n,
      baseUrl: baseUrl.trim(),
      credentials: { apiKey: apiKey.trim() },
      isActive: true,
    });
  }, [apiKey, baseUrl, createMutation, name, provider]);

  if (!canWrite) {
    return <Navigate to={INTEGRATIONS_SETTINGS_ROUTES.list} replace />;
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <ActionBar
        title={integrationsSettingsScreen.new.title}
        breadcrumb={[...integrationsSettingsScreen.new.breadcrumb]}
        actions={
          <>
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
              <Link to={INTEGRATIONS_SETTINGS_ROUTES.list} aria-label="Voltar à lista">
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              type="submit"
              form={INTEGRATION_NEW_FORM_ID}
              size="sm"
              disabled={
                createMutation.isPending ||
                !name.trim() ||
                !apiKey.trim() ||
                !baseUrl.trim()
              }
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Guardar
                </>
              ) : (
                "Guardar integração"
              )}
            </Button>
          </>
        }
      />
      <FormPageShell maxWidth="wide" fullWidth>
        <IntegrationFormUI
          variant="create"
          formId={INTEGRATION_NEW_FORM_ID}
          provider={provider}
          onProviderChange={setProvider}
          name={name}
          onNameChange={setName}
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          baseUrl={baseUrl}
          onBaseUrlChange={setBaseUrl}
          onSubmit={handleSubmit}
          loading={createMutation.isPending}
          hideSubmitButton
        />
      </FormPageShell>
    </section>
  );
}
