export * from "./masks";

/** Rotas do fluxo de cadastro / listagem de empresas cliente (Super Admin) */
export const CLIENT_REGISTER_ROUTES = {
  list: "/app/admin/tenants",
  newCompany: "/app/admin/tenants/new",
  editCompany: (id: string) => `/app/admin/tenants/${id}/edit`,
} as const;

/** Títulos e breadcrumbs padrão (container pode sobrescrever via props) */
export const clientRegisterScreen = {
  list: {
    title: "Empresas",
    breadcrumb: [
      { label: "Configurações" },
      { label: "Empresas" },
    ],
  },
  newCompany: {
    title: "Cadastro de empresa",
    breadcrumb: [
      { label: "Configurações" },
      { label: "Empresas", to: "/app/admin/tenants" },
      { label: "Nova empresa" },
    ],
  },
  editCompany: {
    title: "Editar empresa",
    breadcrumb: [
      { label: "Configurações" },
      { label: "Empresas", to: "/app/admin/tenants" },
      { label: "Editar empresa" },
    ],
  },
} as const;
