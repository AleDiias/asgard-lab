import type { ListLeadsParams } from "@/api/core/leads.api";

/** Colunas que podem ordenar via API. */
export type LeadSortableColumn = "name" | "phone" | "status" | "createdAt";

export type LeadTableSortState =
  | { mode: "default" }
  | { mode: "column"; column: LeadSortableColumn; direction: "asc" | "desc" };

export function cycleLeadTableSort(
  clicked: LeadSortableColumn,
  prev: LeadTableSortState
): LeadTableSortState {
  if (prev.mode === "default") {
    return { mode: "column", column: clicked, direction: "asc" };
  }
  if (prev.column !== clicked) {
    return { mode: "column", column: clicked, direction: "asc" };
  }
  if (prev.direction === "asc") {
    return { mode: "column", column: clicked, direction: "desc" };
  }
  return { mode: "default" };
}

/** Converte estado da UI para parâmetro `sort` da API. */
export function leadTableSortToApi(sort: LeadTableSortState): NonNullable<ListLeadsParams["sort"]> {
  if (sort.mode === "default") {
    return "created_at_desc";
  }
  const { column, direction } = sort;
  const dir = direction;
  if (column === "name") {
    return dir === "asc" ? "name_asc" : "name_desc";
  }
  if (column === "phone") {
    return dir === "asc" ? "phone_asc" : "phone_desc";
  }
  if (column === "status") {
    return dir === "asc" ? "status_asc" : "status_desc";
  }
  return dir === "asc" ? "created_at_asc" : "created_at_desc";
}

export function sortIndicator(
  sort: LeadTableSortState,
  column: LeadSortableColumn
): "none" | "asc" | "desc" {
  if (sort.mode === "default" || sort.column !== column) return "none";
  return sort.direction;
}
