import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
      description: "Variante visual do badge",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "small (18px altura) · medium (23px, min. 49×23) · large (28px)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
    size: "md",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secundário",
    variant: "secondary",
    size: "md",
  },
};

export const Destructive: Story = {
  args: {
    children: "Erro",
    variant: "destructive",
    size: "md",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
    size: "md",
  },
};

export const Small: Story = {
  args: {
    children: "Small",
    variant: "secondary",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    children: "Medium",
    variant: "secondary",
    size: "md",
  },
};

export const Large: Story = {
  args: {
    children: "Large",
    variant: "secondary",
    size: "lg",
  },
};
