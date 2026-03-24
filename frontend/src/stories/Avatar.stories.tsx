import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const withImageChildren = (
  <>
    <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
    <AvatarFallback>CN</AvatarFallback>
  </>
);

const fallbackTwoLettersChildren = <AvatarFallback>JD</AvatarFallback>;

const fallbackOnlyChildren = (
  <>
    <AvatarFallback>AB</AvatarFallback>
  </>
);

// ——— Stories ———
export const WithImage: Story = {
  args: {
    children: withImageChildren,
  },
};

export const FallbackOnly: Story = {
  args: {
    children: fallbackOnlyChildren,
  },
};

export const FallbackTwoLetters: Story = {
  args: {
    children: fallbackTwoLettersChildren,
  },
};

export const Sizes: Story = {
  decorators: [
    () => (
      <div className="flex items-center gap-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>MD</AvatarFallback>
        </Avatar>
        <Avatar className="h-16 w-16">
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
      </div>
    ),
  ],
};
