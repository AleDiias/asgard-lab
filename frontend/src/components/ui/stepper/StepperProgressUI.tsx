import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { StepCircle, type StepCircleState } from "./StepCircle";
import { StepConnector } from "./StepConnector";

export interface StepperStepDefinition {
  /** Identificador estável (ex.: para erros Zod). */
  id: string;
  title: string;
  description?: string;
}

export interface StepperProgressUIProps {
  steps: StepperStepDefinition[];
  /** Índice do passo ativo (0-based). Controlado pelo container. */
  value: number;
  /** Navegação opcional (ex.: voltar a um passo já concluído). */
  onValueChange?: (index: number) => void;
  /** Erros de validação por `id` do passo — exibidos abaixo do subtítulo. */
  stepErrors?: Partial<Record<string, string>>;
  className?: string;
}

function stateForIndex(activeIndex: number, i: number): StepCircleState {
  if (i < activeIndex) return "completed";
  if (i === activeIndex) return "active";
  return "upcoming";
}

/**
 * Presentacional: stepper horizontal (referência de progresso).
 * Sem estado interno de passo — apenas emite `onValueChange` quando aplicável.
 */
export function StepperProgressUI({
  steps,
  value,
  onValueChange,
  stepErrors,
  className,
}: StepperProgressUIProps) {
  return (
    <nav
      className={cn("w-full overflow-x-auto pb-1 pl-1 pt-1", className)}
      aria-label="Progresso do assistente"
    >
      <div role="list" className="flex min-w-[min(100%,560px)] items-center gap-0.5 sm:gap-1.5">
        {steps.map((step, index) => {
          const state = stateForIndex(value, index);
          const err = stepErrors?.[step.id];
          const canClickBack = Boolean(onValueChange) && index < value;

          return (
            <Fragment key={step.id}>
              {index > 0 ? <StepConnector /> : null}
              <div role="listitem" className="flex min-w-0 shrink-0 items-center gap-2">
                {canClickBack ? (
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => onValueChange?.(index)}
                    aria-label={`Voltar ao passo ${index + 1}: ${step.title}`}
                  >
                    <StepCircle
                      stepNumber={index + 1}
                      state={state}
                      aria-current={index === value ? "step" : undefined}
                    />
                    <StepLabels
                      title={step.title}
                      description={step.description}
                      error={err}
                      muted={state === "upcoming"}
                      active={state === "active" || state === "completed"}
                    />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <StepCircle
                      stepNumber={index + 1}
                      state={state}
                      aria-current={index === value ? "step" : undefined}
                    />
                    <StepLabels
                      title={step.title}
                      description={step.description}
                      error={err}
                      muted={state === "upcoming"}
                      active={state === "active" || state === "completed"}
                    />
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}

function StepLabels({
  title,
  description,
  error,
  muted,
  active,
}: {
  title: string;
  description?: string;
  error?: string;
  muted: boolean;
  active: boolean;
}) {
  return (
    <div className="min-w-0">
      <p
        className={cn(
          "text-xs font-semibold leading-tight",
          muted && "font-normal text-muted-foreground",
          active && !muted && "text-foreground"
        )}
      >
        {title}
      </p>
      {description ? (
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{description}</p>
      ) : null}
      {error ? <p className="mt-0.5 text-[11px] text-destructive">{error}</p> : null}
    </div>
  );
}
