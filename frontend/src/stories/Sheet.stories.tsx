import type { Meta, StoryObj } from "@storybook/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Sheet",
  component: Sheet,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const rightSheetChildren = (
  <>
    <SheetTrigger asChild>
      <Button variant="outline">Abrir painel</Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Título do painel</SheetTitle>
        <SheetDescription>
          Descrição opcional do conteúdo do painel lateral.
        </SheetDescription>
      </SheetHeader>
      <p className="text-sm text-muted-foreground py-4">
        Conteúdo do sheet aqui.
      </p>
    </SheetContent>
  </>
);

// ——— Stories ———
export const Right: Story = {
  args: {
    children: rightSheetChildren,
  },
};
