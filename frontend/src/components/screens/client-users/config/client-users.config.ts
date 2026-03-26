/** Rotas — usuários vinculados ao tenant cliente */
export const CLIENT_USERS_ROUTES = {
  list: "/app/users",
  newUser: "/app/users/new",
  editUser: (id: string) => `/app/users/${id}/edit`,
} as const;

/**
 * Breadcrumb: **Configurações** (menu, sem link) > **Usuários** (sub-menu) > …
 */
export const clientUsersScreen = {
  list: {
    title: "Usuários",
    breadcrumb: [
      { label: "Configurações" },
      { label: "Usuários" },
    ],
  },
  newUser: {
    title: "Novo usuário",
    breadcrumb: [
      { label: "Configurações" },
      { label: "Usuários", to: "/app/users" },
      { label: "Novo usuário" },
    ],
  },
} as const;

/** Breadcrumb para edição: Configurações > Usuários > *nome do usuário*. */
export function clientUsersEditBreadcrumb(userName: string): { label: string; to?: string }[] {
  return [
    { label: "Configurações" },
    { label: "Usuários", to: "/app/users" },
    { label: userName },
  ];
}
