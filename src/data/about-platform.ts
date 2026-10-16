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
      "Tevuah Reserve focuses on productive estates, agricultural infrastructure and carefully selected collectible assets with identifiable underlying value.",
    icon: Landmark,
  },
  {
    id: "long-term",
    title: "Long-term perspective",
    description:
      "Cultivated assets require patience, operational discipline and realistic holding periods. Our approach is built around long-term ownership and responsible asset management rather than short-term speculation.",
    icon: Sprout,
  },
  {
    id: "transparency",
    title: "Visible information",
    description:
      "Investors should be able to understand the asset, investment structure, assumptions, fees, risks and operating context before committing capi",
    icon: Eye,
  },
  {
    id: "risk-awareness",
    title: "Risk-aware presentation",
    description:
      "Investment opportunities are presented with clear information about material risks and uncertainty rather than relying on optimistic marketing or performance-focused messaging.",
    icon: Scale,
  },
  {
    id: "documentation",
    title: "Documented review",
    description:
      "Investment decisions are supported by structured documentation, controlled records and defined review procedures.",
    icon: FileCheck2,
  },
  {
    id: "stewardship",
    title: "Responsible stewardship",
    description:
      "Agricultural assets require responsible management of land, water, infrastructure and natural resources. Stewardship is considered part of long-term asset performance.",
    icon: Leaf,
  },
];

export const governanceStages: GovernanceStage[] = [
  {
    number: "01",
    title: "Initial screening",
    description:
      "Assess whether the asset, investment strategy and proposed structure meet the Tevuah Reserve mandate.",
  },
  {
    number: "02",
    title: "Commercial review",
    description:
      "Evaluate asset quality, operating model, market context, development plans and project economics.",
  },
  {
    number: "03",
    title: "Legal and structural review",
    description:
      "Review ownership, legal entities, contractual arrangements, investor rights and applicable regulatory considerations.",
  },
  {
    number: "04",
    title: "Financial review",
    description:
      "Evaluate financial assumptions, use of funds, fee structure, liquidity considerations, valuation methodology and relevant financial information.",
  },
  {
    number: "05",
    title: "Risk and disclosure review",
    description:
      "Identify material risks and ensure that investor-facing information and disclosures provide a clear representation of the opportunity.",
  },
  {
    number: "06",
    title: "Publication approval",
    description:
      "Opportunities that satisfy the applicable review requirements are approved for presentation to eligible investors.",
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