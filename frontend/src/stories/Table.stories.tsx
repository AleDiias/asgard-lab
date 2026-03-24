import type { Meta, StoryObj } from "@storybook/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

const meta = {
  title: "UI/Table",
  component: Table,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    separators: {
      control: "boolean",
      description: "Exibe bordas verticais entre colunas (default: true)",
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// ——— Mocks ———
const mockUsers = [
  { name: "Maria Silva", email: "maria@exemplo.com" },
  { name: "João Santos", email: "joao@exemplo.com" },
  { name: "Ana Costa", email: "ana@exemplo.com" },
];

const defaultTableChildren = (
  <>
    <TableCaption>Lista de usuários</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Nome</TableHead>
        <TableHead>Email</TableHead>
        <TableHead className="text-right">Ações</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {mockUsers.map((user) => (
        <TableRow key={user.name}>
          <TableCell>{user.name}</TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell className="text-right">Editar</TableCell>
        </TableRow>
      ))}
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell colSpan={2}>Total</TableCell>
        <TableCell className="text-right">{mockUsers.length} registros</TableCell>
      </TableRow>
    </TableFooter>
  </>
);

const simpleTableChildren = (
  <>
    <TableHeader>
      <TableRow>
        <TableHead>Item</TableHead>
        <TableHead>Valor</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Quantidade</TableCell>
        <TableCell>10</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Total</TableCell>
        <TableCell>R$ 150,00</TableCell>
      </TableRow>
    </TableBody>
  </>
);

const statusTableChildren = (
  <>
    <TableHeader>
      <TableRow>
        <TableHead>Nome</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Item A</TableCell>
        <TableCell>Ativo</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Item B</TableCell>
        <TableCell>Pendente</TableCell>
      </TableRow>
    </TableBody>
  </>
);

// ——— Stories ———
export const Default: Story = {
  args: {
    children: defaultTableChildren,
  },
};

export const Simple: Story = {
  args: {
    children: simpleTableChildren,
  },
};

export const SemSeparadoresVerticais: Story = {
  args: {
    separators: false,
    children: statusTableChildren,
  },
};
