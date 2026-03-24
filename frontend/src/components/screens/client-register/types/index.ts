import type { CompanyAccountStatus } from "@/lib/status";

export interface ClientModuleOption {
  id: string;
  label: string;
}

export interface ClientFormValues {
  companyName: string;
  /** CNPJ com máscara (ex.: 00.000.000/0000-00) */
  cnpj: string;
  /**
   * Data de vencimento / faturamento (ISO `YYYY-MM-DD`).
   * String vazia quando ainda não selecionada.
   */
  billingDate: string;
  ownerEmail: string;
  /** Telefone com máscara */
  phone: string;
  /** Subdomínio / slug (ex.: machado) */
  domain: string;
  moduleIds: string[];
  /** Modo edição: conta ativa/inativa no master (API `isActive`). */
  accountStatus: "active" | "inactive";
}

/** Alias de domínio — empresas podem estar bloqueadas (inadimplência / política). */
export type ClientCompanyStatus = CompanyAccountStatus;

export interface ClientListRow {
  id: string;
  companyName: string;
  domain: string;
  status: ClientCompanyStatus;
  /** CNPJ com máscara ou vazio */
  cnpj: string;
  /** Data ISO `YYYY-MM-DD` ou vazio */
  billingDate: string;
  ownerEmail: string;
  /** Telefone com máscara ou vazio */
  phone: string;
}

export interface ClientFormFieldErrors {
  companyName?: string;
  cnpj?: string;
  billingDate?: string;
  ownerEmail?: string;
  phone?: string;
  domain?: string;
  modules?: string;
  accountStatus?: string;
}
