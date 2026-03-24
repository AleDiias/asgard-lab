import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "w-[350px]",
    children: (
      <>
        <CardHeader>
          <CardTitle>Título do card</CardTitle>
          <CardDescription>Descrição breve do conteúdo do card.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Conteúdo principal do card. Pode incluir texto, listas ou outros componentes.</p>
        </CardContent>
        <CardFooter>
          <Button>Confirmar</Button>
        </CardFooter>
      </>
    ),
  },
};

export const OnlyContent: Story = {
  args: {
    className: "w-[350px]",
    children: (
      <CardContent>
        <p>Card apenas com conteúdo, sem cabeçalho nem rodapé.</p>
      </CardContent>
    ),
  },
};

export const WithActions: Story = {
  args: {
    className: "w-[350px]",
    children: (
      <>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>Altere as preferências da sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Formulários ou opções podem ser exibidos aqui.</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar</Button>
        </CardFooter>
      </>
    ),
  },
};
