import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessLeadsTracking } from "@/utils/asgard-access";

/**
 * Rotas de acompanhamento de leads (métricas, contactos, histórico de importações).
 */
export function LeadsTrackingRoute() {
  const user = useAuthStore((s) => s.user);

  if (!canAccessLeadsTracking(user)) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
