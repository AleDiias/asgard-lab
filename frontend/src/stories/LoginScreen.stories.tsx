import type { Meta, StoryObj } from "@storybook/react";
import "@/locales/i18n";
import { Login } from "@/components/screens/auth";

const meta = {
  title: "Screens/Auth/Login",
  component: Login,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Login>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: () => {},
    isLoading: false,
    error: null,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    error: "Credenciais inválidas.",
  },
};
