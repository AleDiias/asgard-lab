import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "react-router-dom";
import { ArrowLeft, Filter, Loader2, UserPlus } from "lucide-react";
import "@/locales/i18n";
import { ActionBar, Button, FormPageShell } from "@/components/ui";
import {
  ASGARD_USERS_ROUTES,
  AsgardUserFormUI,
  AsgardUserListUI,
  asgardUserFormUiDefaultLabels,
  asgardUsersScreen,
  type AsgardUserListRow,
} from "@/components/screens/asgard-users";

const sampleRows: AsgardUserListRow[] = [
  {
    id: "1",
    name: "Carla Asgard",
    email: "carla@asgardai.com.br",
    status: "active",
  },
  {
    id: "2",
    name: "Diego Asgard",
    email: "diego@asgardai.com.br",
    status: "inactive",
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
      <Link to={ASGARD_USERS_ROUTES.newMember}>
        <UserPlus className="h-4 w-4" aria-hidden />
        Novo membro
      </Link>
    </Button>
  </>
);

const STORY_ASGARD_USER_FORM_ID = "story-asgard-user-form";

function asgardUserFormActions(isLoading: boolean) {
  return (
    <>
      <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
        <Link to={ASGARD_USERS_ROUTES.list} aria-label="Voltar à lista">
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
      <Button type="submit" form={STORY_ASGARD_USER_FORM_ID} size="sm" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            {asgardUserFormUiDefaultLabels.submit}
          </>
        ) : (
          asgardUserFormUiDefaultLabels.submit
        )}
      </Button>
    </>
  );
}

const meta = {
  title: "Screens/Config/Asgard Users",
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
          title={asgardUsersScreen.newMember.title}
          breadcrumb={[...asgardUsersScreen.newMember.breadcrumb]}
          actions={asgardUserFormActions(false)}
        />
        <FormPageShell maxWidth="wide" fullWidth>
          <AsgardUserFormUI
            formId={STORY_ASGARD_USER_FORM_ID}
            hideSubmitButton
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
          title={asgardUsersScreen.newMember.title}
          breadcrumb={[...asgardUsersScreen.newMember.breadcrumb]}
          actions={asgardUserFormActions(true)}
        />
        <FormPageShell maxWidth="wide" fullWidth>
          <AsgardUserFormUI
            formId={STORY_ASGARD_USER_FORM_ID}
            hideSubmitButton
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
          title={asgardUsersScreen.newMember.title}
          breadcrumb={[...asgardUsersScreen.newMember.breadcrumb]}
          actions={asgardUserFormActions(false)}
        />
        <FormPageShell maxWidth="wide" fullWidth>
          <AsgardUserFormUI
            formId={STORY_ASGARD_USER_FORM_ID}
            hideSubmitButton
            onSubmit={() => { }}
            hideTitle
            fieldErrors={{
              name: "Informe o nome.",
              email: "Informe um e-mail @asgardai.com.br.",
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
        title={asgardUsersScreen.list.title}
        breadcrumb={[...asgardUsersScreen.list.breadcrumb]}
        actions={listActions}
      />
      <AsgardUserListUI rows={sampleRows} hideTitle onToggleStatus={() => {}} />
    </section>
  ),
};

export const ListEmpty: StoryObj = {
  name: "List — empty",
  render: () => (
    <section className="space-y-3">
      <ActionBar
        title={asgardUsersScreen.list.title}
        breadcrumb={[...asgardUsersScreen.list.breadcrumb]}
        actions={listActions}
      />
      <AsgardUserListUI rows={[]} hideTitle onToggleStatus={() => {}} />
    </section>
  ),
};
