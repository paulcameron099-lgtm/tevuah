import {
  Archive,
  BadgeCheck,
  ChartNoAxesCombined,
  FileSearch,
  ShieldCheck,
  Wine,
  type LucideIcon,
} from "lucide-react";

export type WinePrinciple = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type WinePortfolioMetric = {
  id: string;
  label: string;
  value: string;
  description: string;
};

export type WineRegion = {
  id: string;
  name: string;
  country: string;
  allocation: number;
  description: string;
};

export type WineCollectionHolding = {
  id: string;
  producer: string;
  wine: string;
  region: string;
  vintage: string;
  bottles: number;
  illustrativeValue: string;
  change: string;
};

export const winePrinciples: WinePrinciple[] = [
  {
    id: "selection",
    title: "Careful selection",
    description:
      "Potential holdings should be reviewed for producer reputation, vintage, market relevance and collection strategy.",
    icon: Wine,
  },
  {
    id: "provenance",
    title: "Provenance verification",
    description:
      "Available records should support the origin, acquisition history and authenticity of each holding.",
    icon: FileSearch,
  },
  {
    id: "storage",
    title: "Professional storage",
    description:
      "Investment-grade wine should be held under appropriate temperature, humidity and security conditions.",
    icon: Archive,
  },
  {
    id: "custody",
    title: "Documented custody",
    description:
      "Ownership, storage location and custody arrangements should be clearly recorded and reviewable.",
    icon: ShieldCheck,
  },
  {
    id: "authentication",
    title: "Asset verification",
    description:
      "High-value holdings may require additional inspection, condition checks and authenticity controls.",
    icon: BadgeCheck,
  },
  {
    id: "reporting",
    title: "Portfolio reporting",
    description:
      "Investors should be able to review collection composition, activity and illustrative valuation changes.",
    icon: ChartNoAxesCombined,
  },
];

export const winePortfolioMetrics: WinePortfolioMetric[] = [
  {
    id: "collection-value",
    label: "Illustrative collection value",
    value: "€485,000",
    description: "Demonstration portfolio only",
  },
  {
    id: "holdings",
    label: "Collection holdings",
    value: "42",
    description: "Illustrative wines and cases",
  },
  {
    id: "regions",
    label: "Wine regions",
    value: "5",
    description: "Illustrative geographic exposure",
  },
  {
    id: "storage",
    label: "Storage status",
    value: "Protected",
    description: "Illustrative specialist custody",
  },
];

export const wineRegions: WineRegion[] = [
  {
    id: "bordeaux",
    name: "Bordeaux",
    country: "France",
    allocation: 34,
    description:
      "Illustrative exposure to established producers and recognised appellations.",
  },
  {
    id: "burgundy",
    name: "Burgundy",
    country: "France",
    allocation: 28,
    description:
      "Illustrative exposure to scarce production and producer-specific holdings.",
  },
  {
    id: "champagne",
    name: "Champagne",
    country: "France",
    allocation: 15,
    description:
      "Illustrative allocation to selected vintage and prestige cuvée holdings.",
  },
  {
    id: "tuscany",
    name: "Tuscany",
    country: "Italy",
    allocation: 13,
    description:
      "Illustrative exposure to premium Italian wine estates.",
  },
  {
    id: "rioja",
    name: "Rioja",
    country: "Spain",
    allocation: 10,
    description:
      "Illustrative exposure to selected Spanish producers and mature vintages.",
  },
];

export const wineCollectionHoldings: WineCollectionHolding[] = [
  {
    id: "holding-01",
    producer: "Illustrative Château A",
    wine: "Grand Vin",
    region: "Bordeaux",
    vintage: "2016",
    bottles: 12,
    illustrativeValue: "€18,600",
    change: "+4.8%",
  },
  {
    id: "holding-02",
    producer: "Illustrative Domaine B",
    wine: "Premier Cru",
    region: "Burgundy",
    vintage: "2018",
    bottles: 6,
    illustrativeValue: "€24,900",
    change: "+6.2%",
  },
  {
    id: "holding-03",
    producer: "Illustrative House C",
    wine: "Vintage Cuvée",
    region: "Champagne",
    vintage: "2012",
    bottles: 12,
    illustrativeValue: "€11,400",
    change: "+3.4%",
  },
  {
    id: "holding-04",
    producer: "Illustrative Estate D",
    wine: "Riserva",
    region: "Tuscany",
    vintage: "2017",
    bottles: 12,
    illustrativeValue: "€9,800",
    change: "+2.7%",
  },
];