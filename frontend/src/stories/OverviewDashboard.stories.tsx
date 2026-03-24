import type { Meta, StoryObj } from "@storybook/react";
import { OverviewDashboard } from "@/components/screens/dashboard/OverviewDashboard";
import { useAuthStore } from "@/stores/auth.store";

const meta = {
  title: "Screens/Dashboards/OverviewDashboard",
  component: OverviewDashboard,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      useAuthStore.setState({
        token: "storybook-token",
        user: {
          id: "storybook-user",
          email: "maria.silva@asgardai.com.br",
          role: "asgard_employee",
          permissions: ["*"],
          features: ["*"],
          tenantId: "master",
        },
        permissions: ["*"],
        features: ["*"],
        isAuthenticated: true,
      });
      return <Story />;
    },
  ],
} satisfies Meta<typeof OverviewDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Visão geral como em produção (sem métricas fictícias). */
export const Default: Story = {
  args: { showDemoMetrics: false },
};

/** Cartões de exemplo — dados apenas para Storybook. */
export const WithDemoMetrics: Story = {
  args: { showDemoMetrics: true },
};
