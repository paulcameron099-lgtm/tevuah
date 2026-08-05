import type { InsightArticle } from "@/src/types/insight";

export const featuredInsights: InsightArticle[] = [
  {
    id: "insight_vineyard_harvest",
    slug: "inside-a-modern-vineyard-harvest",
    title: "Inside a modern vineyard harvest",
    excerpt:
      "Explore how timing, weather, labour and vineyard management influence the quality and commercial outcome of a harvest.",
    category: "Vineyards",
    publishedAt: "2026-07-18",
    readingTime: "6 min read",
    image: "/images/insights/vineyard-harvest.jpg",
    featured: true,
  },
  {
    id: "insight_olive_estate",
    slug: "understanding-productive-olive-estates",
    title: "Understanding productive olive estates",
    excerpt:
      "A practical introduction to grove maturity, irrigation, harvest cycles and the operational factors behind premium olive production.",
    category: "Olive Estates",
    publishedAt: "2026-07-09",
    readingTime: "7 min read",
    image: "/images/insights/olive-harvest.jpg",
    featured: true,
  },
  {
    id: "insight_precision_irrigation",
    slug: "how-precision-irrigation-supports-estate-management",
    title: "How precision irrigation supports estate management",
    excerpt:
      "Learn how sensors, field data and controlled water delivery can improve visibility and resource planning across agricultural estates.",
    category: "AgTech",
    publishedAt: "2026-06-28",
    readingTime: "5 min read",
    image: "/images/insights/precision-irrigation.jpg",
    featured: true,
  },
];

export function getInsightBySlug(slug: string) {
  return featuredInsights.find((article) => article.slug === slug);
}