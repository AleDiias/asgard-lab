import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Filter, Plus } from "lucide-react";
import { ActionBar, Button } from "@/components/ui";
import { TablePaginationBar } from "@/components/ui/table";
import { usePaginationSlice } from "@/hooks/use-pagination-slice";
import {
  CLIENT_REGISTER_ROUTES,
  ClientListUI,
  clientRegisterScreen,
} from "@/components/screens/client-register";
import type { ClientListRow } from "@/components/screens/client-register/types";
import { listTenantsFn } from "@/api/admin/admin.api";
import type { TenantRecord } from "@/types/admin.types";

function mapTenantToRow(t: TenantRecord): ClientListRow {
  const name = t.companyName?.trim();
  return {
    id: t.id,
    companyName: name && name.length > 0 ? name : t.domain,
    domain: t.domain,
    status: t.isActive ? "active" : "inactive",
    cnpj: t.cnpj ?? "",
    billingDate: t.billingDate ?? "",
    ownerEmail: t.ownerEmail ?? "",
    phone: t.phone ?? "",
  };
}

export default function ClientsRegisterListPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "tenants"],
    queryFn: listTenantsFn,
  });

  const rows: ClientListRow[] = useMemo(() => (data ?? []).map(mapTenantToRow), [data]);
  const { paginatedItems, page, setPage, pageSize, setPageSize, totalItems } =
    usePaginationSlice(rows);

  return (
    <section className="space-y-3">
      <ActionBar
        title={clientRegisterScreen.list.title}
        breadcrumb={[...clientRegisterScreen.list.breadcrumb]}
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
            <Button type="button" size="sm" className="gap-1.5" asChild>
              <Link to={CLIENT_REGISTER_ROUTES.newCompany}>
                <Plus className="h-4 w-4" aria-hidden />
                Nova empresa
              </Link>
            </Button>
          </>
        }
      />
      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Erro ao carregar empresas."}
        </p>
      ) : (
        <>
          <ClientListUI
            loading={isLoading}
            rows={paginatedItems}
            hideTitle
            onEdit={(row) => navigate(CLIENT_REGISTER_ROUTES.editCompany(row.id))}
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
