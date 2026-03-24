import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { NavLink } from "@/components/ui/nav-link";

const meta = {
  title: "UI/NavLink",
  component: NavLink,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <nav className="flex gap-4">
          <Story />
        </nav>
      </MemoryRouter>
    ),
  ],
  argTypes: {
    to: { control: "text" },
    activeClassName: { control: "text" },
  },
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const navLinks = [
  { to: "/", label: "Início" },
  { to: "/about", label: "Sobre" },
  { to: "/contact", label: "Contato" },
];

const activeClassName = "font-semibold text-primary";

// ——— Stories ———
export const Default: Story = {
  args: {
    to: "/",
    children: "Início",
    activeClassName,
  },
};

export const MultipleLinks: Story = {
  decorators: [
    () => (
      <MemoryRouter>
        <nav className="flex gap-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              activeClassName={activeClassName}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </MemoryRouter>
    ),
  ],
};
