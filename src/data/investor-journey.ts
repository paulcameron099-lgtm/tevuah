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
    title: "Speak with our team",
    description:
      "Contact Tevuah Reserve to discuss your investment interests, objectives and available opportunities with an Investment Specialist.",
    icon: ShieldCheck,
  },
  {
    number: "02",
    title: "Explore opportunities",
    description:
      "Review the underlying asset, investment structure, supporting documents, risk information, financial terms and project timeline.",
    icon: FileSearch,
  },
  {
    number: "03",
    title: "Complete investor onboarding",
    description:
      "Our team coordinates your account setup and required verification before guiding you through the commitment and funding process.",
    icon: WalletCards,
  },
  {
    number: "04",
    title: "Follow your investment",
    description:
      "Access relevant portfolio reports, asset updates, operational milestones, investment documents and distribution information through your investor account, as applicable.",
    icon: BarChart3,
  },
];