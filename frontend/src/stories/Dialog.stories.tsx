import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const defaultDialogChildren = (
  <>
    <DialogTrigger asChild>
      <Button variant="outline">Abrir diálogo</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Título do diálogo</DialogTitle>
        <DialogDescription>
          Descrição opcional. O usuário pode fechar clicando fora ou no botão de fechar.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="submit">Confirmar</Button>
      </DialogFooter>
    </DialogContent>
  </>
);

// ——— Stories ———
export const Default: Story = {
  args: {
    children: defaultDialogChildren,
  },
};
