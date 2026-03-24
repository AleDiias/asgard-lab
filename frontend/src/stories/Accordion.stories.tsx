import type { Meta, StoryObj } from "@storybook/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const meta = {
  title: "UI/Accordion",
  component: Accordion,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const accordionItems = [
  {
    value: "item-1",
    trigger: "É acessível?",
    content: "Sim. Usa componentes Radix UI que seguem as práticas de acessibilidade.",
  },
  {
    value: "item-2",
    trigger: "É estilizável?",
    content: "Sim. Você pode estilizar com Tailwind ou className.",
  },
  {
    value: "item-3",
    trigger: "Múltiplos itens abertos?",
    content: 'Use type="multiple" no Accordion para permitir vários itens abertos ao mesmo tempo.',
  },
];

const defaultAccordionChildren = (
  <>
    {accordionItems.map((item) => (
      <AccordionItem key={item.value} value={item.value}>
        <AccordionTrigger>{item.trigger}</AccordionTrigger>
        <AccordionContent>{item.content}</AccordionContent>
      </AccordionItem>
    ))}
  </>
);

// ——— Stories ———
export const Default: Story = {
  args: {
    type: "single",
    collapsible: true,
    className: "w-[350px]",
    children: defaultAccordionChildren,
  },
};
