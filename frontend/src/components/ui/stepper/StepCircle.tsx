import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepCircleState = "completed" | "active" | "upcoming";

export interface StepCircleProps {
  /** 1-based step number (mostrado quando não está concluído). */
  stepNumber: number;
  state: StepCircleState;
  className?: string;
  "aria-current"?: "step" | boolean;
}

/**
 * Primitivo: círculo do passo (check, número ativo ou número inativo).
 */
export function StepCircle({
  stepNumber,
  state,
  className,
  "aria-current": ariaCurrent,
}: StepCircleProps) {
  const isCompleted = state === "completed";
  const isActive = state === "active";

  return (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
        isCompleted && "bg-primary text-primary-foreground",
        isActive && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 ring-offset-background",
        state === "upcoming" && "bg-muted text-muted-foreground",
        className
      )}
      aria-current={ariaCurrent}
    >
      {isCompleted ? (
        <Check className="h-3 w-3" strokeWidth={2} aria-hidden />
      ) : (
        <span aria-hidden>{stepNumber}</span>
      )}
    </span>
  );
}
