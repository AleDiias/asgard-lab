import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const defaultTabsChildren = (
  <>
    <TabsList>
      <TabsTrigger value="tab1">Conta</TabsTrigger>
      <TabsTrigger value="tab2">Senha</TabsTrigger>
      <TabsTrigger value="tab3">Avançado</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">
      <p className="text-sm text-muted-foreground">
        Altere as configurações da sua conta aqui.
      </p>
    </TabsContent>
    <TabsContent value="tab2">
      <p className="text-sm text-muted-foreground">
        Altere sua senha e opções de segurança.
      </p>
    </TabsContent>
    <TabsContent value="tab3">
      <p className="text-sm text-muted-foreground">
        Configurações avançadas do sistema.
      </p>
    </TabsContent>
  </>
);

// ——— Stories ———
export const Default: Story = {
  args: {
    defaultValue: "tab1",
    className: "w-[400px]",
    children: defaultTabsChildren,
  },
};
