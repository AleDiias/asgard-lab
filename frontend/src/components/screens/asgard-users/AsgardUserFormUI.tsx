import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { requiredLabel } from "@/validations";
import { Loader2 } from "lucide-react";
import type { AsgardUserFormFieldErrors, AsgardUserFormValues } from "./types";

const LABEL_GAP = "mb-0";

export interface AsgardUserFormUILabels {
  title?: string;
  name?: string;
  email?: string;
  emailHint?: string;
  submit?: string;
}

export const asgardUserFormUiDefaultLabels: Required<AsgardUserFormUILabels> = {
  title: "Novo membro da equipe Asgard",
  name: "Nome",
  email: "E-mail",
  emailHint: "Utilize um endereço @asgardai.com.br",
  submit: "Salvar",
};

export interface AsgardUserFormUIProps {
  labels?: AsgardUserFormUILabels;
  isLoading?: boolean;
  fieldErrors?: AsgardUserFormFieldErrors;
  values?: Partial<AsgardUserFormValues>;
  onValueChange?: (next: AsgardUserFormValues) => void;
  onSubmit: (data: AsgardUserFormValues) => void;
  /** Quando `true`, não renderiza o título (ex.: ActionBar na página). */
  hideTitle?: boolean;
  /** `id` no `<form>` para submissão via botão na ActionBar (`<Button type="submit" form={formId} />`). */
  formId: string;
  /** Quando `true`, o botão de envio fica apenas na ActionBar. */
  hideSubmitButton?: boolean;
}

function normalizeInitial(v?: Partial<AsgardUserFormValues>): AsgardUserFormValues {
  return {
    name: v?.name ?? "",
    email: v?.email ?? "",
  };
}

export function AsgardUserFormUI({
  labels: labelsProp,
  isLoading = false,
  fieldErrors,
  values: controlledValues,
  onValueChange,
  onSubmit,
  hideTitle = false,
  formId,
  hideSubmitButton = false,
}: AsgardUserFormUIProps) {
  const labels = { ...asgardUserFormUiDefaultLabels, ...labelsProp };
  const [internal, setInternal] = useState<AsgardUserFormValues>(() =>
    normalizeInitial(controlledValues)
  );

  useEffect(() => {
    if (controlledValues === undefined) {
      return;
    }
    setInternal(normalizeInitial(controlledValues));
  }, [controlledValues]);

  const emit = useCallback(
    (next: AsgardUserFormValues) => {
      setInternal(next);
      onValueChange?.(next);
    },
    [onValueChange]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(internal);
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="flex min-h-0 w-full min-w-0 flex-1 flex-col space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm"
      noValidate
    >
      {!hideTitle ? (
        <h2 className="text-lg font-semibold text-foreground">{labels.title}</h2>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-nowrap sm:items-start">
        <div className="min-w-0 flex-1 space-y-1">
          <Label htmlFor="asgard-user-name" className={LABEL_GAP}>
            {requiredLabel(labels.name)}
          </Label>
          <Input
            id="asgard-user-name"
            name="name"
            autoComplete="name"
            required
            value={internal.name}
            onChange={(e) => emit({ ...internal, name: e.target.value })}
            disabled={isLoading}
            className={cn(fieldErrors?.name && "border-destructive")}
            aria-invalid={Boolean(fieldErrors?.name)}
            aria-describedby={fieldErrors?.name ? "asgard-user-name-error" : undefined}
          />
          {fieldErrors?.name ? (
            <p id="asgard-user-name-error" className="text-sm text-destructive" role="alert">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <Label htmlFor="asgard-user-email" className={LABEL_GAP}>
            {requiredLabel(labels.email)}
          </Label>
          <Input
            id="asgard-user-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="nome@asgardai.com.br"
            value={internal.email}
            onChange={(e) => emit({ ...internal, email: e.target.value })}
            disabled={isLoading}
            className={cn(fieldErrors?.email && "border-destructive")}
            aria-invalid={Boolean(fieldErrors?.email)}
            aria-describedby="asgard-email-hint asgard-user-email-error"
          />
          <p id="asgard-email-hint" className="text-xs text-muted-foreground">
            {labels.emailHint}
          </p>
          {fieldErrors?.email ? (
            <p id="asgard-user-email-error" className="text-sm text-destructive" role="alert">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
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
