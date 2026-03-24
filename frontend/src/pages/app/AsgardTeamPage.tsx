import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, UserPlus } from "lucide-react";
import { ActionBar, Button } from "@/components/ui";
import { TablePaginationBar } from "@/components/ui/table";
import { usePaginationSlice } from "@/hooks/use-pagination-slice";
import {
  ASGARD_USERS_ROUTES,
  AsgardUserListUI,
  asgardUsersScreen,
} from "@/components/screens/asgard-users";
import type { AsgardUserListRow } from "@/components/screens/asgard-users/types";
import { listAsgardUsersFn, patchAsgardUserStatusFn } from "@/api/admin/admin.api";
import type { AsgardUserRecord } from "@/types/admin.types";

function mapToRow(u: AsgardUserRecord): AsgardUserListRow {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    status: u.isActive ? "active" : "inactive",
  };
}

export default function AsgardTeamPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "asgard-users"],
    queryFn: listAsgardUsersFn,
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await patchAsgardUserStatusFn(id, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "asgard-users"] });
    },
  });

  const rows: AsgardUserListRow[] = useMemo(() => (data ?? []).map(mapToRow), [data]);
  const { paginatedItems, page, setPage, pageSize, setPageSize, totalItems } =
    usePaginationSlice(rows);

  const handleToggleStatus = (row: AsgardUserListRow) => {
    const isActive = row.status !== "active";
    toggleStatus.mutate({ id: row.id, isActive });
  };

  const togglingRowId =
    toggleStatus.isPending && toggleStatus.variables
      ? toggleStatus.variables.id
      : null;

  return (
    <section className="space-y-3">
      <ActionBar
        title={asgardUsersScreen.list.title}
        breadcrumb={[...asgardUsersScreen.list.breadcrumb]}
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
              <Link to={ASGARD_USERS_ROUTES.newMember}>
                <UserPlus className="h-4 w-4" aria-hidden />
                Novo membro
              </Link>
            </Button>
          </>
        }
      />
      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Erro ao carregar a equipe Asgard."}
        </p>
      ) : (
        <>
          <AsgardUserListUI
            loading={isLoading}
            rows={paginatedItems}
            hideTitle
            togglingRowId={togglingRowId}
            onToggleStatus={handleToggleStatus}
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
