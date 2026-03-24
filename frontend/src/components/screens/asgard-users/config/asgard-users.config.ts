/** Rotas — equipe interna Asgard (Super Admin) */
export const ASGARD_USERS_ROUTES = {
  list: "/app/admin/asgard-users",
  newMember: "/app/admin/asgard-users/new",
} as const;

export const asgardUsersScreen = {
  list: {
    title: "Equipe Asgard",
    breadcrumb: [
      { label: "Configurações" },
      { label: "Equipe Asgard" },
    ],
  },
  newMember: {
    title: "Novo membro da equipe Asgard",
    breadcrumb: [
      { label: "Configurações" },
      { label: "Equipe Asgard", to: "/app/admin/asgard-users" },
      { label: "Novo membro" },
    ],
  },
} as const;
