import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "react-router-dom";
import { ArrowLeft, Filter, Loader2, UserPlus } from "lucide-react";
import "@/locales/i18n";
import { ActionBar, Button, FormPageShell } from "@/components/ui";
import {
  CLIENT_USERS_ROUTES,
  ClientUserFormUI,
  ClientUserListUI,
  clientUserFormUiDefaultLabels,
  clientUsersScreen,
  type ClientUserListRow,
  type ClientUserPermissionOption,
} from "@/components/screens/client-users";

const permissionOptions: ClientUserPermissionOption[] = [
  { id: "dashboard.view", label: "Visualizar Dashboard" },
  { id: "agents.manage", label: "Gerenciar Agentes" },
  { id: "campaigns.read", label: "Campanhas (leitura)" },
];

const sampleRows: ClientUserListRow[] = [
  {
    id: "1",
    name: "Ana Costa",
    email: "ana@empresa.com",
    role: "Admin",
    status: "active",
    permissionLabels: ["Visualizar Dashboard", "Gerenciar Agentes", "Campanhas (leitura)"],
  },
  {
    id: "2",
    name: "Bruno Silva",
    email: "bruno@empresa.com",
    role: "Supervisor",
    status: "inactive",
    permissionLabels: ["Campanhas (leitura)"],
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
      <Link to={CLIENT_USERS_ROUTES.newUser}>
        <UserPlus className="h-4 w-4" aria-hidden />
        Novo usuário
      </Link>
    </Button>
  </>
);

const STORY_CLIENT_USER_FORM_ID = "story-client-user-form";

function clientUserFormActions(isLoading: boolean) {
  return (
    <>
      <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
        <Link to={CLIENT_USERS_ROUTES.list} aria-label="Voltar à lista">
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
      <Button type="submit" form={STORY_CLIENT_USER_FORM_ID} size="sm" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            {clientUserFormUiDefaultLabels.submit}
          </>
        ) : (
          clientUserFormUiDefaultLabels.submit
        )}
      </Button>
    </>
  );
}

const meta = {
  title: "Screens/Config/Client Users",
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
          title={clientUsersScreen.newUser.title}
          breadcrumb={[...clientUsersScreen.newUser.breadcrumb]}
          actions={clientUserFormActions(false)}
        />
        <FormPageShell maxWidth="wide">
          <ClientUserFormUI
            mode="new"
            formId={STORY_CLIENT_USER_FORM_ID}
            hideSubmitButton
            permissionOptions={permissionOptions}
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
          title={clientUsersScreen.newUser.title}
          breadcrumb={[...clientUsersScreen.newUser.breadcrumb]}
          actions={clientUserFormActions(true)}
        />
        <FormPageShell maxWidth="wide">
          <ClientUserFormUI
            mode="new"
            formId={STORY_CLIENT_USER_FORM_ID}
            hideSubmitButton
            permissionOptions={permissionOptions}
            onSubmit={() => { }}
            isLoading
            hideTitle
          />
        </FormPageShell>
      </section>
    </div>
  ),
};

export const FormEdit: StoryObj = {
  name: "Form — editar (status na linha)",
  render: () => (
    <div className="flex min-h-[85vh] flex-col bg-background">
      <section className="flex min-h-0 flex-1 flex-col gap-6">
        <ActionBar
          title="Editar usuário"
          breadcrumb={[...clientUsersScreen.newUser.breadcrumb]}
          actions={clientUserFormActions(false)}
        />
        <FormPageShell maxWidth="wide">
          <ClientUserFormUI
            mode="edit"
            formId={STORY_CLIENT_USER_FORM_ID}
            hideSubmitButton
            permissionOptions={permissionOptions}
            values={{
              name: "Ana Costa",
              email: "ana@empresa.com",
              status: "active",
              permissionIds: ["dashboard.view"],
            }}
            onSubmit={() => { }}
            hideTitle
          />
        </FormPageShell>
      </section>
    </div>
  ),
};

export const FormWithFieldErrors: StoryObj = {
  name: "Form — field errors (Zod → props)",
  render: () => (
    <div className="flex min-h-[85vh] flex-col bg-background">
      <section className="flex min-h-0 flex-1 flex-col gap-6">
        <ActionBar
          title={clientUsersScreen.newUser.title}
          breadcrumb={[...clientUsersScreen.newUser.breadcrumb]}
          actions={clientUserFormActions(false)}
        />
        <FormPageShell maxWidth="wide">
          <ClientUserFormUI
            mode="new"
            formId={STORY_CLIENT_USER_FORM_ID}
            hideSubmitButton
            permissionOptions={permissionOptions}
            onSubmit={() => { }}
            hideTitle
            fieldErrors={{
              name: "Nome é obrigatório.",
              email: "E-mail inválido.",
              permissions: "Selecione ao menos uma permissão.",
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
        title={clientUsersScreen.list.title}
        breadcrumb={[...clientUsersScreen.list.breadcrumb]}
        actions={listActions}
      />
      <ClientUserListUI rows={sampleRows} hideTitle onEdit={() => { }} onDelete={() => { }} />
    </section>
  ),
};

export const ListEmpty: StoryObj = {
  name: "List — empty",
  render: () => (
    <section className="space-y-3">
      <ActionBar
        title={clientUsersScreen.list.title}
        breadcrumb={[...clientUsersScreen.list.breadcrumb]}
        actions={listActions}
      />
      <ClientUserListUI rows={[]} hideTitle onEdit={() => { }} onDelete={() => { }} />
    </section>
  ),
};
