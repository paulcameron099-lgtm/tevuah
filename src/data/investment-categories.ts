import type { InvestmentCategory } from "@/src/types/investment";

export const investmentCategories: InvestmentCategory[] = [
  {
    id: "vineyard",
    eyebrow: "Cultivated land",
    title: "Vineyard Estates",
    description:
      "Access carefully selected vineyard projects combining productive land, estate development and specialist agricultural management.",
    href: "/investments?category=vineyard",
    image: "/images/categories/vineyard-estate.jpg",
    highlights: [
      "Productive agricultural land",
      "Experienced estate operators",
      "Long-term development strategy",
    ],
  },
  {
    id: "olive",
    eyebrow: "Mediterranean agriculture",
    title: "Olive Estates",
    description:
      "Participate in professionally managed olive estates and premium olive-oil production projects.",
    href: "/investments?category=olive",
    image: "/images/categories/olive-estate.jpg",
    highlights: [
      "Established or developing groves",
      "Production-backed operations",
      "Transparent estate reporting",
    ],
  },
  {
    id: "agtech",
    eyebrow: "Agricultural innovation",
    title: "AgTech",
    description:
      "Support technologies that improve irrigation, crop monitoring, farm automation and agricultural productivity.",
    href: "/investments?category=agtech",
    image: "/images/categories/agtech.jpg",
    highlights: [
      "Precision agriculture",
      "Water-management systems",
      "Data-supported operations",
    ],
  },
  {
    id: "fine-wine",
    eyebrow: "Collectible assets",
    title: "Fine Wine",
    description:
      "Discover professionally selected wine opportunities supported by provenance checks, specialist storage and portfolio reporting.",
    href: "/investments?category=fine-wine",
    image: "/images/categories/fine-wine-cellar.jpg",
    highlights: [
      "Provenance verification",
      "Professional storage",
      "Portfolio-level reporting",
    ],
  },
];