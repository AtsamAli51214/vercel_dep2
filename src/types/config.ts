// Config-related types

import type { Role } from "@/config/menu";

export type TFunction = (key: string, values?: Record<string, any>) => string;

export interface MenuItem {
  title: string;
  path: string;
  icon?: string;
  activeIcon?: string;
  roles: Role[];
  children?: MenuItem[];
}

export interface SidebarItem {
  title: string;
  path: string;
  icon?: string;
  activeIcon?: string;
  children?: SidebarItem[];
  isExpanded?: boolean;
}
