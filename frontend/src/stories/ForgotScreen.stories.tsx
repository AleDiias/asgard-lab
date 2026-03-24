import type { Meta, StoryObj } from "@storybook/react";
import "@/locales/i18n";
import { Forgot } from "@/components/screens/auth";

const meta = {
  title: "Screens/Auth/Forgot Password",
  component: Forgot,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Forgot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
