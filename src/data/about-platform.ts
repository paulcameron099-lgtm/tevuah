import {
  Eye,
  FileCheck2,
  Landmark,
  Leaf,
  Scale,
  ShieldCheck,
  Sprout,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type InvestmentPrinciple = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type GovernanceStage = {
  number: string;
  title: string;
  description: string;
};

export type TeamFunction = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const investmentPrinciples: InvestmentPrinciple[] = [
  {
    id: "real-assets",
    title: "Real-asset orientation",
    description:
      "We focus the platform experience on productive estates, agricultural infrastructure and carefully presented collectible assets.",
    icon: Landmark,
  },
  {
    id: "long-term",
    title: "Long-term perspective",
    description:
      "Cultivated assets often require patience, operating discipline and realistic holding periods rather than short-term speculation.",
    icon: Sprout,
  },
  {
    id: "transparency",
    title: "Visible information",
    description:
      "Investors should be able to understand the asset, structure, assumptions, risks, fees and operating context before committing.",
    icon: Eye,
  },
  {
    id: "risk-awareness",
    title: "Risk-aware presentation",
    description:
      "Opportunity design should explain material risks clearly rather than hiding uncertainty behind optimistic marketing.",
    icon: Scale,
  },
  {
    id: "documentation",
    title: "Documented review",
    description:
      "Investment decisions should be supported by structured documentation, version control and defined review processes.",
    icon: FileCheck2,
  },
  {
    id: "stewardship",
    title: "Responsible stewardship",
    description:
      "Agricultural assets should be managed with attention to land, water, operating sustainability and long-term productivity.",
    icon: Leaf,
  },
];

export const governanceStages: GovernanceStage[] = [
  {
    number: "01",
    title: "Initial screening",
    description:
      "Review whether the asset and proposed structure fit the platform mandate.",
  },
  {
    number: "02",
    title: "Commercial review",
    description:
      "Assess asset quality, operating model, market context and project economics.",
  },
  {
    number: "03",
    title: "Legal and structural review",
    description:
      "Review ownership, entity structure, contracts, investor rights and regulatory considerations.",
  },
  {
    number: "04",
    title: "Financial review",
    description:
      "Assess assumptions, use of funds, fee structure, liquidity and valuation methodology.",
  },
  {
    number: "05",
    title: "Risk and disclosure review",
    description:
      "Identify material risks and confirm that investor-facing disclosures are clear and complete.",
  },
  {
    number: "06",
    title: "Publication approval",
    description:
      "Only approved opportunities should become visible to eligible investors.",
  },
];

export const teamFunctions: TeamFunction[] = [
  {
    id: "investment",
    title: "Investment team",
    description:
      "Responsible for opportunity screening, investment analysis, underwriting and ongoing review.",
    icon: Landmark,
  },
  {
    id: "operations",
    title: "Asset and operations team",
    description:
      "Coordinates estate operators, operational reporting, project milestones and asset-level information.",
    icon: Sprout,
  },
  {
    id: "compliance",
    title: "Compliance and governance",
    description:
      "Supports investor verification, documentation, risk controls, policies and regulatory processes.",
    icon: ShieldCheck,
  },
  {
    id: "investor-relations",
    title: "Investor relations",
    description:
      "Supports investor communication, portfolio reporting, documents and ongoing engagement.",
    icon: UsersRound,
  },
];