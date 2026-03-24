import type { ReactNode } from "react";

/**
 * Marca o rótulo de um campo obrigatório com asterisco visível (vermelho).
 * Use em conjunto com validação (ex.: Zod + `isRequired` em valores).
 */
export function requiredLabel(label: string): ReactNode {
  const t = label.trim();
  const base = t.endsWith("*") ? t.slice(0, -1).trimEnd() : t;
  return (
    <>
      {base}
      <span className="text-destructive" aria-hidden>
        {" *"}
      </span>
    </>
  );
}
