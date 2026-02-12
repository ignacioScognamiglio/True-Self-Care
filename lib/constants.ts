import {
  LayoutDashboard,
  MessageSquare,
  Apple,
  Dumbbell,
  Moon,
  Target,
  TrendingUp,
  Trophy,
  Settings,
} from "lucide-react";

export const APP_NAME = "True Self-Care";
export const APP_DESCRIPTION = "Your AI-powered personal wellness companion";

export type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const sidebarNavigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Home", url: "/dashboard", icon: LayoutDashboard },
      { title: "AI Chat", url: "/dashboard/chat", icon: MessageSquare },
    ],
  },
  {
    label: "Wellness Modules",
    items: [
      { title: "Nutrition", url: "/dashboard/nutrition", icon: Apple },
      { title: "Fitness", url: "/dashboard/fitness", icon: Dumbbell },
      { title: "Sleep", url: "/dashboard/sleep", icon: Moon },
      { title: "Habits", url: "/dashboard/habits", icon: Target },
    ],
  },
  {
    label: "Tracking",
    items: [
      { title: "Progress", url: "/dashboard/progress", icon: TrendingUp },
      { title: "Gamificacion", url: "/dashboard/gamification", icon: Trophy },
    ],
  },
];

export const sidebarFooterNav: NavItem[] = [
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

/** All navigation items flattened from groups and footer. */
export const allNavItems: NavItem[] = [
  ...sidebarNavigation.flatMap((group) => group.items),
  ...sidebarFooterNav,
];

/** Check whether a nav item is active for the given pathname. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (pathname === item.url) return true;
  if (item.url === "/dashboard") return false;
  return pathname.startsWith(item.url);
}

/** Resolve the page title from a pathname using the navigation config. */
export function getPageTitle(pathname: string): string {
  const match = allNavItems.find((item) => isNavItemActive(item, pathname));
  return match?.title ?? "Dashboard";
}
