import { useState } from "react";
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { StatusWithDot } from "@/components/ui/status-with-dot";
import { popoverFieldTriggerClassName } from "@/lib/ui-popover-field-trigger";
import { cn } from "@/lib/utils";
import { requiredLabel } from "@/validations";
import { Check, ChevronsUpDown } from "lucide-react";
import type { IntegrationRecord } from "@/types/core-integrations.types";
import type { CampaignStatus } from "@/types/core-campaigns.types";
import type { LeadImportBatchRecord } from "@/types/core-leads.types";
import { campaignStatusDotClass, labelCampaignStatus } from "./campaign-status";

export const CAMPAIGN_INTEGRATION_NONE = "__none__";

const FORM_SHELL =
  "flex min-h-0 flex-1 flex-col space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm";
const LABEL_GAP = "mb-0";

export interface CampaignFormUIProps {
  variant?: "create" | "edit";
  formId?: string;
  hideSubmitButton?: boolean;
  showTitleBlock?: boolean;
  title?: string;
  description?: string;
  name: string;
  onNameChange: (v: string) => void;
  integrationId: string;
  onIntegrationChange: (v: string) => void;
  queueId?: string;
  onQueueIdChange?: (v: string) => void;
  integrations: IntegrationRecord[];
  importBatches?: LeadImportBatchRecord[];
  selectedImportBatchIds?: string[];
  onSelectedImportBatchIdsChange?: (v: string[]) => void;
  /** Número de leads associados (só leitura, modo edição). */
  leadsCount?: number;
  /** Estado da campanha (API). Em edição, se `syncing` ou `completed`, o ativo/inativo fica bloqueado. */
  campaignStatus?: CampaignStatus;
  /** Modo edição: campanha “em operação” (status `active` na API). */
  operationalActive?: boolean;
  onOperationalActiveChange?: (active: boolean) => void;
  onSubmit: () => void;
  submitLabel?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function CampaignFormUI({
  variant = "create",
  formId,
  hideSubmitButton,
  showTitleBlock = false,
  title,
  description,
  name,
  onNameChange,
  integrationId,
  onIntegrationChange,
  queueId = CAMPAIGN_INTEGRATION_NONE,
  onQueueIdChange,
  integrations,
  importBatches = [],
  selectedImportBatchIds = [],
  onSelectedImportBatchIdsChange,
  leadsCount,
  campaignStatus,
  operationalActive = true,
  onOperationalActiveChange,
  onSubmit,
  submitLabel = "Criar campanha",
  disabled,
  loading,
}: CampaignFormUIProps) {
  const [batchesPopoverOpen, setBatchesPopoverOpen] = useState(false);
  const isEdit = variant === "edit";
  const defaultTitle = isEdit ? "Editar campanha" : "Nova campanha";
  const defaultDescription = isEdit
    ? "Altere nome, integração ou estado operacional. Leads associados são só informativos."
    : "Associe um discador configurado. Os leads são enviados na sincronização após criar a campanha.";

  const selectValue =
    integrationId === CAMPAIGN_INTEGRATION_NONE || !integrationId
      ? CAMPAIGN_INTEGRATION_NONE
      : integrationId;
  const selectedIntegration = integrations.find((i) => i.id === selectValue);
  const availableQueues = selectedIntegration?.queues ?? [];

  const statusLocked =
    isEdit && campaignStatus != null && (campaignStatus === "syncing" || campaignStatus === "completed");

  const leadsDisplay =
    isEdit && leadsCount !== undefined ? String(leadsCount) : "—";

  const row1Cols = isEdit ? "md:grid-cols-4" : "md:grid-cols-3";
  const row1CreateCols = isEdit ? row1Cols : "md:grid-cols-4";

  const selectedBatchesSummary =
    selectedImportBatchIds.length === 0
      ? "Selecione um ou mais lotes"
      : importBatches
          .filter((b) => selectedImportBatchIds.includes(b.id))
          .map((b) => `${b.fileName} (${b.importedCount - b.removedCount})`)
          .join(", ");

  const toggleBatch = (batchId: string) => {
    const set = new Set(selectedImportBatchIds);
    if (set.has(batchId)) {
      set.delete(batchId);
    } else {
      set.add(batchId);
    }
    onSelectedImportBatchIdsChange?.([...set]);
  };

  const formInner = (
    <>
      {showTitleBlock ? (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">{title ?? defaultTitle}</h2>
          <p className="text-sm text-muted-foreground">{description ?? defaultDescription}</p>
        </div>
      ) : null}

      <div className={cn("grid grid-cols-1 gap-4", row1CreateCols)}>
        <div className="min-w-0 space-y-1">
          <Label htmlFor="campaign-name" className={LABEL_GAP}>
            {requiredLabel("Nome da campanha")}
          </Label>
          <Input
            id="campaign-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ex.: Black Friday outbound"
            disabled={disabled}
          />
        </div>
        <div className="min-w-0 space-y-1">
          <Label className={LABEL_GAP}>{requiredLabel("Filas")}</Label>
          <Select
            value={queueId || CAMPAIGN_INTEGRATION_NONE}
            onValueChange={(v) => onQueueIdChange?.(v)}
            disabled={disabled || !selectedIntegration}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CAMPAIGN_INTEGRATION_NONE}>Sem fila</SelectItem>
              {availableQueues.map((q) => (
                <SelectItem key={q.id} value={q.id}>
                  {q.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-0 space-y-1">
          <Label className={LABEL_GAP}>{requiredLabel("Integração")}</Label>
          <Select value={selectValue} onValueChange={onIntegrationChange} disabled={disabled}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CAMPAIGN_INTEGRATION_NONE}>Sem integração</SelectItem>
              {integrations.map((i) => (
                <SelectItem
                  key={i.id}
                  value={i.id}
                  disabled={!i.isActive && i.id !== selectValue}
                >
                  {i.provider.toUpperCase()} — {i.name}
                  {!i.isActive ? " (inativa)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isEdit ? (
          <div className="min-w-0 space-y-1">
            <Label htmlFor="campaign-leads-display" className={LABEL_GAP}>
              Leads
            </Label>
            <Input
              id="campaign-leads-display"
              readOnly
              value={leadsDisplay}
              className="bg-muted/40 text-muted-foreground"
              tabIndex={-1}
              aria-readonly
            />
          </div>
        ) : null}
        {!isEdit ? (
          <div className="min-w-0 space-y-1">
            <Label className={LABEL_GAP}>Lote de leads (opcional)</Label>
            <Popover open={batchesPopoverOpen} onOpenChange={setBatchesPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={batchesPopoverOpen}
                  disabled={disabled}
                  className={cn(
                    popoverFieldTriggerClassName,
                    "h-auto min-h-10 w-full justify-between px-3 py-2 font-normal"
                  )}
                >
                  <span className="line-clamp-2 text-left text-sm">{selectedBatchesSummary}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar lote..." />
                  <CommandList>
                    <CommandEmpty>Nenhum lote disponível.</CommandEmpty>
                    <CommandGroup>
                      {importBatches.map((b) => {
                        const selected = selectedImportBatchIds.includes(b.id);
                        return (
                          <CommandItem
                            key={b.id}
                            value={`${b.fileName} ${b.importedCount - b.removedCount}`}
                            onSelect={() => toggleBatch(b.id)}
                            onPointerDown={(e) => e.preventDefault()}
                          >
                            <span
                              className={cn(
                                "mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                                selected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/50 bg-background"
                              )}
                              aria-hidden
                            >
                              {selected ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
                            </span>
                            {b.fileName} ({b.importedCount - b.removedCount})
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        ) : null}
        {isEdit ? (
          <div className="min-w-0 space-y-1">
            <Label className={LABEL_GAP}>Status</Label>
            {statusLocked && campaignStatus ? (
              <div className="flex h-10 items-center">
                <StatusWithDot
                  label={labelCampaignStatus(campaignStatus)}
                  dotClassName={campaignStatusDotClass(campaignStatus)}
                />
              </div>
            ) : onOperationalActiveChange ? (
              <Select
                value={operationalActive ? "active" : "inactive"}
                onValueChange={(v) => onOperationalActiveChange(v === "active")}
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
          </div>
        ) : null}
      </div>

      {!hideSubmitButton ? (
        <Button type="submit" disabled={disabled || loading || !name.trim()}>
          {loading ? "A guardar…" : submitLabel}
        </Button>
      ) : null}
    </>
  );

  return (
    <form
      id={formId}
      className={FORM_SHELL}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      {formInner}
    </form>
  );
}
