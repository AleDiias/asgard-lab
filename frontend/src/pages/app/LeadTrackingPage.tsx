import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import { ActionBar, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { toast } from "sonner";
import { TablePaginationBar } from "@/components/ui/table";
import {
  deleteImportBatchFn,
  deleteLeadFn,
  getLeadMetricsFn,
  listImportBatchesFn,
  listLeadsFn,
} from "@/api/core/leads.api";
import {
  buildLeadTrackingFiltersApplySchema,
  mapLeadTrackingFiltersFieldErrors,
} from "@/pages/app/schemas/lead-tracking-filters.schema";
import {
  cycleLeadTableSort,
  leadTableSortToApi,
  LeadTrackingFiltersCardUI,
  type LeadTrackingFiltersFieldErrors,
  LeadsByFilePanelUI,
  LeadsContactsTableUI,
  LeadsKpiCardsUI,
  type LeadSortableColumn,
  type LeadTableSortState,
} from "@/components/screens/leads/tracking";
import type { LeadImportBatchRecord } from "@/types/core-leads.types";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessLeadsImport } from "@/utils/asgard-access";
import { getErrorMessage } from "@/utils/feedback";

const PAGE_SIZE = 25;

export default function LeadTrackingPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const showImport = canAccessLeadsImport(user);

  const [qInput, setQInput] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [draftImportBatchId, setDraftImportBatchId] = useState<string | "all">("all");
  const [appliedImportBatchId, setAppliedImportBatchId] = useState<string | "all">("all");
  const [filterFieldErrors, setFilterFieldErrors] = useState<LeadTrackingFiltersFieldErrors>({});
  const [sortState, setSortState] = useState<LeadTableSortState>({ mode: "default" });
  const [page, setPage] = useState(1);

  const [importadosOpen, setImportadosOpen] = useState(false);
  const [removidosOpen, setRemovidosOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setQDebounced(qInput.trim()), 350);
    return () => window.clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    setPage(1);
  }, [qDebounced, appliedImportBatchId, sortState]);

  const handleSortColumn = useCallback((column: LeadSortableColumn) => {
    setSortState((prev) => cycleLeadTableSort(column, prev));
  }, []);

  const handleDraftImportBatchChange = useCallback((value: string | "all") => {
    setDraftImportBatchId(value);
    setFilterFieldErrors({});
  }, []);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["lead-metrics"],
    queryFn: getLeadMetricsFn,
  });

  const { data: batchesData } = useQuery({
    queryKey: ["import-batches-options"],
    queryFn: () => listImportBatchesFn({ page: 1, pageSize: 100 }),
  });

  const handleApplyFilters = useCallback(() => {
    const batchIds = (batchesData?.items ?? []).map((b) => b.id);
    const schema = buildLeadTrackingFiltersApplySchema(batchIds);
    const parsed = schema.safeParse({ importBatchId: draftImportBatchId });
    if (!parsed.success) {
      setFilterFieldErrors(mapLeadTrackingFiltersFieldErrors(parsed.error));
      return;
    }
    setFilterFieldErrors({});
    setAppliedImportBatchId(parsed.data.importBatchId);
    setPage(1);
  }, [batchesData?.items, draftImportBatchId]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLeadFn(id),
    onSuccess: async () => {
      toast.success("Contato excluído com sucesso.");
      await qc.invalidateQueries({ queryKey: ["lead-metrics"] });
      await qc.invalidateQueries({ queryKey: ["leads-list"] });
      await qc.invalidateQueries({ queryKey: ["leads-importados-panel"] });
      await qc.invalidateQueries({ queryKey: ["import-batches-options"] });
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e, "Não foi possível excluir o contato."));
    },
  });
  const deleteBatchMutation = useMutation({
    mutationFn: (id: string) => deleteImportBatchFn(id),
    onSuccess: async (data) => {
      toast.success(`Lote removido com sucesso (${data.removedLeads} contacto(s)).`);
      await qc.invalidateQueries({ queryKey: ["lead-metrics"] });
      await qc.invalidateQueries({ queryKey: ["leads-list"] });
      await qc.invalidateQueries({ queryKey: ["import-batches-options"] });
    },
    onError: (e: unknown) => {
      toast.error(getErrorMessage(e, "Não foi possível remover o lote importado."));
    },
  });

  const removidosBatches = useMemo(() => {
    const all = batchesData?.items ?? [];
    if (appliedImportBatchId === "all") {
      return all.filter((b) => b.removedCount > 0);
    }
    return all.filter((b) => b.id === appliedImportBatchId && b.removedCount > 0);
  }, [batchesData, appliedImportBatchId]);

  const importedBatches = useMemo(() => {
    const all = batchesData?.items ?? [];
    if (appliedImportBatchId === "all") {
      return all.filter((b) => b.importedCount > 0);
    }
    return all.filter((b) => b.id === appliedImportBatchId && b.importedCount > 0);
  }, [batchesData, appliedImportBatchId]);

  useEffect(() => {
    const items = batchesData?.items ?? [];
    if (items.length === 0 && draftImportBatchId !== "all") {
      setDraftImportBatchId("all");
    }
  }, [batchesData?.items, draftImportBatchId]);

  const sortApi = leadTableSortToApi(sortState);

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: [
      "leads-list",
      page,
      qDebounced,
      appliedImportBatchId,
      sortApi,
    ],
    queryFn: () =>
      listLeadsFn({
        page,
        pageSize: PAGE_SIZE,
        q: qDebounced || undefined,
        sort: sortApi,
        importBatchId: appliedImportBatchId === "all" ? undefined : appliedImportBatchId,
      }),
  });

  const loadingImportedPanel = false;

  const items = leadsData?.items ?? [];
  const total = leadsData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="space-y-6">
      <ActionBar
        title="Acompanhamento de Leads"
        breadcrumb={[
          { label: "Início", to: "/app" },
          { label: "Acompanhamento de Leads" },
        ]}
        actions={
          showImport ? (
            <Button type="button" size="sm" className="gap-1.5" asChild>
              <Link to="/app/leads/import">
                <Upload className="h-4 w-4" aria-hidden />
                Importar leads
              </Link>
            </Button>
          ) : null
        }
      />

      <LeadsKpiCardsUI metrics={metrics} loading={metricsLoading} />

      <div className="grid gap-6 lg:grid-cols-[1fr_min(100%,380px)]">
        <Card className="min-w-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Contatos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <LeadsContactsTableUI
              items={items}
              loading={leadsLoading}
              searchQuery={qInput}
              onSearchChange={setQInput}
              sort={sortState}
              onSortChange={handleSortColumn}
              onDelete={(row) => {
                const ok = window.confirm(`Excluir o contato ${row.name}?`);
                if (!ok) return;
                deleteMutation.mutate(row.id);
              }}
            />
            {total > 0 ? (
              <TablePaginationBar
                totalItems={total}
                page={page}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                onPageSizeChange={() => {}}
                className="mt-2 rounded-lg border border-border"
              />
            ) : null}
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <LeadTrackingFiltersCardUI
            importBatchId={draftImportBatchId}
            onImportBatchIdChange={handleDraftImportBatchChange}
            batches={batchesData?.items ?? []}
            onApply={handleApplyFilters}
            disabled={leadsLoading}
            fieldErrors={filterFieldErrors}
          />

          <LeadsByFilePanelUI
            importedBatches={importedBatches}
            removidosBatches={removidosBatches}
            loadingImported={loadingImportedPanel}
            importadosOpen={importadosOpen}
            onImportadosOpenChange={setImportadosOpen}
            removidosOpen={removidosOpen}
            onRemovidosOpenChange={setRemovidosOpen}
            onRemoveImportedBatch={(b) => {
              const ok = window.confirm(
                `Remover o lote ${b.fileName}? Isso excluirá os contactos importados por esse arquivo.`
              );
              if (!ok) return;
              deleteBatchMutation.mutate(b.id);
            }}
          />
        </div>
      </div>
    </section>
  );
}
