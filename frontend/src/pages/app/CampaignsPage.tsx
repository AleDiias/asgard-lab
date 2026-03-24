import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, Loader2, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ActionBar,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from "@/components/ui";
import { TablePaginationBar } from "@/components/ui/table";
import {
  CAMPAIGN_ROUTES,
  CampaignListUI,
  campaignsScreen,
} from "@/components/screens/campaigns";
import type { CampaignListRow } from "@/components/screens/campaigns";
import { listCampaignsFn, syncCampaignLeadsFn } from "@/api/core/campaigns.api";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessCampaignsWrite } from "@/utils/asgard-access";
import {
  DEFAULT_CONFIG_PAGE_SIZE,
  usePaginationSlice,
} from "@/hooks/use-pagination-slice";

function extractUuids(raw: string): string[] {
  const set = new Set<string>();
  const re = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    set.add(m[0].toLowerCase());
  }
  return [...set];
}

export default function CampaignsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const canWrite = canAccessCampaignsWrite(user);

  const [syncOpen, setSyncOpen] = useState(false);
  const [syncCampaign, setSyncCampaign] = useState<CampaignListRow | null>(null);
  const [leadIdsRaw, setLeadIdsRaw] = useState("");
  const [importBatchId, setImportBatchId] = useState("");

  const { data: campaigns = [], isLoading, isError, error } = useQuery({
    queryKey: ["campaigns"],
    queryFn: listCampaignsFn,
  });

  const rowsSorted = useMemo(() => {
    return [...campaigns].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [campaigns]);

  const { paginatedItems, page, setPage, pageSize, setPageSize, totalItems } =
    usePaginationSlice(rowsSorted, {
      initialPageSize: DEFAULT_CONFIG_PAGE_SIZE,
    });

  const syncMutation = useMutation({
    mutationFn: ({
      id,
      leadIds,
      batchId,
    }: {
      id: string;
      leadIds?: string[];
      batchId?: string;
    }) => syncCampaignLeadsFn(id, { leadIds, importBatchId: batchId }),
    onSuccess: (data) => {
      toast.success(`Sincronizados ${data.syncedCount} lead(s).`);
      void qc.invalidateQueries({ queryKey: ["campaigns"] });
      setSyncOpen(false);
      setSyncCampaign(null);
      setLeadIdsRaw("");
      setImportBatchId("");
    },
    onError: (e: Error) => toast.error(e.message ?? "Falha na sincronização."),
  });

  const openSync = (c: CampaignListRow) => {
    setSyncCampaign(c);
    setLeadIdsRaw("");
    setImportBatchId("");
    setSyncOpen(true);
  };

  const submitSync = () => {
    if (!syncCampaign) return;
    const ids = extractUuids(leadIdsRaw);
    const batch = importBatchId.trim();
    if (ids.length === 0 && !batch) {
      toast.error("Indique IDs de lead (UUID) ou um import batch ID.");
      return;
    }
    syncMutation.mutate({
      id: syncCampaign.id,
      leadIds: ids.length > 0 ? ids : undefined,
      batchId: batch || undefined,
    });
  };

  return (
    <section className="space-y-3">
      <ActionBar
        title={campaignsScreen.list.title}
        breadcrumb={[...campaignsScreen.list.breadcrumb]}
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
            {canWrite ? (
              <Button type="button" size="sm" className="gap-1.5" asChild>
                <Link to={CAMPAIGN_ROUTES.new}>
                  <Plus className="h-4 w-4" aria-hidden />
                  Nova campanha
                </Link>
              </Button>
            ) : null}
          </>
        }
      />
      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Erro ao carregar campanhas."}
        </p>
      ) : (
        <>
          <CampaignListUI
            loading={isLoading}
            rows={paginatedItems}
            hideTitle
            onSyncLeads={canWrite ? openSync : undefined}
            canSync={canWrite}
            onEdit={canWrite ? (row) => navigate(CAMPAIGN_ROUTES.edit(row.id)) : undefined}
            canEdit={canWrite}
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

      <Dialog open={syncOpen} onOpenChange={setSyncOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Sincronizar leads</DialogTitle>
            <DialogDescription>
              {syncCampaign ? (
                <>
                  Campanha <strong>{syncCampaign.name}</strong>. Cole UUIDs de leads (vários permitidos)
                  e/ou o ID do lote de importação.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="sync-leads">IDs de lead (UUID)</Label>
              <Textarea
                id="sync-leads"
                rows={4}
                value={leadIdsRaw}
                onChange={(e) => setLeadIdsRaw(e.target.value)}
                placeholder="Cole uma lista; os UUIDs são detetados automaticamente."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sync-batch">ID do lote de importação (opcional)</Label>
              <Input
                id="sync-batch"
                value={importBatchId}
                onChange={(e) => setImportBatchId(e.target.value)}
                placeholder="UUID do batch"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSyncOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={submitSync} disabled={syncMutation.isPending}>
              {syncMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> A enviar…
                </>
              ) : (
                "Sincronizar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
