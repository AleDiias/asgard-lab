import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Mail, Download, Trash2, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "Variante visual do botão",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "Tamanho do botão",
    },
    disabled: {
      control: "boolean",
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Botão",
    variant: "default",
  },
};

export const Destructive: Story = {
  args: {
    children: "Excluir",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Secundário",
    variant: "outline",
  },
};

export const Secondary: Story = {
  args: {
    children: "Ação secundária",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
};

export const Small: Story = {
  args: {
    children: "Pequeno",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Grande",
    size: "lg",
  },
};

export const Disabled: Story = {
  args: {
    children: "Desabilitado",
    disabled: true,
  },
};

export const WithIconLeft: Story = {
  args: {
    children: (
      <>
        <Mail className="h-4 w-4" />
        Enviar email
      </>
    ),
    variant: "default",
  },
};

export const WithIconRight: Story = {
  args: {
    children: (
      <>
        Download
        <Download className="h-4 w-4" />
      </>
    ),
    variant: "default",
  },
};

export const WithIconSecondary: Story = {
  args: {
    children: (
      <>
        <Trash2 className="h-4 w-4" />
        Excluir
      </>
    ),
    variant: "secondary",
  },
};

export const WithIconOutline: Story = {
  args: {
    children: (
      <>
        <Plus className="h-4 w-4" />
        Adicionar
      </>
    ),
    variant: "outline",
  },
};

export const IconOnly: Story = {
  args: {
    children: <Mail className="h-4 w-4" />,
    size: "icon",
    variant: "default",
    "aria-label": "Enviar email",
  },
};

export const IconOnlySecondary: Story = {
  args: {
    children: <Trash2 className="h-4 w-4" />,
    size: "icon",
    variant: "secondary",
    "aria-label": "Excluir",
  },
};

export const WithIconAndArrow: Story = {
  args: {
    children: (
      <>
        Continuar
        <ArrowRight className="h-4 w-4" />
      </>
    ),
    variant: "default",
  },
};
