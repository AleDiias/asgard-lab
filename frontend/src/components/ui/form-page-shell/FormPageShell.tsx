import * as React from "react";

import { cn } from "@/lib/utils";

const maxWidthVariants = {
  /** ~64rem — várias colunas na mesma linha (usuários, cadastro empresa) */
  wide: "max-w-5xl",
  /** ~36rem — formulários largos */
  xl: "max-w-xl",
  /** ~32rem */
  lg: "max-w-lg",
  /** ~28rem — formulários compactos */
  md: "max-w-md",
} as const;

export interface FormPageShellProps {
  children: React.ReactNode;
  /** Largura máxima do conteúdo em ecrãs largos (centrado); o fundo ocupa toda a área útil. */
  maxWidth?: keyof typeof maxWidthVariants;
  className?: string;
  /**
   * Quando `true`, o contentor interno usa `w-full` até ao máximo (`maxWidth`) — útil para
   * formulários que devem preencher a linha (ex.: equipe Asgard em duas colunas).
   * Quando `false` (default), usa `w-max` para a largura acompanhar o conteúdo.
   */
  fullWidth?: boolean;
}

/**
 * Área do formulário: ocupa toda a altura útil (`w-full` + `flex-1`) e, por default,
 * a largura do bloco ajusta-se ao conteúdo (`w-max`) até ao teto definido por `maxWidth`.
 */
export function FormPageShell({
  children,
  maxWidth = "xl",
  className,
  fullWidth = false,
}: FormPageShellProps) {
  return (
    <div className={cn("flex min-h-0 w-full flex-1 flex-col", className)}>
      <div
        className={cn(
          "mx-auto flex min-h-0 flex-1 flex-col",
          fullWidth ? "w-full min-w-0" : "w-max max-w-full",
          maxWidthVariants[maxWidth]
        )}
      >
        {children}
      </div>
    </div>
  );
}

FormPageShell.displayName = "FormPageShell";
