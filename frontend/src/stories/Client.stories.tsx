import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "react-router-dom";
import { ArrowLeft, Filter, Loader2, Plus } from "lucide-react";
import "@/locales/i18n";
import { ActionBar, Button, FormPageShell } from "@/components/ui";
import {
  CLIENT_REGISTER_ROUTES,
  ClientFormUI,
  ClientListUI,
  clientFormUiDefaultLabels,
  clientRegisterScreen,
  type ClientListRow,
  type ClientModuleOption,
} from "@/components/screens/client-register";

const moduleOptions: ClientModuleOption[] = [
  { id: "crm", label: "CRM" },
  { id: "dialer", label: "Discador" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "reports", label: "Relatórios avançados" },
];

const sampleCompanies: ClientListRow[] = [
  {
    id: "1",
    companyName: "Machado Telecom",
    domain: "machado",
    status: "active",
    cnpj: "12.345.678/0001-90",
    billingDate: "2025-04-15",
    ownerEmail: "admin@machado.example",
    phone: "(11) 98888-7777",
  },
  {
    id: "2",
    companyName: "Outra Empresa SA",
    domain: "outra",
    status: "inactive",
    cnpj: "98.765.432/0001-10",
    billingDate: "2025-03-01",
    ownerEmail: "contato@outra.example",
    phone: "(21) 97777-6666",
  },
  {
    id: "3",
    companyName: "Cliente em débito",
    domain: "debito",
    status: "blocked",
    cnpj: "11.222.333/0001-44",
    billingDate: "",
    ownerEmail: "financeiro@debito.example",
    phone: "",
  },
];

const listActions = (
  <>
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-9 w-9 shrink-0"
      aria-label="Filtros"
    >
      <Filter className="h-4 w-4" aria-hidden />
    </Button>
    <Button type="button" size="sm" className="gap-1.5" asChild>
      <Link to={CLIENT_REGISTER_ROUTES.newCompany}>
        <Plus className="h-4 w-4" aria-hidden />
        Nova empresa
      </Link>
    </Button>
  </>
);

const STORY_CLIENT_REGISTER_FORM_ID = "story-client-register-form";

function clientRegisterFormActions(isLoading: boolean) {
  return (
    <>
      <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
        <Link to={CLIENT_REGISTER_ROUTES.list} aria-label="Voltar à lista">
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
      <Button type="submit" form={STORY_CLIENT_REGISTER_FORM_ID} size="sm" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            {clientFormUiDefaultLabels.submit}
          </>
        ) : (
          clientFormUiDefaultLabels.submit
        )}
      </Button>
    </>
  );
}

const meta = {
  title: "Screens/Config/Client Register",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

export const FormDefault: StoryObj = {
  name: "Form — default",
  render: () => (
    <div className="flex min-h-[85vh] flex-col bg-background">
      <section className="flex min-h-0 flex-1 flex-col gap-6">
        <ActionBar
          title={clientRegisterScreen.newCompany.title}
          breadcrumb={[...clientRegisterScreen.newCompany.breadcrumb]}
          actions={clientRegisterFormActions(false)}
        />
        <FormPageShell maxWidth="wide">
          <ClientFormUI
            formId={STORY_CLIENT_REGISTER_FORM_ID}
            hideSubmitButton
            moduleOptions={moduleOptions}
            onSubmit={() => { }}
            isLoading={false}
            hideTitle
          />
        </FormPageShell>
      </section>
    </div>
  ),
};

export const FormLoading: StoryObj = {
  name: "Form — loading",
  render: () => (
    <div className="flex min-h-[85vh] flex-col bg-background">
      <section className="flex min-h-0 flex-1 flex-col gap-6">
        <ActionBar
          title={clientRegisterScreen.newCompany.title}
          breadcrumb={[...clientRegisterScreen.newCompany.breadcrumb]}
          actions={clientRegisterFormActions(true)}
        />
        <FormPageShell maxWidth="wide">
          <ClientFormUI
            formId={STORY_CLIENT_REGISTER_FORM_ID}
            hideSubmitButton
            moduleOptions={moduleOptions}
            onSubmit={() => { }}
            isLoading
            hideTitle
          />
        </FormPageShell>
      </section>
    </div>
  ),
};

export const FormWithFieldErrors: StoryObj = {
  name: "Form — field errors",
  render: () => (
    <div className="flex min-h-[85vh] flex-col bg-background">
      <section className="flex min-h-0 flex-1 flex-col gap-6">
        <ActionBar
          title={clientRegisterScreen.newCompany.title}
          breadcrumb={[...clientRegisterScreen.newCompany.breadcrumb]}
          actions={clientRegisterFormActions(false)}
        />
        <FormPageShell maxWidth="wide">
          <ClientFormUI
            formId={STORY_CLIENT_REGISTER_FORM_ID}
            hideSubmitButton
            moduleOptions={moduleOptions}
            onSubmit={() => { }}
            hideTitle
            fieldErrors={{
              cnpj: "CNPJ inválido.",
              billingDate: "Selecione a data de vencimento.",
              domain: "Domínio já em uso.",
              modules: "Selecione ao menos um módulo.",
            }}
          />
        </FormPageShell>
      </section>
    </div>
  ),
};

export const ListDefault: StoryObj = {
  name: "List — default",
  render: () => (
    <section className="space-y-3">
      <ActionBar
        title={clientRegisterScreen.list.title}
        breadcrumb={[...clientRegisterScreen.list.breadcrumb]}
        actions={listActions}
      />
      <ClientListUI rows={sampleCompanies} hideTitle onEdit={() => {}} />
    </section>
  ),
};

export const ListEmpty: StoryObj = {
  name: "List — empty",
  render: () => (
    <section className="space-y-3">
      <ActionBar
        title={clientRegisterScreen.list.title}
        breadcrumb={[...clientRegisterScreen.list.breadcrumb]}
        actions={listActions}
      />
      <ClientListUI rows={[]} hideTitle onEdit={() => {}} />
    </section>
  ),
};
