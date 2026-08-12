import {
  Bell,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Settings,
  UserRound,
  WalletCards,
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