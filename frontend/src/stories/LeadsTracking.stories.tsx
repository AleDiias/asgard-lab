import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import "@/locales/i18n";
import { ActionBar, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { LeadImportBatchRecord, LeadRecord } from "@/types/core-leads.types";
import {
  cycleLeadTableSort,
  LeadsByFilePanelUI,
  LeadsContactsTableUI,
  LeadsKpiCardsUI,
  LeadTrackingFiltersCardUI,
  type LeadSortableColumn,
  type LeadTableSortState,
} from "@/components/screens/leads/tracking";

const BATCH_A = "11111111-1111-4111-8111-111111111111";
const BATCH_B = "22222222-2222-4222-8222-222222222222";

const sampleBatches: LeadImportBatchRecord[] = [
  {
    id: BATCH_A,
    fileName: "campanha_jan.csv",
    importedCount: 120,
    removedCount: 5,
    createdAt: "2026-03-10T10:00:00.000Z",
  },
  {
    id: BATCH_B,
    fileName: "lista_fria.csv",
    importedCount: 45,
    removedCount: 2,
    createdAt: "2026-03-12T14:30:00.000Z",
  },
];

const sampleLeads: LeadRecord[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Ana Costa",
    phone: "+351910000001",
    email: "ana@example.com",
    status: "novo",
    importBatchId: BATCH_A,
    createdAt: "2026-03-10T10:05:00.000Z",
    updatedAt: "2026-03-10T10:05:00.000Z",
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    name: "Bruno Silva",
    phone: "+351920000002",
    email: null,
    status: "em_atendimento",
    importBatchId: BATCH_A,
    createdAt: "2026-03-10T11:00:00.000Z",
    updatedAt: "2026-03-11T09:00:00.000Z",
  },
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    name: "Carla Mendes",
    phone: "+351930000003",
    email: "carla@example.com",
    status: "finalizado",
    importBatchId: BATCH_B,
    createdAt: "2026-03-12T15:00:00.000Z",
    updatedAt: "2026-03-13T14:00:00.000Z",
  },
];

const sampleMetrics = {
  totalLeads: 248,
  novos: 120,
  emAtendimento: 80,
  finalizados: 48,
  totalImportFiles: 12,
  totalLinesImported: 5600,
};

const defaultSort: LeadTableSortState = { mode: "default" };

const meta = {
  title: "Screens/Dashboards/Leads tracking",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** Cartões de KPI com totais de leads. */
export const KpiCards: Story = {
  name: "KPIs — com dados",
  render: () => (
    <div className="max-w-6xl">
      <LeadsKpiCardsUI metrics={sampleMetrics} />
    </div>
  ),
};

export const KpiCardsLoading: Story = {
  name: "KPIs — a carregar",
  render: () => (
    <div className="max-w-6xl">
      <LeadsKpiCardsUI metrics={undefined} loading />
    </div>
  ),
};

function ContactosComDadosStory() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<LeadTableSortState>(defaultSort);
  return (
    <div className="max-w-5xl">
      <LeadsContactsTableUI
        items={sampleLeads}
        searchQuery={q}
        onSearchChange={setQ}
        sort={sort}
        onSortChange={(col: LeadSortableColumn) => setSort((prev) => cycleLeadTableSort(col, prev))}
      />
    </div>
  );
}

function ContactosVazioStory() {
  const [q, setQ] = useState("");
  return (
    <div className="max-w-5xl">
      <LeadsContactsTableUI
        items={[]}
        searchQuery={q}
        onSearchChange={setQ}
        sort={defaultSort}
        onSortChange={() => { }}
        emptyLabel="Sem contatos para exibir."
      />
    </div>
  );
}

/** Tabela de contactos com pesquisa e colunas configuráveis. */
export const ContactosComDados: Story = {
  name: "Contactos — com dados",
  render: () => <ContactosComDadosStory />,
};

export const ContactosVazio: Story = {
  name: "Contactos — vazio",
  render: () => <ContactosVazioStory />,
};

export const ContactosLoading: Story = {
  name: "Contatos — a carregar",
  render: () => (
    <div className="max-w-5xl">
      <LeadsContactsTableUI
        items={[]}
        loading
        searchQuery=""
        onSearchChange={() => { }}
        sort={defaultSort}
        onSortChange={() => { }}
      />
    </div>
  ),
};

