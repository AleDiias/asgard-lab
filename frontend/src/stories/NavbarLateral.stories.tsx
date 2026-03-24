import type { Meta, StoryObj } from "@storybook/react";
import { SidebarProvider } from "@/components/ui";
import {
  NavbarLateral,
  defaultNavbarLogo,
  defaultNavbarMenuItems,
  defaultNavbarUser,
} from "@/components/screens";

const meta = {
  title: "Screens/Navbar/NavbarLateral",
  component: NavbarLateral,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof NavbarLateral>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logo: defaultNavbarLogo,
    menuItems: defaultNavbarMenuItems,
    user: defaultNavbarUser,
    onLogout: () => {},
  },
};

export const SemAvatarUrl: Story = {
  args: {
    logo: defaultNavbarLogo,
    menuItems: defaultNavbarMenuItems,
    user: { name: "João Santos", avatarUrl: null },
    onLogout: () => {},
  },
};
