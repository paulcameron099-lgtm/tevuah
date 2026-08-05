import {
  BarChart3,
  FileSearch,
  ShieldCheck,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export type InvestorJourneyStep = {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const investorJourneySteps: InvestorJourneyStep[] = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Register securely and complete the required investor profile, identity and eligibility checks.",
    icon: ShieldCheck,
  },
  {
    number: "02",
    title: "Explore opportunities",
    description:
      "Review the estate, investment structure, supporting documents, risk information and project timeline.",
    icon: FileSearch,
  },
  {
    number: "03",
    title: "Make a commitment",
    description:
      "Select an opportunity, review the relevant agreements and complete the investment commitment process.",
    icon: WalletCards,
  },
  {
    number: "04",
    title: "Follow its progress",
    description:
      "Track reports, estate milestones, operational data, portfolio activity and future distributions.",
    icon: BarChart3,
  },
];