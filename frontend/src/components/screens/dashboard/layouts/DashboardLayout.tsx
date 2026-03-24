import { useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui";
import { NavbarLateral, defaultNavbarLogo, buildNavbarMenuItems } from "@/components/screens";
import { useAuthStore } from "@/stores/auth.store";
import {
  canAccessCampaignsView,
  canAccessIntegrationsSettings,
  canAccessLeadsTracking,
  canAccessTenantUsersView,
} from "@/utils/asgard-access";

export function DashboardLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const showSuperAdminSections = user?.isSuperAdmin === true;
  /** Inclui equipe @asgardai.com.br: lista utilizadores do cliente conforme o domínio (subdomínio) acedido. */
  const showTenantTeam = canAccessTenantUsersView(user);
  const showLeadsTracking = canAccessLeadsTracking(user);
  const showCampaigns = canAccessCampaignsView(user);
  const showIntegrationsSettings = canAccessIntegrationsSettings(user);

  const menuItems = useMemo(
    () =>
      buildNavbarMenuItems({
        showSuperAdminSections,
        showTenantTeam,
        showLeadsTracking,
        showCampaigns,
        showIntegrationsSettings,
      }),
    [showSuperAdminSections, showTenantTeam, showLeadsTracking, showCampaigns, showIntegrationsSettings]
  );

  const handleLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  const userName =
    user?.email?.split("@")[0]?.replace(/[._-]/g, " ").trim() || "Usuário";

  return (
    <SidebarProvider className="flex h-svh max-h-svh min-h-0 w-full overflow-hidden">
      <div className="flex min-h-0 flex-1 bg-background">
        <NavbarLateral
          logo={defaultNavbarLogo}
          menuItems={menuItems}
          user={{ name: userName, avatarUrl: null }}
          onLogout={handleLogout}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <main className="flex min-h-0 flex-1 flex-col overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
