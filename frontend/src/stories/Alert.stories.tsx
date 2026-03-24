import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const meta = {
  title: "UI/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["danger", "success", "warning", "info"],
      description: "Variante do alerta",
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Danger: Story = {
  args: {
    variant: "danger",
    children: (
      <>
        <AlertTitle>Senha inválida</AlertTitle>
        <AlertDescription>
          Senha deve conter ao menos 8 caracteres, incluindo letras e números.
        </AlertDescription>
      </>
    ),
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: (
      <>
        <AlertTitle>Email verificado</AlertTitle>
        <AlertDescription>
          Email verificado com sucesso. Você já pode acessar todos os recursos.
        </AlertDescription>
      </>
    ),
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: (
      <>
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>
          Certifique-se de revisar todas as informações antes de prosseguir.
        </AlertDescription>
      </>
    ),
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    children: (
      <>
        <AlertTitle>Informação</AlertTitle>
        <AlertDescription>
          Relatórios em tempo real disponíveis para gestores.
        </AlertDescription>
      </>
    ),
  },
};
