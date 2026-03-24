import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { onCheckedChange: fn() },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const withLabelDecorator = (Story: React.ComponentType) => (
  <div className="flex items-center space-x-2">
    <Story />
    <Label htmlFor="terms">Aceitar termos e condições</Label>
  </div>
);

// ——— Stories ———
export const Unchecked: Story = {
  args: { checked: false },
};

export const Checked: Story = {
  args: { checked: true },
};

export const Disabled: Story = {
  args: { disabled: true, checked: false },
};

export const WithLabel: Story = {
  args: {
    id: "terms",
  },
  decorators: [withLabelDecorator],
};
