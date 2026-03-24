import * as React from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui";
import { NavLink } from "@/components/ui/nav-link";
import {
  type NavbarLateralProps,
  isCascadeItem,
} from "./types";

const ACTIVE_MENU_CLASS =
  "!bg-sidebar-primary !font-medium !text-sidebar-primary-foreground";

export function NavbarLateral({
  logo,
  menuItems,
  user,
  onLogout,
}: NavbarLateralProps) {
  const location = useLocation();
  const [openCascadeLabel, setOpenCascadeLabel] = React.useState<string | null>(
    null,
  );
  const [closedCascadeLabel, setClosedCascadeLabel] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    setClosedCascadeLabel(null);
  }, [location.pathname]);

  const handleCascadeOpenChange = React.useCallback(
    (open: boolean, label: string) => {
      if (open) {
        setOpenCascadeLabel(label);
        setClosedCascadeLabel((prev) => (prev === label ? null : prev));
      } else {
        setOpenCascadeLabel(null);
        setClosedCascadeLabel(label);
      }
    },
    [],
  );

  const initials = user.name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar side="left">
      <SidebarHeader className="p-3">
        {logo}
      </SidebarHeader>

      <SidebarSeparator className="bg-sidebar-border" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) =>
              isCascadeItem(item) ? (
                <CollapsibleMenuItem
                  key={item.label}
                  item={item}
                  currentPath={location.pathname}
                  openCascadeLabel={openCascadeLabel}
                  closedCascadeLabel={closedCascadeLabel}
                  onOpenCascadeChange={handleCascadeOpenChange}
                />
              ) : (
                <LinkMenuItem key={item.label} item={item} />
              ),
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="bg-sidebar-border" />

      <SidebarFooter className="p-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-[5px] p-2">
            <Avatar className="h-9 w-9 shrink-0">
              {user.avatarUrl && (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              )}
              <AvatarFallback className="text-xs bg-sidebar-accent text-sidebar-accent-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {user.name}
            </span>
          </div>
          {onLogout && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sair
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function LinkMenuItem({
  item,
}: {
  item: { label: string; to?: string; href?: string; icon?: React.ReactNode };
}) {
  const content = (
    <>
      {item.icon}
      <span>{item.label}</span>
    </>
  );

  if (item.to) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.to}
            end
            activeClassName={ACTIVE_MENU_CLASS}
          >
            {content}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (item.href) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href={item.href} target="_blank" rel="noopener noreferrer">
            {content}
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return null;
}

function CollapsibleMenuItem({
  item,
  currentPath,
  openCascadeLabel,
  closedCascadeLabel,
  onOpenCascadeChange,
}: {
  item: {
    label: string;
    icon?: React.ReactNode;
    children: Array<{ label: string; to?: string; href?: string }>;
  };
  currentPath: string;
  openCascadeLabel: string | null;
  closedCascadeLabel: string | null;
  onOpenCascadeChange: (open: boolean, label: string) => void;
}) {
  const hasActiveChild = item.children.some((c) => c.to === currentPath);
  const wasExplicitlyClosed = closedCascadeLabel === item.label;
  const isOpen =
    openCascadeLabel === item.label ||
    (openCascadeLabel === null && !wasExplicitlyClosed && hasActiveChild);

  return (
    <Collapsible
      asChild
      open={isOpen}
      onOpenChange={(open) => onOpenCascadeChange(open, item.label)}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            data-active={hasActiveChild}
            className="[&>svg:last-child]:size-4 [&>svg:last-child]:shrink-0 [&>svg:last-child]:transition-transform data-[state=open]:[&>svg:last-child]:rotate-180 data-[active=true]:!bg-sidebar-primary data-[active=true]:!font-medium data-[active=true]:!text-sidebar-primary-foreground"
          >
            {item.icon}
            <span>{item.label}</span>
            <ChevronDown />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map((sub) => (
              <SidebarMenuSubItem key={sub.label}>
                {sub.to ? (
                  <SidebarMenuSubButton asChild>
                    <NavLink
                      to={sub.to}
                      end
                      activeClassName={ACTIVE_MENU_CLASS}
                    >
                      <span>{sub.label}</span>
                    </NavLink>
                  </SidebarMenuSubButton>
                ) : sub.href ? (
                  <SidebarMenuSubButton asChild>
                    <a href={sub.href} target="_blank" rel="noopener noreferrer">
                      <span>{sub.label}</span>
                    </a>
                  </SidebarMenuSubButton>
                ) : null}
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

NavbarLateral.displayName = "NavbarLateral";
