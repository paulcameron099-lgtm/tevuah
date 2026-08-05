import {
  Archive,
  ChartNoAxesCombined,
  FileCheck2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type FineWineFeature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const fineWineFeatures: FineWineFeature[] = [
  {
    id: "provenance",
    title: "Provenance review",
    description:
      "Records should document origin, producer, vintage, acquisition history and available authenticity information.",
    icon: FileCheck2,
  },
  {
    id: "storage",
    title: "Professional storage",
    description:
      "Investment-grade wine should be held under controlled conditions with clear storage records and access procedures.",
    icon: Archive,
  },
  {
    id: "protection",
    title: "Asset protection",
    description:
      "Insurance, custody arrangements and ownership records should be clearly presented to investors.",
    icon: ShieldCheck,
  },
  {
    id: "reporting",
    title: "Portfolio reporting",
    description:
      "Investors should be able to review holdings, valuations, activity and relevant market commentary.",
    icon: ChartNoAxesCombined,
  },
];