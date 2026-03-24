import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CONFIG_PAGE_SIZE_OPTIONS } from "@/hooks/use-pagination-slice";

export interface TablePaginationBarLabels {
  showingRange?: (from: number, to: number, total: number) => string;
  rowsPerPage?: string;
  firstPage?: string;
  previousPage?: string;
  nextPage?: string;
  lastPage?: string;
}

const defaultLabels: Required<TablePaginationBarLabels> = {
  showingRange: (from, to, total) => `Mostrando ${from}–${to} de ${total}`,
  rowsPerPage: "Linhas por página",
  firstPage: "Primeira página",
  previousPage: "Página anterior",
  nextPage: "Página seguinte",
  lastPage: "Última página",
};

/** Janela de números de página visíveis (centra na página atual). */
function getVisiblePageNumbers(
  current: number,
  total: number,
  windowSize = 5
): number[] {
  if (total <= 0) return [];
  if (total <= windowSize) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize - 1);
  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export interface TablePaginationBarProps {
  totalItems: number;
  page: number;
  pageSize: number;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (size: number) => void;
  /** Opções do dropdown (ex.: `[5, 10, 20, 50]`). */
  pageSizeOptions?: readonly number[];
  labels?: TablePaginationBarLabels;
  className?: string;
}

/**
 * Barra de paginação (primeira/anterior/números/seguinte/última + linhas por página).
 */
export function TablePaginationBar({
  totalItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = CONFIG_PAGE_SIZE_OPTIONS,
  labels: labelsProp,
  className,
}: TablePaginationBarProps) {
  const labels = { ...defaultLabels, ...labelsProp };

  if (totalItems === 0) {
    return null;
  }

  const totalPages = Math.ceil(totalItems / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const canPrev = page > 1;
  const canNext = totalPages > 0 && page < totalPages;
  const visiblePages = getVisiblePageNumbers(page, totalPages, 5);

  const options =
    pageSizeOptions && pageSizeOptions.length > 0
      ? [...pageSizeOptions]
      : [...CONFIG_PAGE_SIZE_OPTIONS];

  return (
    <div
      className={cn(
        "border-t border-border bg-muted/20 px-3 py-4 sm:px-4",
        className
      )}
    >
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-4">
        <p className="text-center text-sm text-muted-foreground lg:text-left">
          {labels.showingRange(from, to, totalItems)}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-foreground"
            disabled={!canPrev}
            onClick={() => onPageChange(1)}
            aria-label={labels.firstPage}
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-foreground"
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
            aria-label={labels.previousPage}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>

          {visiblePages.map((p) => (
            <Button
              key={p}
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 min-w-9 shrink-0 rounded-full px-2 font-medium tabular-nums text-foreground",
                p === page &&
                  "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
              )}
              onClick={() => onPageChange(p)}
              aria-label={`Página ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Button>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-foreground"
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
            aria-label={labels.nextPage}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-foreground"
            disabled={!canNext}
            onClick={() => onPageChange(totalPages)}
            aria-label={labels.lastPage}
          >
            <ChevronsRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 lg:justify-end">
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {labels.rowsPerPage}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-9 w-[4.5rem] rounded-[7px] border-input bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
