import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessIntegrationsSettings } from "@/utils/asgard-access";

/** Integrações de discador: `integrations.read` / `integrations.write` / `*`, ou Asgard. */
export function IntegrationsSettingsRoute() {
  const user = useAuthStore((s) => s.user);

  if (!canAccessIntegrationsSettings(user)) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
