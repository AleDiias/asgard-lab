import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ActionBar, Button, FormPageShell } from "@/components/ui";
import {
  CAMPAIGN_INTEGRATION_NONE,
  CAMPAIGN_ROUTES,
  CampaignFormUI,
  campaignsScreen,
} from "@/components/screens/campaigns";
import { getCampaignByIdFn, updateCampaignFn } from "@/api/core/campaigns.api";
import { listIntegrationsFn } from "@/api/core/integrations.api";
import type { CampaignStatus } from "@/types/core-campaigns.types";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessCampaignsWrite } from "@/utils/asgard-access";

const CAMPAIGN_EDIT_FORM_ID = "campaign-edit-form";

function statusOperationalLocked(status: CampaignStatus): boolean {
  return status === "syncing" || status === "completed";
}

export default function CampaignEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canWrite = canAccessCampaignsWrite(user);

  const [name, setName] = useState("");
  const [integrationId, setIntegrationId] = useState(CAMPAIGN_INTEGRATION_NONE);
  const [operationalActive, setOperationalActive] = useState(true);
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>("draft");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => getCampaignByIdFn(id!),
    enabled: Boolean(id),
  });

  const { data: integrations = [] } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => listIntegrationsFn(),
  });

  useEffect(() => {
    if (!data) return;
    setName(data.name);
    setIntegrationId(data.integrationId ?? CAMPAIGN_INTEGRATION_NONE);
    setCampaignStatus(data.status);
    setOperationalActive(data.status === "active");
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (body: Parameters<typeof updateCampaignFn>[1]) => updateCampaignFn(id!, body),
    onSuccess: () => {
      toast.success("Campanha atualizada.");
      void qc.invalidateQueries({ queryKey: ["campaigns"] });
      void qc.invalidateQueries({ queryKey: ["campaign", id] });
      navigate(CAMPAIGN_ROUTES.list);
    },
    onError: (e: Error) => toast.error(e.message ?? "Erro ao atualizar."),
  });

  const handleSubmit = useCallback(() => {
    const n = name.trim();
    if (!n) {
      toast.error("Indique o nome da campanha.");
      return;
    }
    const body: Parameters<typeof updateCampaignFn>[1] = {
      name: n,
      integrationId: integrationId === CAMPAIGN_INTEGRATION_NONE ? null : integrationId,
    };
    if (!statusOperationalLocked(campaignStatus)) {
      body.status = operationalActive ? "active" : "paused";
    }
    updateMutation.mutate(body);
  }, [campaignStatus, integrationId, name, operationalActive, updateMutation]);

  if (!canWrite) {
    return <Navigate to={CAMPAIGN_ROUTES.list} replace />;
  }

  if (!id) {
    return <Navigate to={CAMPAIGN_ROUTES.list} replace />;
  }

  if (isError) {
    return (
      <section className="space-y-3">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Campanha não encontrada."}
        </p>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to={CAMPAIGN_ROUTES.list}>Voltar</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <ActionBar
        title={campaignsScreen.edit.title}
        breadcrumb={[...campaignsScreen.edit.breadcrumb]}
        actions={
          <>
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
              <Link to={CAMPAIGN_ROUTES.list} aria-label="Voltar à lista">
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              type="submit"
              form={CAMPAIGN_EDIT_FORM_ID}
              size="sm"
              disabled={updateMutation.isPending || !name.trim() || isLoading || !data}
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
        {isLoading || !data ? (
          <p className="text-sm text-muted-foreground">A carregar…</p>
        ) : (
          <CampaignFormUI
            variant="edit"
            formId={CAMPAIGN_EDIT_FORM_ID}
            name={name}
            onNameChange={setName}
            integrationId={integrationId}
            onIntegrationChange={setIntegrationId}
            integrations={integrations}
            leadsCount={data.leadsCount}
            campaignStatus={campaignStatus}
            operationalActive={operationalActive}
            onOperationalActiveChange={setOperationalActive}
            onSubmit={handleSubmit}
            loading={updateMutation.isPending}
            hideSubmitButton
          />
        )}
      </FormPageShell>
    </section>
  );
}
