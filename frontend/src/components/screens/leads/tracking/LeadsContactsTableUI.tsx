import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Settings2 } from "lucide-react";
import {
  Button,
  Checkbox,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import type { LeadRecord } from "@/types/core-leads.types";
import { cn } from "@/lib/utils";
import type { LeadSortableColumn, LeadTableSortState } from "./lead-tracking-sort";
import { sortIndicator } from "./lead-tracking-sort";

const STORAGE_KEY = "asgard-crm-leads-contact-columns";

export type LeadContactColumnKey = "name" | "phone" | "status" | "email" | "createdAt";

const COLUMN_LABEL: Record<LeadContactColumnKey, string> = {
  name: "Nome",
  phone: "Telefone",
  status: "Status",
  email: "E-mail",
  createdAt: "Criado em",
};

const DEFAULT_VISIBLE: LeadContactColumnKey[] = ["name", "phone", "status"];

const ALL_COLUMNS: LeadContactColumnKey[] = ["name", "phone", "status", "email", "createdAt"];

function loadVisibleColumns(): LeadContactColumnKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_VISIBLE];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...DEFAULT_VISIBLE];
    const set = new Set(parsed as string[]);
    const next = ALL_COLUMNS.filter((k) => set.has(k));
    return next.length > 0 ? next : [...DEFAULT_VISIBLE];
  } catch {
    return [...DEFAULT_VISIBLE];
  }
}

function saveVisibleColumns(cols: LeadContactColumnKey[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
  } catch {
    /* ignore */
  }
}

const STATUS_LABEL: Record<LeadRecord["status"], string> = {
  novo: "Novo",
  em_atendimento: "Em atendimento",
  finalizado: "Finalizado",
};

function formatDt(iso: string) {
  try {
    return new Intl.DateTimeFormat("pt-PT", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export interface LeadsContactsTableUIProps {
  items: LeadRecord[];
  loading?: boolean;
  emptyLabel?: string;
  /** Pesquisa em tempo real (nome, telefone, e-mail — API). */
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sort: LeadTableSortState;
  onSortChange: (column: LeadSortableColumn) => void;
  className?: string;
}

function SortGlyph({ state }: { state: "none" | "asc" | "desc" }) {
  if (state === "asc") {
    return <ArrowUp className="h-3.5 w-3.5 opacity-70" aria-hidden />;
  }
  if (state === "desc") {
    return <ArrowDown className="h-3.5 w-3.5 opacity-70" aria-hidden />;
  }
  return <span className="inline-block h-3.5 w-3.5" aria-hidden />;
}

/**
 * Presentacional: tabela de contactos com colunas configuráveis, pesquisa e ordenação por coluna.
 */
export function LeadsContactsTableUI({
  items,
  loading,
  emptyLabel = "Sem contatos para exibir.",
  searchQuery,
  onSearchChange,
  sort,
  onSortChange,
  className,
}: LeadsContactsTableUIProps) {
  const [visible, setVisible] = useState<LeadContactColumnKey[]>(loadVisibleColumns);

  useEffect(() => {
    saveVisibleColumns(visible);
  }, [visible]);

  const toggleColumn = useCallback((key: LeadContactColumnKey, checked: boolean) => {
    setVisible((prev) => {
      if (checked) {
        if (prev.includes(key)) return prev;
        return [...prev, key];
      }
      const next = prev.filter((k) => k !== key);
      return next.length > 0 ? next : prev;
    });
  }, []);

  const orderedVisible = useMemo(
    () => ALL_COLUMNS.filter((k) => visible.includes(k)),
    [visible]
  );

  const colSpan = Math.max(orderedVisible.length, 1);

  const headerCell = (key: LeadContactColumnKey, sortable: boolean) => {
    const label = COLUMN_LABEL[key];
    if (!sortable) {
      return <span>{label}</span>;
    }
    const sortKey: LeadSortableColumn =
      key === "name"
        ? "name"
        : key === "phone"
          ? "phone"
          : key === "status"
            ? "status"
            : "createdAt";
    const ind = sortIndicator(sort, sortKey);
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1.5 font-medium hover:text-foreground"
        onClick={() => onSortChange(sortKey)}
      >
        {label}
        <SortGlyph state={ind} />
      </button>
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex min-w-0 items-center gap-2">
        <Input
          id="lead-contact-search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Nome, telefone ou e-mail…"
          disabled={loading}
          autoComplete="off"
          className="h-9 min-w-0 flex-1"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label="Colunas visíveis"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <p className="mb-2 text-sm font-medium">Colunas visíveis</p>
            <div className="space-y-2">
              {ALL_COLUMNS.map((key) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-2 text-sm leading-none"
                >
                  <Checkbox
                    checked={visible.includes(key)}
                    onCheckedChange={(c) => toggleColumn(key, c === true)}
                    disabled={visible.includes(key) && visible.length === 1}
                  />
                  {COLUMN_LABEL[key]}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {orderedVisible.map((key) => (
                <TableHead key={key}>
                  {headerCell(
                    key,
                    key === "name" || key === "phone" || key === "status" || key === "createdAt"
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-muted-foreground">
                  A carregar…
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-muted-foreground">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.id}>
                  {orderedVisible.map((key) => (
                    <TableCell
                      key={key}
                      className={cn(
                        key === "name" && "font-medium",
                        (key === "email" || key === "createdAt") && "text-muted-foreground"
                      )}
                    >
                      {key === "name" && row.name}
                      {key === "phone" && row.phone}
                      {key === "status" && STATUS_LABEL[row.status]}
                      {key === "email" && (row.email ?? "—")}
                      {key === "createdAt" && formatDt(row.createdAt)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
