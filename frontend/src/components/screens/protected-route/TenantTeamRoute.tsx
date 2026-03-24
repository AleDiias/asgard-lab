import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessTenantUsersView } from "@/utils/asgard-access";

/**
 * Rotas de utilizadores do tenant: clientes com `users.manage`/`*`, ou equipe Asgard
 * (super-admin / @asgardai.com.br), com dados filtrados pelo domínio em `X-Tenant-Domain`.
 */
export function TenantTeamRoute() {
  const user = useAuthStore((s) => s.user);

  if (!canAccessTenantUsersView(user)) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
