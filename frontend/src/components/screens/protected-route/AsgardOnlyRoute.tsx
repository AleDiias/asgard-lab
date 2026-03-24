import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Rotas exclusivas de Super Admin (Empresas, Equipe Asgard).
 */
export function AsgardOnlyRoute() {
  const user = useAuthStore((s) => s.user);

  if (user?.isSuperAdmin !== true) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
