import { cn } from "@/lib/utils";

export interface StepConnectorProps {
  className?: string;
}

/** Primitivo: linha horizontal entre passos. */
export function StepConnector({ className }: StepConnectorProps) {
  return (
    <div
      className={cn("hidden h-px min-h-px min-w-[1rem] flex-1 bg-border sm:block", className)}
      aria-hidden
    />
  );
}
