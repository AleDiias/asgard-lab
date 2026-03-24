import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search"],
      description: "Tipo do input",
    },
    disabled: {
      control: "boolean",
    },
    placeholder: {
      control: "text",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Digite aqui...",
  },
};

export const WithValue: Story = {
  args: {
    placeholder: "Email",
    defaultValue: "usuario@exemplo.com",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Senha",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Campo desabilitado",
    disabled: true,
  },
};

export const WithLabel: Story = {
  args: {
    id: "email",
    type: "email",
    placeholder: "email@exemplo.com",
  },
  decorators: [
    (Story) => (
      <div className="grid w-full max-w-sm items-center gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Story />
      </div>
    ),
  ],
};
