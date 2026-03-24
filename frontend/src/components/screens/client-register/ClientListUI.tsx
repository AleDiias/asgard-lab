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
import { companyAccountDotClass, labelCompanyAccount } from "@/lib/status";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import type { ClientListRow } from "./types";
import { cellOrDash, formatIsoDatePt } from "./client-register-display";

export interface ClientListUILabels {
  title?: string;
  columnCompany?: string;
  columnDomain?: string;
  columnCnpj?: string;
  columnBilling?: string;
  columnOwnerEmail?: string;
  columnPhone?: string;
  columnStatus?: string;
  columnActions?: string;
  statusActive?: string;
  statusInactive?: string;
  statusBlocked?: string;
  edit?: string;
}

const defaultLabels: Required<ClientListUILabels> = {
  title: "Empresas cadastradas",
  columnCompany: "Empresa",
  columnDomain: "Domínio",
  columnCnpj: "CNPJ",
  columnBilling: "Venc. / faturamento",
  columnOwnerEmail: "E-mail",
  columnPhone: "Telefone",
  columnStatus: "Status",
  columnActions: "Ações",
  statusActive: "Ativa",
  statusInactive: "Inativa",
  statusBlocked: "Bloqueado",
  edit: "Editar",
};

export interface ClientListUIProps {
  rows: ClientListRow[];
  onEdit: (row: ClientListRow) => void;
  /** Mostra cabeçalhos da tabela e mensagem no corpo (sem linhas de dados). */
  loading?: boolean;
  loadingMessage?: string;
  labels?: ClientListUILabels;
  emptyMessage?: string;
  /** Quando `true`, não renderiza o título (ex.: título vem do ActionBar na página). */
  hideTitle?: boolean;
  className?: string;
}

const TABLE_COL_COUNT = 8;

export function ClientListUI({
  rows,
  onEdit,
  loading = false,
  loadingMessage = "A carregar empresas…",
  labels: labelsProp,
  emptyMessage = "Nenhuma empresa encontrada.",
  hideTitle = false,
  className,
}: ClientListUIProps) {
  const labels = { ...defaultLabels, ...labelsProp };

  const tableHeader = (
    <TableHeader>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableHead className="min-w-[9rem] whitespace-nowrap">{labels.columnCompany}</TableHead>
        <TableHead className="min-w-[7rem] whitespace-nowrap">{labels.columnDomain}</TableHead>
        <TableHead className="min-w-[9.5rem] whitespace-nowrap">{labels.columnCnpj}</TableHead>
        <TableHead className="min-w-[8rem] whitespace-nowrap">{labels.columnBilling}</TableHead>
        <TableHead className="min-w-[12rem] whitespace-nowrap">{labels.columnOwnerEmail}</TableHead>
        <TableHead className="min-w-[8.5rem] whitespace-nowrap">{labels.columnPhone}</TableHead>
        <TableHead className="min-w-[7rem] whitespace-nowrap">{labels.columnStatus}</TableHead>
        <TableHead
          className={cn(
            "sticky right-0 z-20 min-w-[4.5rem] whitespace-nowrap border-l border-border bg-muted/40 text-right shadow-[-6px_0_8px_-6px_hsl(var(--border))]",
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
                  <TableCell className="font-medium">{cellOrDash(row.companyName)}</TableCell>
                  <TableCell className="whitespace-nowrap">{cellOrDash(row.domain)}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{cellOrDash(row.cnpj)}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {cellOrDash(formatIsoDatePt(row.billingDate))}
                  </TableCell>
                  <TableCell className="max-w-[14rem] truncate text-sm" title={row.ownerEmail}>
                    {cellOrDash(row.ownerEmail)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{cellOrDash(row.phone)}</TableCell>
                  <TableCell>
                    <StatusWithDot
                      label={labelCompanyAccount(row.status, {
                        active: labels.statusActive,
                        inactive: labels.statusInactive,
                        blocked: labels.statusBlocked,
                      })}
                      dotClassName={companyAccountDotClass(row.status)}
                    />
                  </TableCell>
                  <TableCell
                    className={cn(
                      "sticky right-0 z-10 border-l border-border bg-background text-right shadow-[-6px_0_8px_-6px_hsl(var(--border))]"
                    )}
                  >
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
