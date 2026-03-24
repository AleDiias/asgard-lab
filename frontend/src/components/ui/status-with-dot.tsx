import { cn } from "@/lib/utils";

export interface StatusWithDotProps {
  /** Texto do status (ex.: Ativo) */
  label: string;
  /** Classes da bolinha (ex. `bg-emerald-500` de `@/lib/status`) */
  dotClassName: string;
  className?: string;
}

/**
 * Indicador de status: bolinha colorida + texto (presentacional).
 */
export function StatusWithDot({ label, dotClassName, className }: StatusWithDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-foreground", className)}>
      <span
        className={cn("h-3 w-3 shrink-0 rounded-full", dotClassName)}
        aria-hidden
      />
      <span>{label}</span>
    </span>
  );
}
