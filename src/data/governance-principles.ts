import {
  ClipboardCheck,
  FileLock2,
  Landmark,
  Scale,
  ScrollText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type GovernancePrinciple = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const governancePrinciples: GovernancePrinciple[] = [
  {
    id: "review",
    title: "Structured opportunity review",
    description:
      "Each opportunity should pass through documented commercial, operational, legal and financial review before publication.",
    icon: ClipboardCheck,
  },
  {
    id: "legal-structure",
    title: "Clear investment structure",
    description:
      "Investors should understand what they own, how the project is structured and which legal entity manages the asset.",
    icon: Landmark,
  },
  {
    id: "risk-disclosure",
    title: "Visible risk disclosure",
    description:
      "Material risks, fees, holding periods, liquidity limits and assumptions should be easy to locate and understand.",
    icon: Scale,
  },
  {
    id: "documents",
    title: "Controlled documentation",
    description:
      "Offering documents, agreements and reports should be versioned, permissioned and stored securely.",
    icon: FileLock2,
  },
  {
    id: "reporting",
    title: "Ongoing reporting",
    description:
      "Investors should receive relevant project updates, operating information and financial records throughout the investment period.",
    icon: ScrollText,
  },
  {
    id: "oversight",
    title: "Operational oversight",
    description:
      "Sensitive actions should be permission-based, auditable and subject to appropriate internal approval controls.",
    icon: ShieldCheck,
  },
];