function FiltrosCardStory() {
  const [draft, setDraft] = useState<string | "all">("all");
  return (
    <div className="max-w-sm">
      <LeadTrackingFiltersCardUI
        importBatchId={draft}
        onImportBatchIdChange={setDraft}
        batches={sampleBatches}
        onApply={() => { }}
      />
    </div>
  );
}

/** Filtro por ficheiro de importação + Aplicar. */
export const FiltrosCard: Story = {
  name: "Filtros — Leads de importação",
  render: () => <FiltrosCardStory />,
};

function PainelPorFicheiroDemo() {
  const [io, setIo] = useState(true);
  const [ro, setRo] = useState(false);
  const batchById = new Map(sampleBatches.map((b) => [b.id, b]));
  const removidos = sampleBatches.filter((b) => b.removedCount > 0);
  const imported = sampleLeads.filter((l) => l.importBatchId);

  return (
    <div className="max-w-xl">
      <LeadsByFilePanelUI
        importedLeads={imported}
        batchById={batchById}
        removidosBatches={removidos}
        importadosOpen={io}
        onImportadosOpenChange={setIo}
        removidosOpen={ro}
        onRemovidosOpenChange={setRo}
      />
    </div>
  );
}

/** Painel Importados / Removidos (colapsáveis). */
export const PainelPorFicheiro: Story = {
  name: "Leads alimentados — painel",
  render: () => <PainelPorFicheiroDemo />,
};

function LayoutCompletoDemo() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<LeadTableSortState>(defaultSort);
  const [draft, setDraft] = useState<string | "all">("all");
  const [io, setIo] = useState(false);
  const [ro, setRo] = useState(false);
  const batchById = new Map(sampleBatches.map((b) => [b.id, b]));
  const removidos = sampleBatches.filter((b) => b.removedCount > 0);
  const imported = sampleLeads.filter((l) => l.importBatchId);

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <ActionBar
        title="Acompanhamento de Leads"
        breadcrumb={[
          { label: "Início", to: "/app" },
          { label: "Acompanhamento de Leads" },
        ]}
        actions={
          <Button type="button" size="sm" className="gap-1.5" asChild>
            <Link to="/app/leads/import">
              <Upload className="h-4 w-4" aria-hidden />
              Importar leads
            </Link>
          </Button>
        }
      />

      <LeadsKpiCardsUI metrics={sampleMetrics} />

      <div className="grid gap-6 lg:grid-cols-[1fr_min(100%,380px)]">
        <Card className="min-w-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Contatos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <LeadsContactsTableUI
              items={sampleLeads}
              searchQuery={q}
              onSearchChange={setQ}
              sort={sort}
              onSortChange={(col: LeadSortableColumn) =>
                setSort((prev) => cycleLeadTableSort(col, prev))
              }
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>3 registo(s) · Página 1 de 1</span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button type="button" variant="outline" size="sm" disabled>
                  Seguinte
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <LeadTrackingFiltersCardUI
            importBatchId={draft}
            onImportBatchIdChange={setDraft}
            batches={sampleBatches}
            onApply={() => { }}
          />
          <LeadsByFilePanelUI
            importedLeads={imported}
            batchById={batchById}
            removidosBatches={removidos}
            importadosOpen={io}
            onImportadosOpenChange={setIo}
            removidosOpen={ro}
            onRemovidosOpenChange={setRo}
          />
        </div>
      </div>
    </section>
  );
}

function FiltrosSemImportacoesDemo() {
  const [draft, setDraft] = useState<string>("all");
  return (
    <div className="max-w-md p-6">
      <LeadTrackingFiltersCardUI
        importBatchId={draft}
        onImportBatchIdChange={setDraft}
        batches={[]}
        onApply={() => { }}
      />
    </div>
  );
}

/** Filtros quando ainda não há importações (select desativado + mensagem). */
export const FiltrosSemImportacoes: Story = {
  name: "Filtros — sem importações",
  render: () => <FiltrosSemImportacoesDemo />,
};

/**
 * Composição da página de acompanhamento (sem dados da API — dados em memória).
 */
export const LayoutCompleto: Story = {
  name: "Página — layout completo (mock)",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <div className="min-h-screen bg-background p-6">
      <LayoutCompletoDemo />
    </div>
  ),
};
