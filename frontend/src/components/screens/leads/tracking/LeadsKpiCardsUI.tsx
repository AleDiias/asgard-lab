import type { LeadMetricsSnapshot } from "@/types/core-leads.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface LeadsKpiCardsUIProps {
  metrics: LeadMetricsSnapshot | undefined;
  loading?: boolean;
  className?: string;
}

const items: {
  key: keyof Pick<
    LeadMetricsSnapshot,
    "totalLeads" | "novos" | "emAtendimento" | "finalizados"
  >;
  label: string;
}[] = [
    { key: "totalLeads", label: "Total de contatos" },
    { key: "novos", label: "Novos" },
    { key: "emAtendimento", label: "Em atendimento" },
    { key: "finalizados", label: "Finalizados" },
  ];

/**
 * Presentacional: quatro cartões de KPI com totais de leads.
 */
export function LeadsKpiCardsUI({ metrics, loading, className }: LeadsKpiCardsUIProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map(({ key, label }) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {loading ? "—" : (metrics?.[key] ?? 0).toLocaleString("pt-PT")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
