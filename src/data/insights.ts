import type { InsightArticle } from "@/src/types/insight";

export const insights: InsightArticle[] = [
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

    author: "Tevuah Reserve Editorial",
    authorRole: "Research & Insights",

    introduction:
      "A vineyard harvest is one of the most visible moments in the agricultural calendar, but the final outcome is shaped by months of preparation, monitoring and operating decisions.",

    sections: [
      {
        heading: "Timing matters",
        paragraphs: [
          "Harvest timing can influence grape composition, production planning and the commercial characteristics of the crop.",
          "Estate operators typically consider weather conditions, grape maturity, labour availability and production requirements when planning harvest activity.",
        ],
      },
      {
        heading: "Weather remains a material variable",
        paragraphs: [
          "Rain, heat, frost and other weather conditions can affect both the timing and quality of agricultural production.",
          "Technology can improve visibility into field conditions, but it cannot remove agricultural risk.",
        ],
      },
      {
        heading: "Reporting the harvest",
        paragraphs: [
          "For investors, harvest reporting can provide useful context around production volumes, operational milestones and estate activity.",
          "Any reported figures should identify their source, collection period and whether they have been independently reviewed.",
        ],
      },
    ],

    keyTakeaways: [
      "Harvest outcomes depend on both natural and operational factors.",
      "Technology supports monitoring but does not eliminate agricultural risk.",
      "Investor reporting should distinguish verified production data from estimates.",
    ],
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

    author: "Tevuah Reserve Editorial",
    authorRole: "Research & Insights",

    introduction:
      "Productive olive estates combine land, mature agricultural assets, water infrastructure and seasonal operating activity.",

    sections: [
      {
        heading: "Grove maturity",
        paragraphs: [
          "The productive characteristics of an olive estate can depend on tree age, density, variety, soil and management practices.",
          "Development estates may require longer periods before newly planted blocks achieve mature production.",
        ],
      },
      {
        heading: "Water and irrigation",
        paragraphs: [
          "Water availability can materially affect agricultural performance in Mediterranean environments.",
          "Irrigation infrastructure should therefore be considered alongside the land itself when reviewing an estate.",
        ],
      },
      {
        heading: "Operating visibility",
        paragraphs: [
          "Estate-level reporting can include productive hectares, irrigation activity, harvest volumes and project milestones.",
        ],
      },
    ],

    keyTakeaways: [
      "Land area alone does not describe agricultural productivity.",
      "Water infrastructure can be a significant operational factor.",
      "Investors should distinguish mature production from future development assumptions.",
    ],
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

    author: "Tevuah Reserve Editorial",
    authorRole: "Agricultural Intelligence",

    introduction:
      "Precision irrigation combines physical water infrastructure with monitoring and control systems intended to improve visibility into agricultural water use.",

    sections: [
      {
        heading: "Measurement before optimisation",
        paragraphs: [
          "Operators first need reliable information about field conditions, irrigation activity and water availability.",
          "Sensors and monitoring systems can help establish that operating picture.",
        ],
      },
      {
        heading: "Operational decisions",
        paragraphs: [
          "Data can support irrigation scheduling and help identify potential inefficiencies, but estate managers still need agricultural judgement.",
        ],
      },
      {
        heading: "Investor reporting",
        paragraphs: [
          "Selected water-use metrics may eventually support investor reporting when their source and measurement methodology are clearly disclosed.",
        ],
      },
    ],

    keyTakeaways: [
      "Precision irrigation combines infrastructure, data and operating judgement.",
      "Reported metrics require source and timestamp information.",
      "Efficiency indicators should not be presented as guaranteed future performance.",
    ],
  },

  {
    id: "insight_wine_provenance",
    slug: "why-provenance-matters-in-fine-wine",
    title: "Why provenance matters in fine wine",
    excerpt:
      "Understand how acquisition records, storage history, authenticity and condition can influence collectible wine assets.",
    category: "Fine Wine",
    publishedAt: "2026-06-14",
    readingTime: "6 min read",
    image: "/images/insights/wine-provenance.jpg",
    featured: false,

    author: "Tevuah Reserve Editorial",
    authorRole: "Fine-Wine Research",

    introduction:
      "Fine wine is a physical collectible asset, which means history and condition can be important parts of understanding the holding.",

    sections: [
      {
        heading: "A documented history",
        paragraphs: [
          "Available provenance records may include producer information, acquisition history, invoices, storage location and custody information.",
        ],
      },
      {
        heading: "Storage and condition",
        paragraphs: [
          "Temperature, humidity and handling conditions can influence the physical condition of wine over long holding periods.",
        ],
      },
    ],

    keyTakeaways: [
      "Provenance is part of understanding a collectible asset.",
      "Storage history and physical condition matter.",
      "Authenticity and custody risks should be clearly disclosed.",
    ],
  },

  {
    id: "insight_asset_risk",
    slug: "understanding-illiquidity-in-private-assets",
    title: "Understanding illiquidity in private assets",
    excerpt:
      "Why long holding periods and uncertain exit timing matter when evaluating private agricultural and collectible investments.",
    category: "Investor Education",
    publishedAt: "2026-05-29",
    readingTime: "8 min read",
    image: "/images/insights/private-assets.jpg",
    featured: false,

    author: "Tevuah Reserve Editorial",
    authorRole: "Investor Education",

    introduction:
      "Private assets can behave very differently from publicly traded investments because investors may not be able to sell whenever they choose.",

    sections: [
      {
        heading: "What illiquidity means",
        paragraphs: [
          "An illiquid investment may not have an active market or readily available buyer.",
          "An investor may therefore need to remain invested for an extended period.",
        ],
      },
      {
        heading: "Why time horizon matters",
        paragraphs: [
          "Investors should consider whether they may need access to committed capital during the expected holding period.",
        ],
      },
    ],

    keyTakeaways: [
      "Private investments may be difficult to sell.",
      "Expected holding periods are not guaranteed exit dates.",
      "Liquidity needs should be considered before investing.",
    ],
  },
];

export const featuredInsights = insights.filter(
  (article) => article.featured,
);

export function getInsightBySlug(slug: string) {
  return insights.find((article) => article.slug === slug);
}