import { Filter, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ActionBar, Button } from "@/components/ui";
import { TablePaginationBar } from "@/components/ui/table";
import {
  INTEGRATIONS_SETTINGS_ROUTES,
  IntegrationListUI,
  integrationsSettingsScreen,
} from "@/components/screens/integrations";
import { listIntegrationsFn } from "@/api/core/integrations.api";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessIntegrationsWrite } from "@/utils/asgard-access";
import {
  DEFAULT_CONFIG_PAGE_SIZE,
  usePaginationSlice,
} from "@/hooks/use-pagination-slice";

export default function SettingsIntegrationsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const canCreate = canAccessIntegrationsWrite(user);

  const { data: integrations = [], isLoading, isError, error } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => listIntegrationsFn(),
  });

  const { paginatedItems, page, setPage, pageSize, setPageSize, totalItems } =
    usePaginationSlice(integrations, {
      initialPageSize: DEFAULT_CONFIG_PAGE_SIZE,
    });

  return (
    <section className="space-y-3">
      <ActionBar
        title={integrationsSettingsScreen.list.title}
        breadcrumb={[...integrationsSettingsScreen.list.breadcrumb]}
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
            {canCreate ? (
              <Button type="button" size="sm" className="gap-1.5" asChild>
                <Link to={INTEGRATIONS_SETTINGS_ROUTES.new}>
                  <Plus className="h-4 w-4" aria-hidden />
                  Nova integração
                </Link>
              </Button>
            ) : null}
          </>
        }
      />
      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Erro ao carregar integrações."}
        </p>
      ) : (
        <>
          <IntegrationListUI
            loading={isLoading}
            rows={paginatedItems}
            hideTitle
            onEdit={canCreate ? (row) => navigate(INTEGRATIONS_SETTINGS_ROUTES.edit(row.id)) : undefined}
            canEdit={canCreate}
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
    </section>
  );
}
