import { cn } from "@/lib/utils";

/**
 * Invólucro comum das tabelas nas telas de Configuração (empresas, utilizadores, equipe Asgard).
 * O componente {@link Table} já inclui scroll interno (`overflow-auto`); evita duplicar `overflow-x-auto` no exterior.
 */
export function configTableShellClassName(className?: string): string {
  return cn("w-full overflow-hidden border border-border", className);
}
