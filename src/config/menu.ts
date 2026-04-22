import type { MenuItem, SidebarItem } from "@/types/config";
import {
  DashboardIcon,
  DashboardActiveIcon,
  UserIcon,
  UserIconActive,
  ManagementIcon,
  ManagementIconActive,
} from "@/assets/images";

// Role constants
export const ROLES = {
  SUPER_ADMIN: "Admin",
  CLUB_ADMIN: "ClubAdmin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Single source of truth for all menu items
export const MENU_ITEMS: Record<string, MenuItem> = {
  dashboard: {
    title: "Dashboard",
    path: "/",
    icon: DashboardIcon,
    activeIcon: DashboardActiveIcon,
    roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
  },
  Users: {
    title: "Users.title",
    path: "/pages/users",
    icon: UserIcon,
    activeIcon: UserIconActive,
    roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
  },
  Management: {
    title: "Management.title",
    path: "#",
    icon: ManagementIcon,
    activeIcon: ManagementIconActive,
    roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
    children: [
      {
        title: "Management.federations.title",
        path: "/pages/federation",
        roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
      },
      {
        title: "Management.suppliers.title",
        path: "/pages/supplier",
        roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
      },
      {
        title: "Management.ageCategories.title",
        path: "/pages/ageCategory",
        roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
      },
      {
        title: "Management.teams.title",
        path: "/pages/team",
        roles: [ROLES.SUPER_ADMIN, ROLES.CLUB_ADMIN],
      },
    ],
  },
};

// Re-export SidebarItem from types
export type { SidebarItem } from "@/types/config";

// Helper function to get the sidebar for a role
export const getSidebarForRole = (userRole: Role): SidebarItem[] => {
  return Object.values(MENU_ITEMS)
    .filter((item) => item.roles.includes(userRole))
    .map((item) => ({
      title: item.title,
      path: item.path,
      ...(item.icon && { icon: item.icon }),
      ...(item.activeIcon && { activeIcon: item.activeIcon }),
      children: item.children
        ?.filter((child) => child.roles.includes(userRole))
        .map((child) => ({
          title: child.title,
          path: child.path,
          ...(child.icon && { icon: child.icon }),
          ...(child.activeIcon && { activeIcon: child.activeIcon }),
        })),
      isExpanded: false,
    }));
};
