import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Filter, UserPlus } from "lucide-react";
import { ActionBar, Button } from "@/components/ui";
import { TablePaginationBar } from "@/components/ui/table";
import {
  DEFAULT_CONFIG_PAGE_SIZE,
  usePaginationSlice,
} from "@/hooks/use-pagination-slice";
import {
  CLIENT_USERS_ROUTES,
  ClientUserListUI,
  clientUsersScreen,
} from "@/components/screens/client-users";
import type { ClientUserListRow } from "@/components/screens/client-users/types";
import { listTenantUsersFn } from "@/api/admin/admin.api";
import type { TenantUserRecord } from "@/types/admin.types";

function mapToRow(u: TenantUserRecord): ClientUserListRow {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.isActive ? "active" : "inactive",
    permissionLabels: u.permissions,
  };
}

export default function ClientUsersPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tenant", "users"],
    queryFn: listTenantUsersFn,
  });

  const rows: ClientUserListRow[] = useMemo(() => (data ?? []).map(mapToRow), [data]);
  const {
    paginatedItems,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
  } = usePaginationSlice(rows, {
    initialPageSize: DEFAULT_CONFIG_PAGE_SIZE,
  });

  return (
    <section className="space-y-3">
      <ActionBar
        title={clientUsersScreen.list.title}
        breadcrumb={[...clientUsersScreen.list.breadcrumb]}
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
              <Link to={CLIENT_USERS_ROUTES.newUser}>
                <UserPlus className="h-4 w-4" aria-hidden />
                Novo usuário
              </Link>
            </Button>
          </>
        }
      />
      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Erro ao carregar utilizadores."}
        </p>
      ) : (
        <>
          <ClientUserListUI
            loading={isLoading}
            rows={paginatedItems}
            hideTitle
            onEdit={() => { }}
            onDelete={() => { }}
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
