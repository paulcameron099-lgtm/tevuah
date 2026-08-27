import {
  BadgeCheck,
  Bell,
  BarChart3,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
  ClipboardCheck,
  Landmark,
  HandCoins,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const investorDashboardNavigation: DashboardNavigationItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Investor Onboarding",
    href: "/dashboard/onboarding",
    icon: BadgeCheck,
  },

  {
    label: "My Investments",
    href: "/dashboard/investments",
    icon: BriefcaseBusiness,
  },

  {
    label: "Portfolio",
    href: "/dashboard/portfolio",
    icon: WalletCards,
  },

    {
    label: "Distributions",
    href: "/dashboard/distributions",
    icon: HandCoins,
  },
  {
  label: "Statements",
  href: "/dashboard/statements",
  icon: FileText,
},

  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
  },

  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },

  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: UserRound,
  },

  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export const adminDashboardNavigation: DashboardNavigationItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Compliance",
    href: "/admin/compliance",
    icon: ShieldCheck,
  },

  {
    label: "Investors",
    href: "/admin/investors",
    icon: Users,
  },

    {
    label: "Opportunities",
    href: "/admin/opportunities",
    icon: BriefcaseBusiness,
  },

  {
  label: "Subscriptions",
  href: "/admin/subscriptions",
  icon: ClipboardCheck,
  },

  {
  label: "Payments",
  href: "/admin/payments",
  icon: Landmark,
},
{
  label: "Positions",
  href: "/admin/positions",
  icon: WalletCards,
},

{
  label: "Valuations",
  href: "/admin/valuations",
  icon: BarChart3,
},

{
  label: "Distributions",
  href: "/admin/distributions",
  icon: HandCoins,
},

{
  label: "Statements",
  href: "/admin/statements",
  icon: FileText,
},

  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },

  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: UserRound,
  },

  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export const superAdminDashboardNavigation: DashboardNavigationItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Compliance",
    href: "/admin/compliance",
    icon: ShieldCheck,
  },

  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },

  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
  },

  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },

  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: UserRound,
  },

  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];