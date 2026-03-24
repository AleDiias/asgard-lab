import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea } from "@/components/ui/scroll-area";

const meta = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const longText =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const defaultScrollAreaChildren = (
  <p className="text-sm text-muted-foreground">{longText}</p>
);

// ——— Stories ———
export const Default: Story = {
  args: {
    className: "h-[200px] w-[300px] rounded-md border p-4",
    children: defaultScrollAreaChildren,
  },
};
