import type { NavbarMenuRoute } from "./types";

export interface BuildNavbarMenuOptions {
  /** Empresas + Equipe Asgard — apenas `isSuperAdmin: true`. */
  showSuperAdminSections: boolean;
  /** Usuários (tenant) — visibilidade no layout conforme papel/permissões. */
  showTenantTeam: boolean;
  /** Acompanhamento de leads — `leads.read` / `leads.write` / `*`, ou equipe Asgard. */
  showLeadsTracking?: boolean;
  /** Campanhas omnichannel / discadores — `campaigns.read` / `campaigns.write` / `*`, ou Asgard. */
  showCampaigns?: boolean;
  /** Integrações de discador em Configurações — `integrations.*` ou Asgard. */
  showIntegrationsSettings?: boolean;
}

/**
 * Menu lateral: Dashboards, Configurações (visível conforme papel/permissões), Documentação.
 */
export function buildNavbarMenuRoutes(options: BuildNavbarMenuOptions): NavbarMenuRoute[] {
  const {
    showSuperAdminSections,
    showTenantTeam,
    showLeadsTracking = false,
    showCampaigns = false,
    showIntegrationsSettings = false,
  } = options;

  const settingsChildren: NavbarMenuRoute[] = [];

  if (showTenantTeam) {
    settingsChildren.push({ label: "Usuários", to: "/app/users" });
  }

  if (showIntegrationsSettings) {
    settingsChildren.push({ label: "Integrações", to: "/app/settings/integrations" });
  }

  if (showSuperAdminSections) {
    settingsChildren.push(
      { label: "Empresas", to: "/app/admin/tenants" },
      { label: "Equipe Asgard", to: "/app/admin/asgard-users" }
    );
  }

  const dashboardChildren: NavbarMenuRoute[] = [
    { label: "Visão geral", to: "/app" },
  ];
  if (showLeadsTracking) {
    dashboardChildren.push({ label: "Leads", to: "/app/leads" });
  }
  if (showCampaigns) {
    dashboardChildren.push({ label: "Campanhas", to: "/app/campaigns" });
  }

  const routes: NavbarMenuRoute[] = [
    {
      label: "Dashboards",
      children: dashboardChildren,
    },
  ];

  if (settingsChildren.length > 0) {
    routes.push({
      label: "Configurações",
      children: settingsChildren,
    });
  }

  routes.push({
    label: "Documentação",
    href: "https://example.com/docs",
  });

  return routes;
}

/** @deprecated Prefer `buildNavbarMenuRoutes` com opções; mantido para Storybook com menu “completo”. */
export const NAVBAR_MENU_ROUTES: NavbarMenuRoute[] = buildNavbarMenuRoutes({
  showSuperAdminSections: true,
  showTenantTeam: false,
  showLeadsTracking: true,
  showCampaigns: true,
  showIntegrationsSettings: true,
});
