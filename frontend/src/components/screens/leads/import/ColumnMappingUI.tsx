import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { COLUMN_MAP_NONE, type ColumnMappingState, type LeadImportFieldKey } from "./types";

const FIELDS: {
  key: LeadImportFieldKey;
  label: string;
  required: boolean;
}[] = [
  { key: "name", label: "Nome", required: true },
  { key: "phone", label: "Telefone", required: true },
  { key: "email", label: "E-mail", required: false },
];

export interface ColumnMappingUIProps {
  headers: string[];
  mapping: ColumnMappingState;
  onMappingChange: (next: ColumnMappingState) => void;
  disabled?: boolean;
  /** Erro de validação vindo do container (ex.: Zod). */
  error?: string;
}

export function ColumnMappingUI({
  headers,
  mapping,
  onMappingChange,
  disabled,
  error,
}: ColumnMappingUIProps) {
  const setField = (key: LeadImportFieldKey, value: string) => {
    onMappingChange({ ...mapping, [key]: value });
  };

  const headerOptions = headers.filter((h) => h.trim().length > 0);

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-border">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Campo no CRM</TableHead>
            <TableHead>Coluna do CSV</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {FIELDS.map((field) => (
            <TableRow key={field.key}>
              <TableCell className="align-middle font-medium">
                {field.label}
                {field.required ? (
                  <span className="ml-1 text-destructive" aria-hidden>
                    *
                  </span>
                ) : null}
              </TableCell>
              <TableCell>
                <Select
                  value={
                    field.required
                      ? mapping[field.key] === COLUMN_MAP_NONE
                        ? undefined
                        : mapping[field.key]
                      : mapping[field.key]
                  }
                  onValueChange={(v) => setField(field.key, v)}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue
                      placeholder={
                        field.required ? "Selecione uma coluna…" : "Opcional — ignorar"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {!field.required ? (
                      <SelectItem value={COLUMN_MAP_NONE}>— Não mapear —</SelectItem>
                    ) : null}
                    {headerOptions.map((h) => (
                      <SelectItem key={`${field.key}-${h}`} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
