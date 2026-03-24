import { ChevronDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import type { LeadImportBatchRecord, LeadRecord } from "@/types/core-leads.types";
import { cn } from "@/lib/utils";

function formatDt(iso: string) {
  try {
    return new Intl.DateTimeFormat("pt-PT", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const STATUS_LABEL: Record<LeadRecord["status"], string> = {
  novo: "Novo",
  em_atendimento: "Em atendimento",
  finalizado: "Finalizado",
};

export interface LeadsByFilePanelUIProps {
  importedLeads: LeadRecord[];
  batchById: Map<string, LeadImportBatchRecord>;
  /** Lotes com `removedCount` &gt; 0 (duplicados não importados). */
  removidosBatches: LeadImportBatchRecord[];
  loadingImported?: boolean;
  importadosOpen: boolean;
  onImportadosOpenChange: (open: boolean) => void;
  removidosOpen: boolean;
  onRemovidosOpenChange: (open: boolean) => void;
  className?: string;
}

/**
 * Presentacional: painel em card com secções Importados / Removidos (colapsáveis).
 */
export function LeadsByFilePanelUI({
  importedLeads,
  batchById,
  removidosBatches,
  loadingImported,
  importadosOpen,
  onImportadosOpenChange,
  removidosOpen,
  onRemovidosOpenChange,
  className,
}: LeadsByFilePanelUIProps) {
  const totalRemovidos = removidosBatches.reduce((acc, b) => acc + b.removedCount, 0);

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Leads alimentados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Collapsible open={importadosOpen} onOpenChange={onImportadosOpenChange}>
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5 text-left text-sm font-semibold hover:bg-muted/50">
            <span>
              Importados
              {importedLeads.length > 0 ? (
                <span className="ml-1 font-normal text-muted-foreground">
                  ({importedLeads.length.toLocaleString("pt-PT")})
                </span>
              ) : null}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                importadosOpen && "rotate-180"
              )}
              aria-hidden
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden">
            <div className="pt-3">
              {loadingImported ? (
                <p className="text-sm text-muted-foreground">A carregar…</p>
              ) : importedLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum contacto importado por arquivo com os filtros actuais.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do arquivo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importedLeads.map((row) => {
                        const fileName =
                          (row.importBatchId && batchById.get(row.importBatchId)?.fileName) ?? "—";
                        return (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">{fileName}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDt(row.createdAt)}
                            </TableCell>
                            <TableCell>{STATUS_LABEL[row.status]}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={removidosOpen} onOpenChange={onRemovidosOpenChange}>
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5 text-left text-sm font-semibold hover:bg-muted/50">
            <span>
              Removidos
              {totalRemovidos > 0 ? (
                <span className="ml-1 font-normal text-muted-foreground">
                  ({totalRemovidos.toLocaleString("pt-PT")})
                </span>
              ) : null}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                removidosOpen && "rotate-180"
              )}
              aria-hidden
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden">
            <div className="space-y-2 pt-3">
              {removidosBatches.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma remoção registada.</p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do arquivo</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead className="text-right">Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {removidosBatches.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.fileName}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {b.removedCount.toLocaleString("pt-PT")}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatDt(b.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
