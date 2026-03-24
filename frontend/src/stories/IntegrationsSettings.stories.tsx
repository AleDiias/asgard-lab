import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "react-router-dom";
import { Filter, Plus } from "lucide-react";
import "@/locales/i18n";
import { ActionBar, Button } from "@/components/ui";
import { TablePaginationBar } from "@/components/ui/table";
import {
  INTEGRATIONS_SETTINGS_ROUTES,
  IntegrationListUI,
  integrationsSettingsScreen,
  type IntegrationListRow,
} from "@/components/screens/integrations";
import {
  DEFAULT_CONFIG_PAGE_SIZE,
  usePaginationSlice,
} from "@/hooks/use-pagination-slice";

const sampleIntegrations: IntegrationListRow[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    provider: "vonix",
    name: "Discador principal",
    isActive: true,
    createdAt: "2026-03-10T10:00:00.000Z",
    updatedAt: "2026-03-10T12:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    provider: "aspect",
    name: "Integração legado",
    isActive: false,
    createdAt: "2026-02-01T08:30:00.000Z",
    updatedAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    provider: "custom",
    name: "API interna",
    isActive: true,
    createdAt: "2026-01-15T14:20:00.000Z",
    updatedAt: "2026-01-15T14:20:00.000Z",
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
      <Link to={INTEGRATIONS_SETTINGS_ROUTES.new}>
        <Plus className="h-4 w-4" aria-hidden />
        Nova integração
      </Link>
    </Button>
  </>
);

function IntegrationsListPaginatedDemo({ rows }: { rows: IntegrationListRow[] }) {
  const { paginatedItems, page, setPage, pageSize, setPageSize, totalItems } =
    usePaginationSlice(rows, {
      initialPageSize: DEFAULT_CONFIG_PAGE_SIZE,
    });

  return (
    <>
      <IntegrationListUI
        loading={false}
        rows={paginatedItems}
        hideTitle
        onEdit={() => {}}
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

const meta = {
  title: "Screens/Config/Integrações",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

/** Mesmo layout que `SettingsIntegrationsPage` (lista + barra de paginação). */
export const ListaComDados: StoryObj = {
  name: "Lista — com dados",
  render: () => (
    <section className="space-y-3">
      <ActionBar
        title={integrationsSettingsScreen.list.title}
        breadcrumb={[...integrationsSettingsScreen.list.breadcrumb]}
        actions={listActions}
      />
      <IntegrationsListPaginatedDemo rows={sampleIntegrations} />
    </section>
  ),
};

export const ListaVazia: StoryObj = {
  name: "Lista — vazia",
  render: () => (
    <section className="space-y-3">
      <ActionBar
        title={integrationsSettingsScreen.list.title}
        breadcrumb={[...integrationsSettingsScreen.list.breadcrumb]}
        actions={listActions}
      />
      <IntegrationListUI rows={[]} hideTitle />
    </section>
  ),
};

export const ListaLoading: StoryObj = {
  name: "Lista — a carregar",
  render: () => (
    <section className="space-y-3">
      <ActionBar
        title={integrationsSettingsScreen.list.title}
        breadcrumb={[...integrationsSettingsScreen.list.breadcrumb]}
        actions={listActions}
      />
      <IntegrationListUI loading rows={[]} hideTitle />
    </section>
  ),
};

export const ListaErro: StoryObj = {
  name: "Lista — erro (como na página)",
  render: () => (
    <section className="space-y-3">
      <ActionBar
        title={integrationsSettingsScreen.list.title}
        breadcrumb={[...integrationsSettingsScreen.list.breadcrumb]}
        actions={listActions}
      />
      <p className="text-sm text-destructive">Request failed with status code 500</p>
    </section>
  ),
};

export const ListaSomenteLeitura: StoryObj = {
  name: "Lista — sem edição",
  render: () => (
    <section className="space-y-3">
      <ActionBar
        title={integrationsSettingsScreen.list.title}
        breadcrumb={[...integrationsSettingsScreen.list.breadcrumb]}
        actions={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            aria-label="Filtros"
          >
            <Filter className="h-4 w-4" aria-hidden />
          </Button>
        }
      />
      <IntegrationListUI rows={sampleIntegrations} hideTitle canEdit={false} />
    </section>
  ),
};
