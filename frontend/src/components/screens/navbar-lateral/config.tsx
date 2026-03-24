import { FileText, Home, Settings } from "lucide-react";
import type { NavbarLateralMenuItem, NavbarLateralUser } from "./types";
import { buildNavbarMenuRoutes, NAVBAR_MENU_ROUTES } from "./menu-routes";

import asgardLogo from "@/assets/logo/asgard-logo.png";

const iconClass = "h-4 w-4 shrink-0";

function iconForRouteLabel(label: string) {
  switch (label) {
    case "Dashboards":
      return <Home key="home" className={iconClass} />;
    case "Configurações":
      return <Settings key="settings" className={iconClass} />;
    case "Documentação":
      return <FileText key="docs" className={iconClass} />;
    default:
      return <Home key="fallback" className={iconClass} />;
  }
}

export function buildNavbarMenuItems(options: {
  showSuperAdminSections: boolean;
  showTenantTeam: boolean;
  showLeadsTracking?: boolean;
  showCampaigns?: boolean;
  showIntegrationsSettings?: boolean;
}): NavbarLateralMenuItem[] {
  const routes = buildNavbarMenuRoutes(options);
  return routes.map((route) => ({
    ...route,
    icon: iconForRouteLabel(route.label),
  })) as NavbarLateralMenuItem[];
}

/** Storybook / pré-visualizações com todas as opções de gestão Asgard. */
export const defaultNavbarMenuItems: NavbarLateralMenuItem[] =
  NAVBAR_MENU_ROUTES.map((route) => ({
    ...route,
    icon: iconForRouteLabel(route.label),
  })) as NavbarLateralMenuItem[];

export const defaultNavbarLogo = (
  <a
    href="/"
    className="flex w-full items-center justify-center font-semibold text-sidebar-foreground"
    aria-label="Asgard LAB - Início"
  >
    <img
      src={asgardLogo}
      alt="Asgard LAB"
      className="h-16 w-auto object-contain group-data-[collapsible=icon]:h-10"
    />
  </a>
);

export const defaultNavbarUser: NavbarLateralUser = {
  name: "Maria Silva",
  avatarUrl: "https://github.com/shadcn.png",
};
