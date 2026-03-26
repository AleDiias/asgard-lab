import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { popoverFieldTriggerClassName } from "@/lib/ui-popover-field-trigger";
import { cn } from "@/lib/utils";
import { requiredLabel } from "@/validations";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import type { ActiveInactiveStatus } from "@/lib/status";
import type {
  ClientUserFormFieldErrors,
  ClientUserFormValues,
  ClientUserPermissionOption,
} from "./types";

const LABEL_GAP = "mb-0";

export interface ClientUserFormUILabels {
  title?: string;
  name?: string;
  email?: string;
  status?: string;
  role?: string;
  roleAdmin?: string;
  roleUser?: string;
  statusActive?: string;
  statusInactive?: string;
  permissionsSection?: string;
  permissionsPlaceholder?: string;
  permissionsSearchPlaceholder?: string;
  permissionsEmpty?: string;
  submit?: string;
}

export const clientUserFormUiDefaultLabels: Required<ClientUserFormUILabels> = {
  title: "Novo usuário do cliente",
  name: "Nome",
  email: "E-mail",
  status: "Status",
  role: "Função",
  roleAdmin: "Administrador",
  roleUser: "Usuário",
  statusActive: "Ativo",
  statusInactive: "Inativo",
  permissionsSection: "Permissões de acesso",
  permissionsPlaceholder: "Selecione uma ou mais permissões…",
  permissionsSearchPlaceholder: "Buscar permissão…",
  permissionsEmpty: "Nenhuma permissão encontrada.",
  submit: "Salvar",
};

export interface ClientUserFormUIProps {
  /** `new`: nome, e-mail e permissões na mesma linha. `edit`: inclui status na mesma linha. */
  mode?: "new" | "edit";
  /** Opções de permissão (rótulos vêm do container / i18n) */
  permissionOptions: ClientUserPermissionOption[];
  labels?: ClientUserFormUILabels;
  /** Estado de envio: desabilita submit e mostra spinner */
  isLoading?: boolean;
  /** Erros de validação vindos do container (ex.: Zod) */
  fieldErrors?: ClientUserFormFieldErrors;
  /** Valores controlados opcionais (modo controlado) */
  values?: Partial<ClientUserFormValues>;
  /** Emissão unidirecional a cada alteração */
  onValueChange?: (next: ClientUserFormValues) => void;
  onSubmit: (data: ClientUserFormValues) => void;
  showRoleField?: boolean;
  /** Quando `true`, não renderiza o título (ex.: ActionBar na página). */
  hideTitle?: boolean;
  /** `id` no `<form>` para submissão via botão na ActionBar (`<Button type="submit" form={formId} />`). */
  formId: string;
  /** Quando `true`, o botão de envio fica apenas na ActionBar. */
  hideSubmitButton?: boolean;
}

function buildInitialState(
  permissionOptions: ClientUserPermissionOption[],
  seed?: Partial<ClientUserFormValues>
): ClientUserFormValues {
  const baseIds = permissionOptions.map((o) => o.id);
  const permissionIds =
    seed?.permissionIds?.filter((id) => baseIds.includes(id)) ?? [];
  return {
    name: seed?.name ?? "",
    email: seed?.email ?? "",
    role: seed?.role ?? "user",
    status: seed?.status ?? "active",
    permissionIds,
  };
}

