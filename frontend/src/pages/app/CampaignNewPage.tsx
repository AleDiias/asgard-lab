import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ActionBar, Button, FormPageShell } from "@/components/ui";
import {
  CAMPAIGN_INTEGRATION_NONE,
  CAMPAIGN_ROUTES,
  CampaignFormUI,
  campaignsScreen,
} from "@/components/screens/campaigns";
import { createCampaignFn } from "@/api/core/campaigns.api";
import { listImportBatchesFn } from "@/api/core/leads.api";
import { listIntegrationsFn } from "@/api/core/integrations.api";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessCampaignsWrite } from "@/utils/asgard-access";
import { syncCampaignLeadsFn } from "@/api/core/campaigns.api";
const CAMPAIGN_NEW_FORM_ID = "campaign-new-form";

export default function CampaignNewPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canWrite = canAccessCampaignsWrite(user);

  const [name, setName] = useState("");
  const [integrationId, setIntegrationId] = useState(CAMPAIGN_INTEGRATION_NONE);
  const [queueId, setQueueId] = useState(CAMPAIGN_INTEGRATION_NONE);
  const [importBatchIds, setImportBatchIds] = useState<string[]>([]);

  const { data: integrations = [] } = useQuery({
    queryKey: ["integrations-active"],
    queryFn: () => listIntegrationsFn({ activeOnly: true }),
  });

  const { data: importBatchesData } = useQuery({
    queryKey: ["campaign-new-import-batches"],
    queryFn: () => listImportBatchesFn({ page: 1, pageSize: 100 }),
  });

  const activeIntegrations = integrations.filter((i) => i.isActive);

  const availableImportBatches = (importBatchesData?.items ?? []).filter(
    (b) => b.importedCount - b.removedCount > 0
  );

  const createMutation = useMutation({
    mutationFn: createCampaignFn,
    onSuccess: async (created) => {
      if (importBatchIds.length > 0) {
        await syncCampaignLeadsFn(created.id, { importBatchIds });
      }
      toast.success(
        importBatchIds.length > 0
          ? "Campanha criada e leads sincronizados."
          : "Campanha criada."
      );
      void qc.invalidateQueries({ queryKey: ["campaigns"] });
      navigate(CAMPAIGN_ROUTES.list);
    },
    onError: (e: Error) => toast.error(e.message ?? "Erro ao criar."),
  });

  const handleSubmit = useCallback(() => {
    const n = name.trim();
    if (!n) {
      toast.error("Indique o nome da campanha.");
      return;
    }
    createMutation.mutate({
      name: n,
      integrationId: integrationId === CAMPAIGN_INTEGRATION_NONE ? null : integrationId,
      queueId: queueId === CAMPAIGN_INTEGRATION_NONE ? null : queueId,
    });
  }, [createMutation, integrationId, name, queueId]);

  if (!canWrite) {
    return <Navigate to={CAMPAIGN_ROUTES.list} replace />;
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <ActionBar
        title={campaignsScreen.new.title}
        breadcrumb={[...campaignsScreen.new.breadcrumb]}
        actions={
          <>
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
              <Link to={CAMPAIGN_ROUTES.list} aria-label="Voltar à lista">
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              type="submit"
              form={CAMPAIGN_NEW_FORM_ID}
              size="sm"
              disabled={createMutation.isPending || !name.trim()}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Criar
                </>
              ) : (
                "Criar campanha"
              )}
            </Button>
          </>
        }
      />
      <FormPageShell maxWidth="wide" fullWidth>
        <CampaignFormUI
          variant="create"
          name={name}
          onNameChange={setName}
          integrationId={integrationId}
          onIntegrationChange={(v) => {
            setIntegrationId(v);
            setQueueId(CAMPAIGN_INTEGRATION_NONE);
          }}
          queueId={queueId}
          onQueueIdChange={setQueueId}
          integrations={activeIntegrations}
          importBatches={availableImportBatches}
          selectedImportBatchIds={importBatchIds}
          onSelectedImportBatchIdsChange={setImportBatchIds}
          onSubmit={handleSubmit}
          formId={CAMPAIGN_NEW_FORM_ID}
          submitLabel="Criar campanha"
          loading={createMutation.isPending}
          hideSubmitButton
        />
      </FormPageShell>
    </section>
  );
}
