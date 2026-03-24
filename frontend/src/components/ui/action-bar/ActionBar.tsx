import * as React from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export interface ActionBarBreadcrumbItem {
  label: string;
  /** Ausente no segmento atual (página ativa) */
  to?: string;
}

export interface ActionBarProps {
  /** Título da tela (nome principal) */
  title: string;
  breadcrumb?: ActionBarBreadcrumbItem[];
  /**
   * Slot de ações à direita (ícones, links, `Button` com `type="submit"` + `form="..."`, etc.).
   * **Orquestração:** compor na página/container; não colocar fetch, Zustand ou validação aqui.
   */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Barra de ação: título, breadcrumb e slot de ações.
 *
 * **Camada:** primitivo de composição (UI) — só recebe `title`, `breadcrumb` e `actions` como dados/árvore React.
 * Validação (Zod), estado de loading e chamadas HTTP ficam na **página/container**, que passa `actions` já montados.
 */
export function ActionBar({ title, breadcrumb, actions, className }: ActionBarProps) {
  const hasBreadcrumb = Boolean(breadcrumb?.length);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border pb-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className
      )}
    >
      <div className="min-w-0 w-full flex-1 space-y-1 text-left sm:py-0.5">
        <h1 className="text-base font-semibold tracking-tight text-foreground">{title}</h1>
        {hasBreadcrumb ? (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumb!.map((item, index) => {
                const isLast = index === breadcrumb!.length - 1;
                return (
                  <React.Fragment key={`${item.label}-${index}`}>
                    {index > 0 ? <BreadcrumbSeparator /> : null}
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : item.to ? (
                        <BreadcrumbLink asChild>
                          <Link to={item.to}>{item.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <span className="text-muted-foreground">{item.label}</span>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-end sm:pt-0.5">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
