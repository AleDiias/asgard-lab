/** Rotas — integrações de discador (tenant) */
export const INTEGRATIONS_SETTINGS_ROUTES = {
  list: "/app/settings/integrations",
  new: "/app/settings/integrations/new",
  edit: (id: string) => `/app/settings/integrations/${id}/edit`,
} as const;

/**
 * Breadcrumb alinhado a `clientUsersScreen` / empresas: **Configurações** > **Integrações**.
 */
export const integrationsSettingsScreen = {
  list: {
    title: "Integrações",
    breadcrumb: [{ label: "Configurações" }, { label: "Integrações" }] as const,
  },
  new: {
    title: "Nova integração",
    breadcrumb: [
      { label: "Configurações" },
      { label: "Integrações", to: "/app/settings/integrations" },
      { label: "Nova integração" },
    ] as const,
  },
  edit: {
    title: "Editar integração",
    breadcrumb: [
      { label: "Configurações" },
      { label: "Integrações", to: "/app/settings/integrations" },
      { label: "Editar integração" },
    ] as const,
  },
} as const;
