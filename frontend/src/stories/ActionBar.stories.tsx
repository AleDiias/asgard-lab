import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "react-router-dom";
import { Filter, Plus } from "lucide-react";
import { ActionBar } from "@/components/ui/action-bar";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/ActionBar",
  component: ActionBar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Nome da tela",
    },
  },
} satisfies Meta<typeof ActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Empresas",
    breadcrumb: [{ label: "Configurações" }, { label: "Empresas" }],
  },
};

export const TitleOnly: Story = {
  name: "Somente título",
  args: {
    title: "Visão geral",
    breadcrumb: undefined,
  },
};

export const WithActions: Story = {
  name: "Com filtros e ação",
  render: (args) => (
    <ActionBar
      {...args}
      actions={
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
            <Link to="/app/admin/tenants/new">
              <Plus className="h-4 w-4" aria-hidden />
              Nova empresa
            </Link>
          </Button>
        </>
      }
    />
  ),
  args: {
    title: "Empresas",
    breadcrumb: [{ label: "Configurações" }, { label: "Empresas" }],
  },
};

export const LongBreadcrumb: Story = {
  name: "Breadcrumb longo",
  args: {
    title: "Cadastro de empresa",
    breadcrumb: [
      { label: "Configurações" },
      { label: "Empresas", to: "/app/admin/tenants" },
      { label: "Nova empresa" },
    ],
  },
};
