import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import type { LeadImportBatchRecord } from "@/types/core-leads.types";
import { cn } from "@/lib/utils";

export interface LeadTrackingFiltersFieldErrors {
  importBatchId?: string;
}

export interface LeadTrackingFiltersCardUIProps {
  /** Valor do select (unidirecional: controlado pelo container). */
  importBatchId: string | "all";
  /** Alteração de valor emitida pelo select (sem validação aqui). */
  onImportBatchIdChange: (value: string | "all") => void;
  batches: LeadImportBatchRecord[];
  onApply: () => void;
  disabled?: boolean;
  /** Erros vindos do Zod na página, por campo. */
  fieldErrors?: LeadTrackingFiltersFieldErrors;
  className?: string;
  selectLabel?: string;
  /** Mensagem quando não há importações (sem opções além de “todos”). */
  emptyBatchesMessage?: string;
}

/**
 * Presentacional: select de arquivo + Aplicar. Sem fetch nem Zod.
 */
export function LeadTrackingFiltersCardUI({
  importBatchId,
  onImportBatchIdChange,
  batches,
  onApply,
  disabled,
  fieldErrors,
  className,
  selectLabel = "Arquivo de importação",
  emptyBatchesMessage = "Sem leads importados. Importe um ficheiro na área de importação.",
}: LeadTrackingFiltersCardUIProps) {
  const hasBatches = batches.length > 0;
  const selectDisabled = disabled || !hasBatches;

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lead-tracking-import-batch">{selectLabel}</Label>
          <Select
            value={importBatchId}
            onValueChange={(v) => onImportBatchIdChange(v as string | "all")}
            disabled={selectDisabled}
          >
            <SelectTrigger
              id="lead-tracking-import-batch"
              className={cn(fieldErrors?.importBatchId && "border-destructive")}
              aria-invalid={Boolean(fieldErrors?.importBatchId)}
              aria-describedby={
                fieldErrors?.importBatchId ? "lead-tracking-import-batch-error" : undefined
              }
            >
              <SelectValue
                placeholder={hasBatches ? "Selecione" : emptyBatchesMessage}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {hasBatches ? "Todos os arquivos" : emptyBatchesMessage}
              </SelectItem>
              {hasBatches
                ? batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.fileName}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
          {!hasBatches ? (
            <p className="text-sm text-muted-foreground">{emptyBatchesMessage}</p>
          ) : null}
          {fieldErrors?.importBatchId ? (
            <p
              id="lead-tracking-import-batch-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {fieldErrors.importBatchId}
            </p>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button type="button" className="w-full" onClick={onApply} disabled={disabled}>
          Aplicar
        </Button>
      </CardFooter>
    </Card>
  );
}
