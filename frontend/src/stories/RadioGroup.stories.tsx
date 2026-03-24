import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const defaultOptions = [
  { value: "option1", id: "option1", label: "Opção 1" },
  { value: "option2", id: "option2", label: "Opção 2" },
  { value: "option3", id: "option3", label: "Opção 3" },
];

const disabledOptions = [
  { value: "a", id: "ra", label: "Desabilitado A" },
  { value: "b", id: "rb", label: "Desabilitado B" },
];

const defaultRadioChildren = (
  <>
    {defaultOptions.map((opt) => (
      <div key={opt.id} className="flex items-center space-x-2">
        <RadioGroupItem value={opt.value} id={opt.id} />
        <Label htmlFor={opt.id}>{opt.label}</Label>
      </div>
    ))}
  </>
);

const disabledRadioChildren = (
  <>
    {disabledOptions.map((opt) => (
      <div key={opt.id} className="flex items-center space-x-2">
        <RadioGroupItem value={opt.value} id={opt.id} />
        <Label htmlFor={opt.id}>{opt.label}</Label>
      </div>
    ))}
  </>
);

// ——— Stories ———
export const Default: Story = {
  args: {
    defaultValue: "option1",
    children: defaultRadioChildren,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "a",
    disabled: true,
    children: disabledRadioChildren,
  },
};
