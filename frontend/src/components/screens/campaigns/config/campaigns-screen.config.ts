/** Rotas — campanhas (tenant) */
export const CAMPAIGN_ROUTES = {
  list: "/app/campaigns",
  new: "/app/campaigns/new",
  edit: (id: string) => `/app/campaigns/${id}/edit`,
} as const;

export const campaignsScreen = {
  list: {
    title: "Campanhas",
    breadcrumb: [{ label: "Início", to: "/app" }, { label: "Campanhas" }] as const,
  },
  new: {
    title: "Nova campanha",
    breadcrumb: [
      { label: "Início", to: "/app" },
      { label: "Campanhas", to: "/app/campaigns" },
      { label: "Nova campanha" },
    ] as const,
  },
  edit: {
    title: "Editar campanha",
    breadcrumb: [
      { label: "Início", to: "/app" },
      { label: "Campanhas", to: "/app/campaigns" },
      { label: "Editar campanha" },
    ] as const,
  },
} as const;
