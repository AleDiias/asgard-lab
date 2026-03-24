export type LeadImportFieldKey = "name" | "phone" | "email";

/** Valor `__none__` no mapeamento de e-mail = coluna não usada. */
export const COLUMN_MAP_NONE = "__none__";

export type ColumnMappingState = Record<LeadImportFieldKey, string>;

export const defaultColumnMapping = (): ColumnMappingState => ({
  name: COLUMN_MAP_NONE,
  phone: COLUMN_MAP_NONE,
  email: COLUMN_MAP_NONE,
});
