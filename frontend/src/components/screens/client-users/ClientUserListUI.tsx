import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  configTableShellClassName,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import type { ClientUserListRow } from "./types";

const MAX_PERMISSION_BADGES = 2;

export interface ClientUserListUILabels {
  title?: string;
  columnName?: string;
  columnEmail?: string;
  columnRole?: string;
  columnPermissions?: string;
  columnActions?: string;
  emptyPermissions?: string;
  edit?: string;
  delete?: string;
  /** Placeholder "+N" quando há mais permissões que o máximo de badges (ex.: "+3 permissões"). */
  morePermissions?: string;
}

const defaultLabels: Required<ClientUserListUILabels> = {
  title: "Usuários",
  columnName: "Nome",
  columnEmail: "E-mail",
  columnRole: "Função",
  columnPermissions: "Permissões",
  columnActions: "Ações",
  emptyPermissions: "—",
  edit: "Editar",
  delete: "Excluir",
  morePermissions: "+{count} permissões",
};

export interface ClientUserListUIProps {
  rows: ClientUserListRow[];
  /** Mostra cabeçalhos da tabela e a mensagem no corpo (sem linhas de dados). */
  loading?: boolean;
  loadingMessage?: string;
  labels?: ClientUserListUILabels;
  emptyMessage?: string;
  onEdit: (row: ClientUserListRow) => void;
  onDelete: (row: ClientUserListRow) => void;
  /** Quando `true`, não renderiza o título (ex.: ActionBar na página). */
  hideTitle?: boolean;
  className?: string;
}

const TABLE_COL_COUNT = 5;

export function ClientUserListUI({
  rows,
  loading = false,
  loadingMessage = "A carregar usuários…",
  labels: labelsProp,
  emptyMessage = "Nenhum usuário localizado.",
  onEdit,
  onDelete,
  hideTitle = false,
  className,
}: ClientUserListUIProps) {
  const labels = { ...defaultLabels, ...labelsProp };

  const tableHeader = (
    <TableHeader>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableHead>{labels.columnName}</TableHead>
        <TableHead>{labels.columnEmail}</TableHead>
        <TableHead>{labels.columnRole}</TableHead>
        <TableHead className="text-center">{labels.columnPermissions}</TableHead>
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
              {rows.map((row) => (
                <TableRow key={row.id} className="even:bg-muted/20">
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.role ?? "—"}</TableCell>
                  <TableCell className="align-middle text-center">
                    {row.permissionLabels.length === 0 ? (
                      <span className="text-muted-foreground">{labels.emptyPermissions}</span>
                    ) : (
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <div className="flex cursor-default flex-wrap items-center justify-center gap-1 px-0.5">
                            {row.permissionLabels
                              .slice(0, MAX_PERMISSION_BADGES)
                              .map((permLabel, idx) => (
                                <Badge
                                  key={`${row.id}-perm-${idx}`}
                                  variant="outline"
                                  size="md"
                                  className="max-w-[120px] truncate font-normal"
                                >
                                  {permLabel}
                                </Badge>
                              ))}
                            {row.permissionLabels.length > MAX_PERMISSION_BADGES ? (
                              <Badge
                                variant="secondary"
                                size="md"
                                className="shrink-0 font-normal"
                              >
                                {labels.morePermissions.replace(
                                  "{count}",
                                  String(row.permissionLabels.length - MAX_PERMISSION_BADGES)
                                )}
                              </Badge>
                            ) : null}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs border-border bg-popover px-3 py-2">
                          <p className="mb-1.5 text-xs font-medium text-foreground">
                            {labels.columnPermissions}
                          </p>
                          <ul className="list-inside list-disc space-y-0.5 text-left text-xs text-popover-foreground">
                            {row.permissionLabels.map((permLabel, tipIdx) => (
                              <li key={`${row.id}-tip-${tipIdx}`}>{permLabel}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-accent hover:text-foreground"
                        onClick={() => onEdit(row)}
                        aria-label={labels.edit}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDelete(row)}
                        aria-label={labels.delete}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
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
