import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessCampaignsView } from "@/utils/asgard-access";

/** Campanhas: `campaigns.read` / `campaigns.write` / `*`, ou equipe Asgard. */
export function CampaignsRoute() {
  const user = useAuthStore((s) => s.user);

  if (!canAccessCampaignsView(user)) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
