import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  configTableShellClassName,
} from "@/components/ui/table";
import { StatusWithDot } from "@/components/ui/status-with-dot";
import { activeInactiveDotClass, labelActiveInactive } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { IntegrationListRow } from "./types";
import { cellOrDash, formatIntegrationDateTimePt, labelDialerProvider } from "./integration-display";

export interface IntegrationListUILabels {
  title?: string;
  columnProvider?: string;
  columnName?: string;
  columnStatus?: string;
  columnCreated?: string;
  columnActions?: string;
  statusActive?: string;
  statusInactive?: string;
  actionEdit?: string;
}

const defaultLabels: Required<IntegrationListUILabels> = {
  title: "Integrações configuradas",
  columnProvider: "Provedor",
  columnName: "Nome",
  columnCreated: "Criada em",
  columnStatus: "Status",
  columnActions: "Ações",
  statusActive: "Ativa",
  statusInactive: "Inativa",
  actionEdit: "Editar integração",
};

export interface IntegrationListUIProps {
  rows: IntegrationListRow[];
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  labels?: IntegrationListUILabels;
  hideTitle?: boolean;
  className?: string;
  onEdit?: (row: IntegrationListRow) => void;
  canEdit?: boolean;
}

const TABLE_COL_COUNT = 5;

export function IntegrationListUI({
  rows,
  loading = false,
  loadingMessage = "A carregar integrações…",
  emptyMessage = "Nenhuma integração encontrada.",
  labels: labelsProp,
  hideTitle = false,
  className,
  onEdit,
  canEdit,
}: IntegrationListUIProps) {
  const labels = { ...defaultLabels, ...labelsProp };

  const statusLabels = {
    active: labels.statusActive,
    inactive: labels.statusInactive,
  };

  const tableHeader = (
    <TableHeader>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableHead className="min-w-[8rem] whitespace-nowrap">{labels.columnProvider}</TableHead>
        <TableHead className="min-w-[10rem] whitespace-nowrap">{labels.columnName}</TableHead>
        <TableHead className="min-w-[9rem] whitespace-nowrap">{labels.columnCreated}</TableHead>
        <TableHead className="min-w-[7rem] whitespace-nowrap">{labels.columnStatus}</TableHead>
        <TableHead
          className={cn(
            "sticky right-0 z-20 min-w-[4.5rem] whitespace-nowrap border-l border-border bg-muted/40 text-left shadow-[-6px_0_8px_-6px_hsl(var(--border))]",
            "supports-[backdrop-filter]:backdrop-blur-sm"
          )}
        >
          {labels.columnActions}
        </TableHead>
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
              {rows.map((row) => (
                <TableRow key={row.id} className="even:bg-muted/20">
                  <TableCell className="font-medium">{labelDialerProvider(row.provider)}</TableCell>
                  <TableCell>{cellOrDash(row.name)}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatIntegrationDateTimePt(row.createdAt)}
                  </TableCell>
                  <TableCell>
                    <StatusWithDot
                      label={labelActiveInactive(row.isActive ? "active" : "inactive", statusLabels)}
                      dotClassName={activeInactiveDotClass(row.isActive ? "active" : "inactive")}
                    />
                  </TableCell>
                  <TableCell
                    className={cn(
                      "sticky right-0 z-10 border-l border-border bg-background text-left shadow-[-6px_0_8px_-6px_hsl(var(--border))]"
                    )}
                  >
                    {canEdit && onEdit ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-accent hover:text-foreground"
                        onClick={() => onEdit(row)}
                        aria-label={labels.actionEdit}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
