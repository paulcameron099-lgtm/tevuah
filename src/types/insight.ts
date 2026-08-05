export type InsightCategory =
  | "Vineyards"
  | "Olive Estates"
  | "AgTech"
  | "Fine Wine"
  | "Investor Education";

export type InsightArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: InsightCategory;
  publishedAt: string;
  readingTime: string;
  image: string;
  featured: boolean;
};