import type { Meta, StoryObj } from "@storybook/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Popover",
  component: Popover,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const defaultPopoverChildren = (
  <>
    <PopoverTrigger asChild>
      <Button variant="outline">Abrir popover</Button>
    </PopoverTrigger>
    <PopoverContent>
      <div className="grid gap-2">
        <h4 className="font-medium leading-none">Título</h4>
        <p className="text-sm text-muted-foreground">
          Conteúdo do popover. Pode incluir texto, links ou formulários.
        </p>
      </div>
    </PopoverContent>
  </>
);

// ——— Stories ———
export const Default: Story = {
  args: {
    children: defaultPopoverChildren,
  },
};
