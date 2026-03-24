import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "react-router-dom";
import { Filter, Plus } from "lucide-react";
import "@/locales/i18n";
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
import {
  DEFAULT_CONFIG_PAGE_SIZE,
  usePaginationSlice,
} from "@/hooks/use-pagination-slice";

const INTEGRATION_A = "11111111-1111-4111-8111-111111111111";

const sampleCampaigns: CampaignListRow[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    integrationId: INTEGRATION_A,
    name: "Campanha outbound Q1",
    externalCampaignId: "vonix-camp-9012",
    status: "active",
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-20T11:00:00.000Z",
    integrationName: "Discador principal",
    integrationProvider: "vonix",
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    integrationId: null,
    name: "Rascunho interno",
    externalCampaignId: null,
    status: "draft",
    createdAt: "2026-02-10T14:00:00.000Z",
    updatedAt: "2026-02-10T14:00:00.000Z",
    integrationName: null,
    integrationProvider: null,
  },
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    integrationId: INTEGRATION_A,
    name: "Pausada — follow-up",
    externalCampaignId: "ext-4400",
    status: "paused",
    createdAt: "2026-01-05T08:00:00.000Z",
    updatedAt: "2026-03-15T16:30:00.000Z",
    integrationName: "Discador principal",
    integrationProvider: "vonix",
  },
];

const listActions = (
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
    <Button type="button" size="sm" className="gap-1.5" asChild>
      <Link to={CAMPAIGN_ROUTES.new}>
        <Plus className="h-4 w-4" aria-hidden />
        Nova campanha
      </Link>
    </Button>
  </>
);

function CampaignsListPaginatedDemo({ rows }: { rows: CampaignListRow[] }) {
  const { paginatedItems, page, setPage, pageSize, setPageSize, totalItems } =
    usePaginationSlice(rows, {
      initialPageSize: DEFAULT_CONFIG_PAGE_SIZE,
    });

  return (
    <>
      <CampaignListUI
        loading={false}
        rows={paginatedItems}
        hideTitle
        onSyncLeads={() => { }}
        onEdit={() => { }}
        canSync
        canEdit
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
  );
}

/** Diálogo de sincronização como em `CampaignsPage` (estado local). */
function CampaignsPageWithSyncDialogDemo() {
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncCampaign, setSyncCampaign] = useState<CampaignListRow | null>(null);
  const [leadIdsRaw, setLeadIdsRaw] = useState("");
  const [importBatchId, setImportBatchId] = useState("");

  const { paginatedItems, page, setPage, pageSize, setPageSize, totalItems } =
    usePaginationSlice(sampleCampaigns, {
      initialPageSize: DEFAULT_CONFIG_PAGE_SIZE,
    });

  const openSync = (c: CampaignListRow) => {
    setSyncCampaign(c);
    setLeadIdsRaw("");
    setImportBatchId("");
    setSyncOpen(true);
  };

  return (
    <section className="space-y-3">
      <ActionBar
        title={campaignsScreen.list.title}
        breadcrumb={[...campaignsScreen.list.breadcrumb]}
        actions={listActions}
      />
      <CampaignListUI
        loading={false}
        rows={paginatedItems}
        hideTitle
        onSyncLeads={openSync}
        onEdit={() => { }}
        canSync
        canEdit
      />
      <TablePaginationBar
        totalItems={totalItems}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        className="mt-2 rounded-lg border border-border"
      />

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
              <Label htmlFor="story-sync-leads">IDs de lead (UUID)</Label>
              <Textarea
                id="story-sync-leads"
                rows={4}
                value={leadIdsRaw}
                onChange={(e) => setLeadIdsRaw(e.target.value)}
                placeholder="Cole uma lista; os UUIDs são detetados automaticamente."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="story-sync-batch">ID do lote de importação (opcional)</Label>
              <Input
                id="story-sync-batch"
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
            <Button type="button" onClick={() => setSyncOpen(false)}>
              Sincronizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

const meta = {
  title: "Screens/Dashboards/Campanhas",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const ListaComDados: StoryObj = {
  name: "Lista — com dados",
  render: () => (
    <section className="space-y-3">
      <ActionBar
        title={campaignsScreen.list.title}
        breadcrumb={[...campaignsScreen.list.breadcrumb]}
        actions={listActions}
      />
      <CampaignsListPaginatedDemo rows={sampleCampaigns} />
    </section>
  ),
};

export const ListaVazia: StoryObj = {
  name: "Lista — vazia",
  render: () => (
    <section className="space-y-3">
      <ActionBar
        title={campaignsScreen.list.title}
        breadcrumb={[...campaignsScreen.list.breadcrumb]}
        actions={listActions}
      />
      <CampaignListUI rows={[]} hideTitle />
    </section>
  ),
};

export const ListaLoading: StoryObj = {
  name: "Lista — a carregar",
  render: () => (
    <section className="space-y-3">
      <ActionBar
        title={campaignsScreen.list.title}
        breadcrumb={[...campaignsScreen.list.breadcrumb]}
        actions={listActions}
      />
      <CampaignListUI loading rows={[]} hideTitle />
    </section>
  ),
};

export const ListaErro: StoryObj = {
  name: "Lista — erro (como na página)",
  render: () => (
    <section className="space-y-3">
      <ActionBar
        title={campaignsScreen.list.title}
        breadcrumb={[...campaignsScreen.list.breadcrumb]}
        actions={listActions}
      />
      <p className="text-sm text-destructive">Erro ao carregar campanhas.</p>
    </section>
  ),
};

export const ListaComDialogoSincronizar: StoryObj = {
  name: "Lista — abrir sincronizar leads",
  render: () => <CampaignsPageWithSyncDialogDemo />,
  parameters: {
    docs: {
      description: {
        story: "Use o botão de sincronizar numa linha para abrir o diálogo (igual à página).",
      },
    },
  },
};
