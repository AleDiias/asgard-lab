import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessLeadsImport } from "@/utils/asgard-access";

/**
 * Rotas de importação de leads: `leads.write` / `*`, ou equipe Asgard (com `X-Tenant-Domain` quando aplicável).
 */
export function LeadsImportRoute() {
  const user = useAuthStore((s) => s.user);

  if (!canAccessLeadsImport(user)) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
