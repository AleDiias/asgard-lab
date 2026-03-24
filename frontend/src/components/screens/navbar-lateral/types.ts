import type { ReactNode } from "react";

export interface NavbarLateralMenuItemLink {
  label: string;
  to?: string;
  href?: string;
  icon?: ReactNode;
  children?: never;
}

export interface NavbarLateralMenuItemCascade {
  label: string;
  icon?: ReactNode;
  children: NavbarLateralMenuSubItem[];
  to?: never;
  href?: never;
}

export type NavbarLateralMenuSubItem = {
  label: string;
  to?: string;
  href?: string;
};

export interface NavbarMenuRouteLink {
  label: string;
  to?: string;
  href?: string;
  children?: never;
}

export interface NavbarMenuRouteCascade {
  label: string;
  children: NavbarLateralMenuSubItem[];
  to?: never;
  href?: never;
}

export type NavbarMenuRoute = NavbarMenuRouteLink | NavbarMenuRouteCascade;

export type NavbarLateralMenuItem = NavbarLateralMenuItemLink | NavbarLateralMenuItemCascade;

export function isCascadeItem(
  item: NavbarLateralMenuItem,
): item is NavbarLateralMenuItemCascade {
  return "children" in item && Array.isArray(item.children);
}

export interface NavbarLateralUser {
  name: string;
  avatarUrl?: string | null;
}

export interface NavbarLateralProps {
  logo: ReactNode;
  menuItems: NavbarLateralMenuItem[];
  user: NavbarLateralUser;
  onLogout?: () => void;
}
