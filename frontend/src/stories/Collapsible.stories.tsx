import type { Meta, StoryObj } from "@storybook/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Collapsible",
  component: Collapsible,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const defaultCollapsibleChildren = (
  <>
    <div className="flex items-center justify-between space-x-4">
      <h4 className="text-sm font-semibold">Conteúdo recolhível</h4>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="icon">
          Expandir
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent>
      <p className="text-sm text-muted-foreground pt-2">
        Este conteúdo pode ser expandido ou recolhido clicando no botão.
      </p>
    </CollapsibleContent>
  </>
);

// ——— Stories ———
export const Default: Story = {
  args: {
    className: "w-[350px]",
    children: defaultCollapsibleChildren,
  },
};
