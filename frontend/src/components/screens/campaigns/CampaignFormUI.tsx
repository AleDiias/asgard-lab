import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { StatusWithDot } from "@/components/ui/status-with-dot";
import { cn } from "@/lib/utils";
import { requiredLabel } from "@/validations";
import type { IntegrationRecord } from "@/types/core-integrations.types";
import type { CampaignStatus } from "@/types/core-campaigns.types";
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
  integrations: IntegrationRecord[];
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
  integrations,
  leadsCount,
  campaignStatus,
  operationalActive = true,
  onOperationalActiveChange,
  onSubmit,
  submitLabel = "Criar campanha",
  disabled,
  loading,
}: CampaignFormUIProps) {
  const isEdit = variant === "edit";
  const defaultTitle = isEdit ? "Editar campanha" : "Nova campanha";
  const defaultDescription = isEdit
    ? "Altere nome, integração ou estado operacional. Leads associados são só informativos."
    : "Associe um discador configurado. Os leads são enviados na sincronização após criar a campanha.";

  const selectValue =
    integrationId === CAMPAIGN_INTEGRATION_NONE || !integrationId
      ? CAMPAIGN_INTEGRATION_NONE
      : integrationId;

  const statusLocked =
    isEdit && campaignStatus != null && (campaignStatus === "syncing" || campaignStatus === "completed");

  const leadsDisplay =
    isEdit && leadsCount !== undefined ? String(leadsCount) : "—";

  const row1Cols = isEdit ? "md:grid-cols-4" : "md:grid-cols-3";

  const formInner = (
    <>
      {showTitleBlock ? (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">{title ?? defaultTitle}</h2>
          <p className="text-sm text-muted-foreground">{description ?? defaultDescription}</p>
        </div>
      ) : null}

      <div className={cn("grid grid-cols-1 gap-4", row1Cols)}>
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
          <Label className={LABEL_GAP}>{requiredLabel("Integração")}</Label>
          <Select value={selectValue} onValueChange={onIntegrationChange} disabled={disabled}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CAMPAIGN_INTEGRATION_NONE}>Sem integração (rascunho)</SelectItem>
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
          {!isEdit ? (
            <p className="text-xs text-muted-foreground">
              Associe leads depois, com &quot;Sincronizar&quot; na lista de campanhas.
            </p>
          ) : null}
        </div>
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
