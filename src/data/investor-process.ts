import {
  BadgeCheck,
  BarChart3,
  CreditCard,
  FileSearch,
  Landmark,
  Search,
  ShieldCheck,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react";

export type InvestorProcessStep = {
  id: string;
  number: string;
  title: string;
  description: string;
  details: string[];
  icon: LucideIcon;
};

export type InvestorRequirement = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const investorProcessSteps: InvestorProcessStep[] = [
  {
    id: "discover",
    number: "01",
    title: "Discover opportunities",
    description:
      "Explore opportunities across vineyards, olive estates, AgTech and fine wine.",
    details: [
      "Browse by asset category",
      "Compare locations and investment minimums",
      "Review illustrative duration and risk information",
    ],
    icon: Search,
  },
  {
    id: "create-account",
    number: "02",
    title: "Create your account",
    description:
      "Register for secure investor access and begin building your investor profile.",
    details: [
      "Email and password registration",
      "Personal profile information",
      "Account security setup",
    ],
    icon: UserRoundPlus,
  },
  {
    id: "verification",
    number: "03",
    title: "Complete investor verification",
    description:
      "Provide the information required for identity, eligibility and compliance checks.",
    details: [
      "Identity verification",
      "Address verification",
      "Investor classification",
      "Source-of-funds information where required",
    ],
    icon: ShieldCheck,
  },
  {
    id: "review",
    number: "04",
    title: "Review an opportunity",
    description:
      "Study the asset, structure, documents, assumptions, fees and material risks.",
    details: [
      "Opportunity overview",
      "Financial assumptions",
      "Risk factors",
      "Documents and timeline",
    ],
    icon: FileSearch,
  },
  {
    id: "commit",
    number: "05",
    title: "Make a commitment",
    description:
      "Choose an investment amount and complete the required agreement process.",
    details: [
      "Select investment amount",
      "Review legal terms",
      "Accept required declarations",
      "Submit commitment",
    ],
    icon: BadgeCheck,
  },
  {
    id: "funding",
    number: "06",
    title: "Fund the commitment",
    description:
      "Complete payment through an approved funding method once all requirements are satisfied.",
    details: [
      "Funding instructions",
      "Payment reference",
      "Payment confirmation",
      "Reconciliation",
    ],
    icon: CreditCard,
  },
  {
    id: "monitor",
    number: "07",
    title: "Monitor your portfolio",
    description:
      "Follow investments, estate activity, valuations and project milestones from the dashboard.",
    details: [
      "Portfolio overview",
      "Investment activity",
      "Estate updates",
      "Documents and reports",
    ],
    icon: BarChart3,
  },
  {
    id: "reporting",
    number: "08",
    title: "Receive reports and distributions",
    description:
      "Review periodic reports and any distributions associated with your investments.",
    details: [
      "Investor statements",
      "Project reports",
      "Distribution records",
      "Tax documents where applicable",
    ],
    icon: Landmark,
  },
];

export const investorRequirements: InvestorRequirement[] = [
  {
    id: "identity",
    title: "Identity verification",
    description:
      "A valid identity document and other supporting information may be required.",
    icon: ShieldCheck,
  },
  {
    id: "eligibility",
    title: "Investor eligibility",
    description:
      "Access to specific opportunities may depend on investor classification and jurisdiction.",
    icon: BadgeCheck,
  },
  {
    id: "documents",
    title: "Opportunity documents",
    description:
      "Investors should review relevant agreements, risk disclosures and supporting documents.",
    icon: FileSearch,
  },
  {
    id: "payment",
    title: "Verified funding",
    description:
      "Investment funding should use approved payment methods and identifiable transaction references.",
    icon: CreditCard,
  },
];