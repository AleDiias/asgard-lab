import type { Meta, StoryObj } from "@storybook/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const defaultTooltipChildren = (
  <>
    <TooltipTrigger asChild>
      <Button variant="outline">Passar o mouse</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Texto do tooltip</p>
    </TooltipContent>
  </>
);

const topTooltipChildren = (
  <>
    <TooltipTrigger asChild>
      <Button variant="secondary">Tooltip acima</Button>
    </TooltipTrigger>
    <TooltipContent side="top">
      <p>Aparece acima do botão</p>
    </TooltipContent>
  </>
);

// ——— Stories ———
export const Default: Story = {
  args: {
    children: defaultTooltipChildren,
  },
};

export const Top: Story = {
  args: {
    children: topTooltipChildren,
  },
};
