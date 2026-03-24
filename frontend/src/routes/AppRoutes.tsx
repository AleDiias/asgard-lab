import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "@/components/screens/protected-route/ProtectedRoute";
import { AsgardOnlyRoute } from "@/components/screens/protected-route/AsgardOnlyRoute";
import { TenantTeamRoute } from "@/components/screens/protected-route/TenantTeamRoute";
import { CampaignsRoute } from "@/components/screens/protected-route/CampaignsRoute";
import { IntegrationsSettingsRoute } from "@/components/screens/protected-route/IntegrationsSettingsRoute";
import { LeadsImportRoute } from "@/components/screens/protected-route/LeadsImportRoute";
import { LeadsTrackingRoute } from "@/components/screens/protected-route/LeadsTrackingRoute";
import { DashboardLayout } from "@/components/screens/dashboard/layouts/DashboardLayout";

const LoginPage = lazy(() =>
  import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const OverviewDashboard = lazy(() =>
  import("@/components/screens/dashboard/OverviewDashboard").then((m) => ({
    default: m.OverviewDashboard,
  }))
);
const ForgotPage = lazy(() =>
  import("@/pages/auth/ForgotPage").then((m) => ({ default: m.ForgotPage }))
);
const ResetPasswordPage = lazy(() =>
  import("@/pages/auth/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage }))
);
const NotFoundPage = lazy(() => import("@/components/screens/not-found"));

const ClientsRegisterListPage = lazy(() => import("@/pages/app/ClientsRegisterListPage"));
const ClientsRegisterNewPage = lazy(() => import("@/pages/app/ClientsRegisterNewPage"));
const ClientsRegisterEditPage = lazy(() => import("@/pages/app/ClientsRegisterEditPage"));
const ClientUsersPage = lazy(() => import("@/pages/app/ClientUsersPage"));
const ClientUserNewPage = lazy(() => import("@/pages/app/ClientUserNewPage"));
const AsgardTeamPage = lazy(() => import("@/pages/app/AsgardTeamPage"));
const AsgardMemberNewPage = lazy(() => import("@/pages/app/AsgardMemberNewPage"));
const LeadImportPage = lazy(() => import("@/pages/app/LeadImportPage"));
const LeadTrackingPage = lazy(() => import("@/pages/app/LeadTrackingPage"));
const CampaignsPage = lazy(() => import("@/pages/app/CampaignsPage"));
const CampaignNewPage = lazy(() => import("@/pages/app/CampaignNewPage"));
const CampaignEditPage = lazy(() => import("@/pages/app/CampaignEditPage"));
const SettingsIntegrationsPage = lazy(() => import("@/pages/app/SettingsIntegrationsPage"));
const IntegrationNewPage = lazy(() => import("@/pages/app/IntegrationNewPage"));
const IntegrationEditPage = lazy(() => import("@/pages/app/IntegrationEditPage"));
export const AppRoutes = () => {
  const { t } = useTranslation("common");

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <span className="text-muted-foreground">{t("app.loading")}</span>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<OverviewDashboard />} />
            <Route element={<TenantTeamRoute />}>
              <Route path="users/new" element={<ClientUserNewPage />} />
              <Route path="users" element={<ClientUsersPage />} />
            </Route>
            <Route element={<LeadsImportRoute />}>
              <Route path="leads/import" element={<LeadImportPage />} />
            </Route>
            <Route element={<LeadsTrackingRoute />}>
              <Route path="leads" element={<LeadTrackingPage />} />
            </Route>
            <Route element={<CampaignsRoute />}>
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="campaigns/new" element={<CampaignNewPage />} />
              <Route path="campaigns/:id/edit" element={<CampaignEditPage />} />
            </Route>
            <Route element={<IntegrationsSettingsRoute />}>
              <Route path="settings/integrations" element={<SettingsIntegrationsPage />} />
              <Route path="settings/integrations/new" element={<IntegrationNewPage />} />
              <Route path="settings/integrations/:id/edit" element={<IntegrationEditPage />} />
            </Route>
            <Route element={<AsgardOnlyRoute />}>
              <Route path="admin/tenants/new" element={<ClientsRegisterNewPage />} />
              <Route path="admin/tenants/:id/edit" element={<ClientsRegisterEditPage />} />
              <Route path="admin/tenants" element={<ClientsRegisterListPage />} />
              <Route path="admin/asgard-users/new" element={<AsgardMemberNewPage />} />
              <Route path="admin/asgard-users" element={<AsgardTeamPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="/forgot" element={<ForgotPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
