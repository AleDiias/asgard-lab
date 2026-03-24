import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const meta = {
  title: "UI/Label",
  component: Label,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const withInputDecorator = (Story: React.ComponentType) => (
  <div className="grid w-full max-w-sm items-center gap-2">
    <Story />
    <Input id="email" type="email" placeholder="email@exemplo.com" />
  </div>
);

// ——— Stories ———
export const Default: Story = {
  args: {
    children: "Nome do campo",
  },
};

export const WithInput: Story = {
  args: {
    htmlFor: "email",
    children: "Email",
  },
  decorators: [withInputDecorator],
};
