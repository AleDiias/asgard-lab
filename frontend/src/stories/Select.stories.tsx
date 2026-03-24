import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const themeOptions = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "system", label: "Sistema" },
];

const countryOptions = [
  { value: "br", label: "Brasil" },
  { value: "pt", label: "Portugal" },
  { value: "es", label: "Espanha" },
];

const defaultSelectChildren = (
  <>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Selecione um tema" />
    </SelectTrigger>
    <SelectContent>
      {themeOptions.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </SelectContent>
  </>
);

const countrySelectChildren = (
  <>
    <SelectTrigger>
      <SelectValue placeholder="Escolha o país" />
    </SelectTrigger>
    <SelectContent>
      {countryOptions.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </SelectContent>
  </>
);

// ——— Stories ———
export const Default: Story = {
  args: {
    children: defaultSelectChildren,
  },
};

export const WithLabel: Story = {
  args: {
    children: countrySelectChildren,
  },
  decorators: [
    (Story) => (
      <div className="grid w-full max-w-sm items-center gap-2">
        <label className="text-sm font-medium">País</label>
        <Story />
      </div>
    ),
  ],
};
