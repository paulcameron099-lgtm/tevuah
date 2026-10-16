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
      "Each opportunity undergoes documented commercial, operational, legal and financial review before being made available to investors.",
    icon: ClipboardCheck,
  },
  {
    id: "legal-structure",
    title: "Clear investment structure",
    description:
      "Investors should understand what they own, how the investment is structured and which legal entity manages the underlying asset.",
    icon: Landmark,
  },
  {
    id: "risk-disclosure",
    title: "Visible risk disclosure",
    description:
      "Material risks, fees, holding periods, liquidity limitations and key assumptions are presented clearly and made accessible throughout the investment process.",
    icon: Scale,
  },
  {
    id: "documents",
    title: "Controlled documentation",
    description:
      "Offering documents, agreements and reports are version-controlled, permissioned and securely maintained.",
    icon: FileLock2,
  },
  {
    id: "reporting",
    title: "Ongoing reporting",
    description:
      "Investors receive relevant project updates, operating information and financial records throughout the investment period.",
    icon: ScrollText,
  },
  {
    id: "oversight",
    title: "Operational oversight",
    description:
      "Sensitive actions are permission-based, auditable and subject to appropriate internal approval controls.",
    icon: ShieldCheck,
  },
];