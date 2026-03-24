import type { Meta, StoryObj } from "@storybook/react";
import "@/locales/i18n";
import { ResetPassword } from "@/components/screens/auth";

const meta = {
  title: "Screens/Auth/Reset Password",
  component: ResetPassword,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ResetPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
