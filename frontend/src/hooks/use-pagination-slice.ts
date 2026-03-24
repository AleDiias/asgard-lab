import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";

/** Tamanho de página inicial nas listas de Configuração. */
export const DEFAULT_CONFIG_PAGE_SIZE = 10;

/** Opções de linhas por página (dropdown). */
export const CONFIG_PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

export type ConfigPageSize = (typeof CONFIG_PAGE_SIZE_OPTIONS)[number];

export interface UsePaginationSliceOptions {
  initialPageSize?: ConfigPageSize;
}

export interface UsePaginationSliceResult<T> {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
  totalItems: number;
  totalPages: number;
  paginatedItems: T[];
}

/**
 * Paginação no cliente sobre um array já carregado (ex.: resultado de `useQuery`).
 */
export function usePaginationSlice<T>(
  items: T[],
  options?: UsePaginationSliceOptions
): UsePaginationSliceResult<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(options?.initialPageSize ?? DEFAULT_CONFIG_PAGE_SIZE);

  const totalItems = items.length;

  const totalPages = useMemo(() => {
    if (totalItems === 0) return 0;
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  /** Ao mudar o tamanho da página, volta à primeira página. */
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (totalPages === 0) {
      setPage(1);
      return;
    }
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    if (totalItems === 0) return [];
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize, totalItems]);

  return { page, setPage, pageSize, setPageSize, totalItems, totalPages, paginatedItems };
}
