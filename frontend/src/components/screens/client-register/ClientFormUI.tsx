import { useCallback, useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { popoverFieldTriggerClassName } from "@/lib/ui-popover-field-trigger";
import { cn } from "@/lib/utils";
import { requiredLabel } from "@/validations";
import { formatCnpjInput, formatPhoneBrInput } from "./config/client-register.config";
import type { ClientFormFieldErrors, ClientFormValues, ClientModuleOption } from "./types";

/** Espaço mínimo entre rótulo e campo (o `space-y-*` do grupo faz o resto). */
const LABEL_GAP = "mb-0";

function parseBillingDate(value: string): Date | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  try {
    const d = parseISO(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  } catch {
    return undefined;
  }
}

export interface ClientFormUILabels {
  title?: string;
  companyName?: string;
  cnpj?: string;
  billingDate?: string;
  billingDatePlaceholder?: string;
  ownerEmail?: string;
  phone?: string;
  domain?: string;
  domainHint?: string;
  modulesSection?: string;
  modulesPlaceholder?: string;
  modulesSearchPlaceholder?: string;
  submit?: string;
  /** Modo edição — select de status da conta */
  accountStatus?: string;
  accountStatusActive?: string;
  accountStatusInactive?: string;
}

/** Rótulos padrão (ex.: texto do botão na ActionBar alinhado ao formulário). */
export const clientFormUiDefaultLabels: Required<ClientFormUILabels> = {
  title: "Cadastro de empresa",
  companyName: "Nome da empresa",
  cnpj: "CNPJ",
  billingDate: "Data de vencimento / faturamento",
  billingDatePlaceholder: "Selecione a data",
  ownerEmail: "E-mail",
  phone: "Telefone",
  domain: "Domínio (subdomínio)",
  domainHint: "Ex.: machado — será usado como identificador do cliente (subdomínio).",
  modulesSection: "Módulos contratados",
  modulesPlaceholder: "Selecione um ou mais módulos…",
  modulesSearchPlaceholder: "Buscar módulo…",
  submit: "Criar empresa",
  accountStatus: "Status da conta",
  accountStatusActive: "Ativa",
  accountStatusInactive: "Inativa",
};

function normalizeInitial(v?: Partial<ClientFormValues>): ClientFormValues {
  return {
    companyName: v?.companyName ?? "",
    cnpj: v?.cnpj ?? "",
    billingDate: typeof v?.billingDate === "string" ? v.billingDate : "",
    ownerEmail: v?.ownerEmail ?? "",
    phone: v?.phone ?? "",
    domain: v?.domain ?? "",
    moduleIds: v?.moduleIds?.length ? [...v.moduleIds] : [],
    accountStatus: v?.accountStatus === "inactive" ? "inactive" : "active",
  };
}

export interface ClientFormUIProps {
  moduleOptions: ClientModuleOption[];
  labels?: ClientFormUILabels;
  isLoading?: boolean;
  fieldErrors?: ClientFormFieldErrors;
  values?: Partial<ClientFormValues>;
  onValueChange?: (next: ClientFormValues) => void;
  onSubmit: (data: ClientFormValues) => void;
  hideTitle?: boolean;
  /** `id` no `<form>` para submissão via botão na ActionBar (`<Button type="submit" form={formId} />`). */
  formId: string;
  /** Quando `true`, o botão de envio fica apenas na ActionBar. */
  hideSubmitButton?: boolean;
  /** `edit`: mesmos campos + select Ativa/Inativa (persistência via API conforme a página). */
  variant?: "create" | "edit";
}

export function ClientFormUI({
  moduleOptions,
  labels: labelsProp,
  isLoading = false,
  fieldErrors,
  values: controlledValues,
  onValueChange,
  onSubmit,
  hideTitle = false,
  formId,
  hideSubmitButton = false,
  variant = "create",
}: ClientFormUIProps) {
  const labels = { ...clientFormUiDefaultLabels, ...labelsProp };
  const [internal, setInternal] = useState<ClientFormValues>(() =>
    normalizeInitial(controlledValues)
  );
  const [modulesPopoverOpen, setModulesPopoverOpen] = useState(false);

  useEffect(() => {
    if (controlledValues === undefined) {
      return;
    }
    setInternal(normalizeInitial(controlledValues));
  }, [controlledValues]);

  const emit = useCallback(
    (next: ClientFormValues) => {
      setInternal(next);
      onValueChange?.(next);
    },
    [onValueChange]
  );

  const billingDateObj = useMemo(
    () => parseBillingDate(internal.billingDate),
    [internal.billingDate]
  );

  const modulesSummary = useMemo(() => {
    if (internal.moduleIds.length === 0) {
      return labels.modulesPlaceholder;
    }
    const selected = internal.moduleIds
      .map((id) => moduleOptions.find((o) => o.id === id)?.label)
      .filter(Boolean) as string[];
    return selected.join(", ");
  }, [internal.moduleIds, moduleOptions, labels.modulesPlaceholder]);

  const toggleModule = (id: string) => {
    const set = new Set(internal.moduleIds);
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    emit({ ...internal, moduleIds: [...set] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(internal);
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm"
      noValidate
    >
      {!hideTitle ? (
        <h2 className="text-lg font-semibold text-foreground">{labels.title}</h2>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="min-w-0 space-y-1">
          <Label htmlFor="client-company-name" className={LABEL_GAP}>
            {requiredLabel(labels.companyName)}
          </Label>
          <Input
            id="client-company-name"
            name="companyName"
            autoComplete="organization"
            required
            value={internal.companyName}
            onChange={(e) => emit({ ...internal, companyName: e.target.value })}
            disabled={isLoading}
            className={cn(fieldErrors?.companyName && "border-destructive")}
            aria-invalid={Boolean(fieldErrors?.companyName)}
          />
          {fieldErrors?.companyName ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.companyName}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-1">
          <Label htmlFor="client-cnpj" className={LABEL_GAP}>
            {requiredLabel(labels.cnpj)}
          </Label>
          <Input
            id="client-cnpj"
            name="cnpj"
            inputMode="numeric"
            autoComplete="off"
            required
            value={internal.cnpj}
            onChange={(e) =>
              emit({ ...internal, cnpj: formatCnpjInput(e.target.value) })
            }
            disabled={isLoading}
            placeholder="00.000.000/0000-00"
            className={cn(fieldErrors?.cnpj && "border-destructive")}
            aria-invalid={Boolean(fieldErrors?.cnpj)}
          />
          {fieldErrors?.cnpj ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.cnpj}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-1">
          <Label className={LABEL_GAP} id="client-billing-date-label">
            {requiredLabel(labels.billingDate)}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className={cn(
                  popoverFieldTriggerClassName,
                  "h-10 w-full justify-start px-3 text-left font-normal",
                  !billingDateObj && "text-muted-foreground",
                  fieldErrors?.billingDate &&
                  "border-destructive text-foreground data-[state=open]:border-destructive"
                )}
                aria-invalid={Boolean(fieldErrors?.billingDate)}
                aria-labelledby="client-billing-date-label"
                id="client-billing-date"
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">
                  {billingDateObj
                    ? format(billingDateObj, "dd/MM/yyyy")
                    : labels.billingDatePlaceholder}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={billingDateObj}
                onSelect={(d) =>
                  emit({
                    ...internal,
                    billingDate: d ? format(d, "yyyy-MM-dd") : "",
                  })
                }
                initialFocus
                disabled={isLoading}
              />
            </PopoverContent>
          </Popover>
          {fieldErrors?.billingDate ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.billingDate}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="min-w-0 space-y-1">
          <Label htmlFor="client-owner-email" className={LABEL_GAP}>
            {requiredLabel(labels.ownerEmail)}
          </Label>
          <Input
            id="client-owner-email"
            name="ownerEmail"
            type="email"
            autoComplete="email"
            required
            value={internal.ownerEmail}
            onChange={(e) => emit({ ...internal, ownerEmail: e.target.value })}
            disabled={isLoading}
            className={cn(fieldErrors?.ownerEmail && "border-destructive")}
            aria-invalid={Boolean(fieldErrors?.ownerEmail)}
          />
          {fieldErrors?.ownerEmail ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.ownerEmail}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-1">
          <Label htmlFor="client-phone" className={LABEL_GAP}>
            {requiredLabel(labels.phone)}
          </Label>
          <Input
            id="client-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={internal.phone}
            onChange={(e) =>
              emit({ ...internal, phone: formatPhoneBrInput(e.target.value) })
            }
            disabled={isLoading}
            placeholder="(00) 00000-0000"
            className={cn(fieldErrors?.phone && "border-destructive")}
            aria-invalid={Boolean(fieldErrors?.phone)}
          />
          {fieldErrors?.phone ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-1">
          <Label htmlFor="client-domain" className={LABEL_GAP}>
            {requiredLabel(labels.domain)}
          </Label>
          <Input
            id="client-domain"
            name="domain"
            autoComplete="off"
            required
            value={internal.domain}
            onChange={(e) =>
              emit({
                ...internal,
                domain: e.target.value.trim().toLowerCase().replace(/\s+/g, ""),
              })
            }
            disabled={isLoading}
            placeholder="machado"
            className={cn(fieldErrors?.domain && "border-destructive")}
            aria-invalid={Boolean(fieldErrors?.domain)}
            aria-describedby="client-domain-hint"
          />
          <p id="client-domain-hint" className="text-xs text-muted-foreground">
            {labels.domainHint}
          </p>
          {fieldErrors?.domain ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.domain}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "min-w-0",
          variant === "edit" && "grid gap-4 sm:grid-cols-2 sm:items-start"
        )}
      >
        <div className="min-w-0 space-y-1">
          <Label className={LABEL_GAP} id="client-modules-label">
            {requiredLabel(labels.modulesSection)}
          </Label>
          <Popover open={modulesPopoverOpen} onOpenChange={setModulesPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={modulesPopoverOpen}
                aria-labelledby="client-modules-label"
                disabled={isLoading}
                className={cn(
                  popoverFieldTriggerClassName,
                  "h-auto min-h-10 w-full justify-between px-3 py-2 font-normal",
                  fieldErrors?.modules &&
                    "border-destructive text-foreground data-[state=open]:border-destructive"
                )}
                aria-invalid={Boolean(fieldErrors?.modules)}
              >
                <span className="line-clamp-2 text-left text-sm">{modulesSummary}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder={labels.modulesSearchPlaceholder} />
                <CommandList>
                  <CommandEmpty>Nenhum módulo encontrado.</CommandEmpty>
                  <CommandGroup>
                    {moduleOptions.map((opt) => {
                      const selected = internal.moduleIds.includes(opt.id);
                      return (
                        <CommandItem
                          key={opt.id}
                          value={opt.label}
                          onSelect={() => toggleModule(opt.id)}
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
                            {selected ? (
                              <Check className="h-3 w-3" strokeWidth={2.5} />
                            ) : null}
                          </span>
                          {opt.label}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {fieldErrors?.modules ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.modules}
            </p>
          ) : null}
        </div>

        {variant === "edit" ? (
          <div className="min-w-0 space-y-1">
            <Label htmlFor="client-account-status" className={LABEL_GAP}>
              {labels.accountStatus}
            </Label>
            <Select
              value={internal.accountStatus}
              onValueChange={(value) =>
                emit({
                  ...internal,
                  accountStatus: value as "active" | "inactive",
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger
                id="client-account-status"
                className={cn(
                  fieldErrors?.accountStatus &&
                    "border-destructive data-[state=open]:border-destructive"
                )}
                aria-invalid={Boolean(fieldErrors?.accountStatus)}
              >
                <SelectValue placeholder={labels.accountStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{labels.accountStatusActive}</SelectItem>
                <SelectItem value="inactive">{labels.accountStatusInactive}</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors?.accountStatus ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.accountStatus}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {hideSubmitButton ? null : (
        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              {labels.submit}
            </>
          ) : (
            labels.submit
          )}
        </Button>
      )}
    </form>
  );
}
