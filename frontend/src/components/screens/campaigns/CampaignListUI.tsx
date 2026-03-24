import { Pencil, RefreshCw } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { CampaignListRow } from "./types";
import { campaignStatusDotClass, labelCampaignStatus } from "./campaign-status";

function cellOrDash(value: string | null | undefined): string {
  const t = (value ?? "").trim();
  return t.length > 0 ? t : "—";
}

export interface CampaignListUILabels {
  title?: string;
  columnName?: string;
  columnDialer?: string;
  columnStatus?: string;
  columnExternalId?: string;
  columnActions?: string;
  actionSync?: string;
  actionEdit?: string;
}

const defaultLabels: Required<CampaignListUILabels> = {
  title: "Campanhas",
  columnName: "Nome",
  columnDialer: "Discador",
  columnStatus: "Estado",
  columnExternalId: "ID campanha (externo)",
  columnActions: "Ações",
  actionSync: "Sincronizar leads",
  actionEdit: "Editar campanha",
};

export interface CampaignListUIProps {
  rows: CampaignListRow[];
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  labels?: CampaignListUILabels;
  hideTitle?: boolean;
  className?: string;
  onSyncLeads?: (row: CampaignListRow) => void;
  canSync?: boolean;
  onEdit?: (row: CampaignListRow) => void;
  canEdit?: boolean;
}

const TABLE_COL_COUNT = 5;

export function CampaignListUI({
  rows,
  loading = false,
  loadingMessage = "A carregar campanhas…",
  emptyMessage = "Nenhuma campanha encontrada.",
  labels: labelsProp,
  hideTitle = false,
  className,
  onSyncLeads,
  canSync,
  onEdit,
  canEdit,
}: CampaignListUIProps) {
  const labels = { ...defaultLabels, ...labelsProp };

  const tableHeader = (
    <TableHeader>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableHead className="min-w-[10rem] whitespace-nowrap">{labels.columnName}</TableHead>
        <TableHead className="min-w-[9rem] whitespace-nowrap">{labels.columnDialer}</TableHead>
        <TableHead className="min-w-[8rem] whitespace-nowrap">{labels.columnStatus}</TableHead>
        <TableHead className="min-w-[8rem] whitespace-nowrap">{labels.columnExternalId}</TableHead>
        <TableHead
          className={cn(
            "sticky right-0 z-20 min-w-[5.5rem] whitespace-nowrap border-l border-border bg-muted/40 text-right shadow-[-6px_0_8px_-6px_hsl(var(--border))]",
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
              {rows.map((row) => {
                const dialer =
                  row.integrationName && row.integrationProvider
                    ? `${row.integrationProvider.toUpperCase()} — ${row.integrationName}`
                    : "—";
                return (
                  <TableRow key={row.id} className="even:bg-muted/20">
                    <TableCell className="font-medium">{cellOrDash(row.name)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{dialer}</TableCell>
                    <TableCell>
                      <StatusWithDot
                        label={labelCampaignStatus(row.status)}
                        dotClassName={campaignStatusDotClass(row.status)}
                      />
                    </TableCell>
                    <TableCell
                      className="max-w-[12rem] truncate font-mono text-xs text-muted-foreground"
                      title={row.externalCampaignId ?? undefined}
                    >
                      {cellOrDash(row.externalCampaignId)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "sticky right-0 z-10 border-l border-border bg-background text-right shadow-[-6px_0_8px_-6px_hsl(var(--border))]"
                      )}
                    >
                      <div className="flex justify-end gap-0.5">
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
                        {canSync && onSyncLeads ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-accent hover:text-foreground"
                            onClick={() => onSyncLeads(row)}
                            aria-label={labels.actionSync}
                          >
                            <RefreshCw className="h-4 w-4" aria-hidden />
                          </Button>
                        ) : null}
                      </div>
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
