import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Apple,
  Dumbbell,
  Brain,
  Moon,
  Target,
  TrendingUp,
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
      { title: "Skincare", url: "/dashboard/skincare", icon: Sparkles },
      { title: "Nutrition", url: "/dashboard/nutrition", icon: Apple },
      { title: "Fitness", url: "/dashboard/fitness", icon: Dumbbell },
      { title: "Mental Health", url: "/dashboard/mental", icon: Brain },
      { title: "Sleep", url: "/dashboard/sleep", icon: Moon },
      { title: "Habits", url: "/dashboard/habits", icon: Target },
    ],
  },
  {
    label: "Tracking",
    items: [
      { title: "Progress", url: "/dashboard/progress", icon: TrendingUp },
    ],
  },
];

export const sidebarFooterNav: NavItem[] = [
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];
