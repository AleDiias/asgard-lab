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
import { cn } from "@/lib/utils";
import { requiredLabel } from "@/validations";
import type { DialerProvider } from "@/types/core-integrations.types";

const FORM_SHELL =
  "flex min-h-0 flex-1 flex-col space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm";
const LABEL_GAP = "mb-0";

const PROVIDERS: { id: DialerProvider; label: string }[] = [
  { id: "vonix", label: "Vonix" },
  { id: "3c", label: "3C Plus" },
  { id: "aspect", label: "Aspect" },
  { id: "custom", label: "Personalizado" },
];

export interface IntegrationFormUIProps {
  variant?: "create" | "edit";
  formId?: string;
  hideSubmitButton?: boolean;
  /** Título opcional dentro do cartão (as páginas costumam usar só a ActionBar). */
  showTitleBlock?: boolean;
  title?: string;
  description?: string;
  provider: DialerProvider;
  onProviderChange: (v: DialerProvider) => void;
  /** Em edição o discador não deve ser alterado. */
  providerDisabled?: boolean;
  name: string;
  onNameChange: (v: string) => void;
  apiKey: string;
  onApiKeyChange: (v: string) => void;
  baseUrl: string;
  onBaseUrlChange: (v: string) => void;
  /** Modo edição: integração ativa no tenant. */
  isActive?: boolean;
  onIsActiveChange?: (v: boolean) => void;
  onSubmit: () => void;
  submitLabel?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function IntegrationFormUI({
  variant = "create",
  formId,
  hideSubmitButton,
  showTitleBlock = false,
  title,
  description,
  provider,
  onProviderChange,
  providerDisabled = false,
  name,
  onNameChange,
  apiKey,
  onApiKeyChange,
  baseUrl,
  onBaseUrlChange,
  isActive = true,
  onIsActiveChange,
  onSubmit,
  submitLabel = "Guardar integração",
  disabled,
  loading,
}: IntegrationFormUIProps) {
  const isEdit = variant === "edit";
  const defaultTitle = isEdit ? "Editar integração" : "Nova integração";
  const defaultDescription = isEdit
    ? "Atualize o nome, o estado ou as credenciais. Deixe API Key e URL em branco para manter os valores atuais."
    : "Indique o nome interno, a API Key e a URL base do discador.";

  const statusLabels = { active: "Ativa", inactive: "Inativa" };

  const formInner = (
    <>
      {showTitleBlock ? (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">{title ?? defaultTitle}</h2>
          <p className="text-sm text-muted-foreground">{description ?? defaultDescription}</p>
        </div>
      ) : null}

      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          isEdit ? "md:grid-cols-3" : "md:grid-cols-2"
        )}
      >
        <div className="min-w-0 space-y-1">
          <Label htmlFor="integration-name" className={LABEL_GAP}>
            {requiredLabel("Nome")}
          </Label>
          <Input
            id="integration-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ex.: Vonix"
            disabled={disabled}
          />
        </div>
        <div className="min-w-0 space-y-1">
          <Label htmlFor="integration-provider" className={LABEL_GAP}>
            {requiredLabel("Discador")}
          </Label>
          <Select
            value={provider}
            onValueChange={(v) => onProviderChange(v as DialerProvider)}
            disabled={disabled || providerDisabled}
          >
            <SelectTrigger id="integration-provider">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isEdit && onIsActiveChange ? (
          <div className="min-w-0 space-y-1">
            <Label htmlFor="integration-active" className={LABEL_GAP}>
              Status
            </Label>
            <Select
              value={isActive ? "active" : "inactive"}
              onValueChange={(v) => onIsActiveChange(v === "active")}
              disabled={disabled}
            >
              <SelectTrigger id="integration-active">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{statusLabels.active}</SelectItem>
                <SelectItem value="inactive">{statusLabels.inactive}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-w-0 space-y-1">
          <Label htmlFor="integration-key" className={LABEL_GAP}>
            {isEdit ? "API Key / token" : requiredLabel("API Key / token")}
          </Label>
          <Input
            id="integration-key"
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={isEdit ? "Deixe vazio para manter" : "Cole a chave"}
            disabled={disabled}
          />
        </div>
        <div className="min-w-0 space-y-1">
          <Label htmlFor="integration-url" className={LABEL_GAP}>
            {isEdit ? "URL base da API" : requiredLabel("URL base da API")}
          </Label>
          <Input
            id="integration-url"
            value={baseUrl}
            onChange={(e) => onBaseUrlChange(e.target.value)}
            placeholder={isEdit ? "Deixe vazio para manter" : "https://api.seudiscador.com"}
            disabled={disabled}
          />
        </div>
      </div>

      {!hideSubmitButton ? (
        <Button type="submit" disabled={disabled || loading}>
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