export function ClientUserFormUI({
  mode = "new",
  permissionOptions,
  labels: labelsProp,
  isLoading = false,
  fieldErrors,
  values: controlledValues,
  onValueChange,
  onSubmit,
  showRoleField = false,
  hideTitle = false,
  formId,
  hideSubmitButton = false,
}: ClientUserFormUIProps) {
  const labels = { ...clientUserFormUiDefaultLabels, ...labelsProp };
  const [internal, setInternal] = useState<ClientUserFormValues>(() =>
    buildInitialState(permissionOptions, controlledValues)
  );
  const [permissionsPopoverOpen, setPermissionsPopoverOpen] = useState(false);

  useEffect(() => {
    if (controlledValues === undefined) {
      return;
    }
    setInternal(buildInitialState(permissionOptions, controlledValues));
  }, [controlledValues, permissionOptions]);

  const emit = useCallback(
    (next: ClientUserFormValues) => {
      setInternal(next);
      onValueChange?.(next);
    },
    [onValueChange]
  );

  const permissionsSummary = useMemo(() => {
    if (internal.permissionIds.length === 0) {
      return labels.permissionsPlaceholder;
    }
    const selected = internal.permissionIds
      .map((id) => permissionOptions.find((o) => o.id === id)?.label)
      .filter(Boolean) as string[];
    return selected.join(", ");
  }, [internal.permissionIds, permissionOptions, labels.permissionsPlaceholder]);

  const togglePermission = (id: string) => {
    const set = new Set(internal.permissionIds);
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    emit({ ...internal, permissionIds: [...set] });
  };

  const setStatus = (status: ActiveInactiveStatus) => {
    emit({ ...internal, status });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(internal);
  };

  const gridCols = (() => {
    if (mode === "edit") return showRoleField ? "grid-cols-1 gap-4 lg:grid-cols-5" : "grid-cols-1 gap-4 lg:grid-cols-4";
    return showRoleField ? "grid-cols-1 gap-4 lg:grid-cols-4" : "grid-cols-1 gap-4 lg:grid-cols-3";
  })();

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

      <div className={cn("grid items-start", gridCols)}>
        <div className="min-w-0 space-y-1">
          <Label htmlFor="client-user-name" className={LABEL_GAP}>
            {requiredLabel(labels.name)}
          </Label>
          <Input
            id="client-user-name"
            name="name"
            autoComplete="name"
            required
            value={internal.name}
            onChange={(e) => emit({ ...internal, name: e.target.value })}
            disabled={isLoading}
            className={cn(fieldErrors?.name && "border-destructive")}
            aria-invalid={Boolean(fieldErrors?.name)}
            aria-describedby={fieldErrors?.name ? "client-user-name-error" : undefined}
          />
          {fieldErrors?.name ? (
            <p id="client-user-name-error" className="text-sm text-destructive" role="alert">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        {showRoleField ? (
          <div className="min-w-0 space-y-1">
            <Label htmlFor="client-user-role" className={LABEL_GAP}>
              {requiredLabel(labels.role)}
            </Label>
            <Select
              value={internal.role}
              onValueChange={(v) => emit({ ...internal, role: v as "admin" | "user" })}
              disabled={isLoading}
              required
            >
              <SelectTrigger
                id="client-user-role"
                className={cn(fieldErrors?.role && "border-destructive")}
                aria-invalid={Boolean(fieldErrors?.role)}
                aria-describedby={fieldErrors?.role ? "client-user-role-error" : undefined}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{labels.roleAdmin}</SelectItem>
                <SelectItem value="user">{labels.roleUser}</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors?.role ? (
              <p id="client-user-role-error" className="text-sm text-destructive" role="alert">
                {fieldErrors.role}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="min-w-0 space-y-1">
          <Label htmlFor="client-user-email" className={LABEL_GAP}>
            {requiredLabel(labels.email)}
          </Label>
          <Input
            id="client-user-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={internal.email}
            onChange={(e) => emit({ ...internal, email: e.target.value })}
            disabled={isLoading}
            className={cn(fieldErrors?.email && "border-destructive")}
            aria-invalid={Boolean(fieldErrors?.email)}
            aria-describedby={fieldErrors?.email ? "client-user-email-error" : undefined}
          />
          {fieldErrors?.email ? (
            <p id="client-user-email-error" className="text-sm text-destructive" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-1">
          <Label className={LABEL_GAP} id="client-user-permissions-label">
            {requiredLabel(labels.permissionsSection)}
          </Label>
          <Popover open={permissionsPopoverOpen} onOpenChange={setPermissionsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={permissionsPopoverOpen}
                aria-labelledby="client-user-permissions-label"
                disabled={isLoading}
                className={cn(
                  popoverFieldTriggerClassName,
                  "h-auto min-h-10 w-full justify-between px-3 py-2 font-normal",
                  fieldErrors?.permissions &&
                    "border-destructive text-foreground data-[state=open]:border-destructive"
                )}
                aria-invalid={Boolean(fieldErrors?.permissions)}
              >
                <span className="line-clamp-2 text-left text-sm">{permissionsSummary}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder={labels.permissionsSearchPlaceholder} />
                <CommandList>
                  <CommandEmpty>{labels.permissionsEmpty}</CommandEmpty>
                  <CommandGroup>
                    {permissionOptions.map((opt) => {
                      const selected = internal.permissionIds.includes(opt.id);
                      return (
                        <CommandItem
                          key={opt.id}
                          value={opt.label}
                          onSelect={() => togglePermission(opt.id)}
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
          {fieldErrors?.permissions ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.permissions}
            </p>
          ) : null}
        </div>

        {mode === "edit" ? (
          <div className="min-w-0 space-y-1">
            <Label htmlFor="client-user-status" className={LABEL_GAP}>
              {requiredLabel(labels.status)}
            </Label>
            <Select
              value={internal.status}
              onValueChange={(v) => setStatus(v as ActiveInactiveStatus)}
              disabled={isLoading}
              required
            >
              <SelectTrigger
                id="client-user-status"
                className={cn(fieldErrors?.status && "border-destructive")}
                aria-invalid={Boolean(fieldErrors?.status)}
                aria-describedby={fieldErrors?.status ? "client-user-status-error" : undefined}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{labels.statusActive}</SelectItem>
                <SelectItem value="inactive">{labels.statusInactive}</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors?.status ? (
              <p id="client-user-status-error" className="text-sm text-destructive" role="alert">
                {fieldErrors.status}
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
