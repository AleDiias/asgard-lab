import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  configTableShellClassName,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusWithDot } from "@/components/ui/status-with-dot";
import { activeInactiveDotClass, labelActiveInactive } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { AsgardUserListRow } from "./types";

export interface AsgardUserListUILabels {
  title?: string;
  columnName?: string;
  columnEmail?: string;
  columnStatus?: string;
  columnActions?: string;
  statusActive?: string;
  statusInactive?: string;
  actionActivate?: string;
  actionDeactivate?: string;
}

const defaultLabels: Required<AsgardUserListUILabels> = {
  title: "Equipe Asgard (interno)",
  columnName: "Nome",
  columnEmail: "E-mail",
  columnStatus: "Status",
  columnActions: "Ações",
  statusActive: "Ativo",
  statusInactive: "Inativo",
  actionActivate: "Ativar",
  actionDeactivate: "Inativar",
};

export interface AsgardUserListUIProps {
  rows: AsgardUserListRow[];
  /** Alterna ativo/inativo (PATCH /admin/asgard/users/:id/status). */
  onToggleStatus: (row: AsgardUserListRow) => void;
  /** Enquanto o PATCH corre, desativa o botão dessa linha. */
  togglingRowId?: string | null;
  /** Mostra cabeçalhos da tabela e mensagem no corpo (sem linhas de dados). */
  loading?: boolean;
  loadingMessage?: string;
  labels?: AsgardUserListUILabels;
  emptyMessage?: string;
  /** Quando `true`, não renderiza o título (ex.: ActionBar na página). */
  hideTitle?: boolean;
  className?: string;
}

const TABLE_COL_COUNT = 4;

export function AsgardUserListUI({
  rows,
  onToggleStatus,
  togglingRowId = null,
  loading = false,
  loadingMessage = "A carregar a equipe…",
  labels: labelsProp,
  emptyMessage = "Nenhum membro cadastrado.",
  hideTitle = false,
  className,
}: AsgardUserListUIProps) {
  const labels = { ...defaultLabels, ...labelsProp };

  const statusLabels = {
    active: labels.statusActive,
    inactive: labels.statusInactive,
  };

  const tableHeader = (
    <TableHeader>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableHead>{labels.columnName}</TableHead>
        <TableHead>{labels.columnEmail}</TableHead>
        <TableHead>{labels.columnStatus}</TableHead>
        <TableHead className="text-right">{labels.columnActions}</TableHead>
      </TableRow>
    </TableHeader>
  );

  const shell = configTableShellClassName();

  return (
    <div className={cn("w-full space-y-3", className)}>
      {!hideTitle ? (
        <h2 className="text-lg font-semibold text-foreground">{labels.title}</h2>
      ) : null}
      {loading ? (
        <div className={shell}>
          <Table aria-busy="true">
            {tableHeader}
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={TABLE_COL_COUNT}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  <span role="status" aria-live="polite">
                    {loadingMessage}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ) : rows.length === 0 ? (
        <div className={shell}>
          <Table>
            {tableHeader}
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={TABLE_COL_COUNT}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  <span role="status" aria-live="polite">
                    {emptyMessage}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className={shell}>
          <Table>
            {tableHeader}
            <TableBody>
              {rows.map((row) => {
                const isToggling = togglingRowId === row.id;
                const statusLabel = labelActiveInactive(row.status, statusLabels);
                return (
                  <TableRow key={row.id} className="even:bg-muted/20">
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>
                      <StatusWithDot
                        label={statusLabel}
                        dotClassName={activeInactiveDotClass(row.status)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        disabled={isToggling}
                        onClick={() => onToggleStatus(row)}
                        aria-label={
                          row.status === "active"
                            ? labels.actionDeactivate
                            : labels.actionActivate
                        }
                      >
                        {row.status === "active"
                          ? labels.actionDeactivate
                          : labels.actionActivate}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
