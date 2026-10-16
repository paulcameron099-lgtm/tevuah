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
      "Records document origin, producer, vintage, acquisition history and available authenticity information.",
    icon: FileCheck2,
  },
  {
    id: "storage",
    title: "Professional storage",
    description:
      "Investment-grade wine is held under controlled conditions with documented storage arrangements, custody procedures and appropriate access controls.",
    icon: Archive,
  },
  {
    id: "protection",
    title: "Asset protection",
    description:
      "Insurance, custody arrangements and ownership records are maintained and presented as part of the asset documentation.",
    icon: ShieldCheck,
  },
  {
    id: "reporting",
    title: "Portfolio reporting",
    description:
      "Investors can review holdings, valuations, activity and relevant market information associated with their wine portfolio.",
    icon: ChartNoAxesCombined,
  },
];