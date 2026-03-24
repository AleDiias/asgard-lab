import type { Meta, StoryObj } from "@storybook/react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const meta = {
  title: "UI/AspectRatio",
  component: AspectRatio,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    ratio: {
      control: "number",
      description: "Proporção (ex: 16/9)",
    },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const placeholderContent = (
  <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
    16:9
  </div>
);

const squarePlaceholderContent = (
  <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
    1:1
  </div>
);

const imageContent = (
  <img
    src="https://images.unsplash.com/photo-1588345921523-c2dcdbd7a719?w=800&dpr=2"
    alt="Placeholder"
    className="h-full w-full object-cover"
  />
);

// ——— Stories ———
export const Video16x9: Story = {
  args: {
    ratio: 16 / 9,
    className: "w-[400px] overflow-hidden rounded-md border bg-muted",
    children: placeholderContent,
  },
};

export const Square: Story = {
  args: {
    ratio: 1,
    className: "w-[200px] overflow-hidden rounded-md border bg-muted",
    children: squarePlaceholderContent,
  },
};

export const WithImage: Story = {
  args: {
    ratio: 16 / 9,
    className: "w-[400px] overflow-hidden rounded-md border",
    children: imageContent,
  },
};
