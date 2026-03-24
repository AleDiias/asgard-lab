import { BarChart3, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { ActionBar, Button } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessLeadsTracking } from "@/utils/asgard-access";
import { dashboardScreen } from "./dashboard.config";

export interface OverviewDashboardProps {
  /**
   * Exibe cartões de métricas de exemplo (apenas Storybook / demonstração).
   * Em produção deve permanecer `false` até existir API de indicadores.
   */
  showDemoMetrics?: boolean;
}

export function OverviewDashboard({ showDemoMetrics = false }: OverviewDashboardProps) {
  const user = useAuthStore((s) => s.user);
  const showAsgardActions = user?.isSuperAdmin === true;
  const showLeadsTracking = canAccessLeadsTracking(user);

  return (
    <section className="space-y-6">
      <ActionBar
        title={dashboardScreen.overview.title}
        breadcrumb={[...dashboardScreen.overview.breadcrumb]}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label="Filtros"
            >
              <Filter className="h-4 w-4" aria-hidden />
            </Button>
            {showLeadsTracking && (
              <Button type="button" size="sm" variant="outline" className="gap-1.5" asChild>
                <Link to="/app/leads">
                  <BarChart3 className="h-4 w-4" aria-hidden />
                  Leads
                </Link>
              </Button>
            )}
            {showAsgardActions && (
              <Button type="button" size="sm" asChild>
                <Link to="/app/admin/tenants">Empresas</Link>
              </Button>
            )}
          </>
        }
      />

      <p className="text-sm text-muted-foreground">
        Bem-vindo{user?.email ? `, ${user.email}` : ""}. Aqui fica a visão geral do CRM.
      </p>

      {showDemoMetrics ? (
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Leads em aberto</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">128</p>
          </article>

          <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Taxa de conversão</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">22.4%</p>
          </article>

          <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Atividades hoje</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">57</p>
          </article>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Indicadores e resumos serão exibidos aqui quando estiverem disponíveis na API.
        </p>
      )}
    </section>
  );
}
