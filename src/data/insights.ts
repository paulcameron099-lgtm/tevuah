
import type { InsightArticle } from "@/src/types/insight";

export const insights: InsightArticle[] = [
  {
    id: "insight_vineyard_harvest",
    slug: "inside-a-modern-vineyard-harvest",
    title: "Inside a modern vineyard harvest",
    excerpt:
      "Explore how timing, weather, labour and vineyard management influence the quality and commercial outcome of a harvest.",
    category: "Vineyards",
    publishedAt: "2026-07-17",
    readingTime: "6 min read",
    image: "/images/insights/vineyard-harvest.jpg",
    featured: true,
    author: "Tevuah Reserve Editorial",
    authorRole: "Research & Insights",

    introduction:
      "A vineyard harvest is one of the most visible moments in the agricultural calendar, but its outcome is shaped by months of preparation, monitoring and operating decisions.",

    sections: [
      {
        heading: "Timing matters",
        paragraphs: [
          "Harvest timing can influence grape composition, production planning and the commercial characteristics of the crop.",
          "Estate operators consider factors such as grape maturity, weather forecasts, labour availability and production requirements when deciding when to harvest. The appropriate timing depends on the grape variety, growing conditions and intended wine style.",
          "Harvesting too early or too late may affect the characteristics of the grapes and the options available during winemaking.",
        ],
      },
      {
        heading: "Weather remains a material variable",
        paragraphs: [
          "Rain, heat, frost and other weather conditions can affect harvest timing, grape condition and overall production.",
          "Weather-related challenges may require changes to harvesting schedules, additional labour or adjustments to vineyard management. Their effects vary according to the location, growing season and condition of the vines.",
          "Technology can improve visibility into field conditions, but it cannot eliminate agricultural risk or prevent every adverse event.",
        ],
      },
      {
        heading: "Labour and operational coordination",
        paragraphs: [
          "Harvesting requires coordination between vineyard teams, equipment, transport and, where applicable, winery capacity. Labour shortages, equipment failures or delays can disrupt planned operations, particularly when weather conditions create a narrow harvesting window.",
          "Planning and coordination can help manage these pressures, although unexpected costs and operational disruptions remain possible.",
        ],
      },
      {
        heading: "Reporting the harvest",
        paragraphs: [
          "For investors, harvest reporting can provide context on production volumes, operational milestones, crop conditions and progress against operating plans.",
          "Useful reporting should identify the period covered, the source of the information and whether figures are preliminary, estimated or independently reviewed. Production volume alone does not establish profitability: operating costs, grape quality, sale prices and subsequent processing or distribution arrangements may also affect the commercial outcome.",
        ],
      },
    ],

    keyTakeaways: [
      "Harvest outcomes depend on natural conditions and operational decisions.",
      "Timing, labour and coordination can influence production and costs.",
      "Technology supports monitoring but does not eliminate agricultural risk.",
      "Investor reporting should distinguish verified production data from estimates.",
    ],
  },

  {
    id: "insight_olive_estate",
    slug: "understanding-productive-olive-estates",
    title: "Understanding productive olive estates",
    excerpt:
      "Explore how grove maturity, irrigation, harvest cycles and estate management influence olive production and operating performance.",
    category: "Olive Estates",
    publishedAt: "2021-05-04",
    readingTime: "8 min read",
    image: "/images/insights/olive-harvest.jpg",
    featured: true,
    author: "Tevuah Reserve Editorial",
    authorRole: "Research & Insights",

    introduction:
      "An olive estate is a productive agricultural asset whose performance depends on more than the number of trees or the area of land. Grove maturity, growing conditions, cultivation practices, harvest decisions and the commercial route to market all influence its operating results.",

    sections: [
      {
        heading: "Grove maturity and productive capacity",
        paragraphs: [
          "The age and condition of olive trees can influence their productive capacity, but tree age alone does not determine output. Variety, planting density, pruning, soil conditions, water availability and ongoing management also matter.",
          "Production can vary from one season to the next. Some groves experience alternating periods of higher and lower yields, making it important to assess performance across multiple harvests rather than relying on a single season.",
          "When evaluating an estate, historical production records should be considered alongside the condition of the trees, infrastructure and cultivation practices.",
        ],
      },
      {
        heading: "Irrigation and water management",
        paragraphs: [
          "Water availability is an important consideration in olive cultivation. The relevance and extent of irrigation depend on local rainfall, soil characteristics, climate, grove design and production objectives.",
          "Water-management practices can influence tree health, operating costs and resilience during dry periods. However, irrigation systems require suitable infrastructure, maintenance and access to water, and their effectiveness depends on local conditions.",
          "A review of an estate should consider its water sources, irrigation arrangements, infrastructure condition and exposure to water restrictions or drought.",
        ],
      },
      {
        heading: "Harvest cycles and operating costs",
        paragraphs: [
          "Olives may be harvested using manual methods, mechanical equipment or a combination of approaches. The appropriate method depends on grove layout, terrain, tree characteristics, labour availability and the intended product.",
          "Harvest timing can affect fruit condition and the characteristics of the resulting oil. Harvest logistics, transport and processing arrangements can also influence costs and product quality.",
          "Labour, equipment maintenance, fuel, processing and other operating expenses should be considered when assessing an estate's operating performance.",
        ],
      },
      {
        heading: "From production to commercial value",
        paragraphs: [
          "An olive estate's commercial results depend on how its output is marketed and sold. Relevant factors may include the volume harvested, oil yield, product quality, processing costs, customer demand and achieved sale prices.",
          "An estate producing a large crop does not necessarily generate stronger financial results if costs are high or selling prices are weak. Revenue and profitability should therefore be assessed separately from physical production.",
        ],
      },
      {
        heading: "Reporting estate performance",
        paragraphs: [
          "Investor reporting can provide useful context through harvest records, production volumes, water-use information, operating costs and progress against the estate's management plan.",
          "Reported figures should identify the period covered, their source and whether they represent actual results, estimates or projections. Comparisons between seasons should account for differences in weather, production conditions and reporting methods.",
        ],
      },
    ],

    keyTakeaways: [
      "Tree age alone does not establish an estate's productive capacity.",
      "Water availability, cultivation and harvest methods influence operating performance.",
      "Production volume and financial performance are different measures.",
      "Reliable assessment requires historical records, operating-cost information and clear reporting.",
    ],
  },

  {
    id: "insight_precision_irrigation",
    slug: "how-precision-irrigation-supports-estate-management",
    title: "How precision irrigation supports estate management",
    excerpt:
      "Understand how sensors, field data and controlled water delivery can support water management, resource planning and operational visibility across agricultural estates.",
    category: "AgTech",
    publishedAt: "2025-06-24",
    readingTime: "5 min read",
    image: "/images/insights/precision-irrigation.jpg",
    featured: true,
    author: "Tevuah Reserve Editorial",
    authorRole: "Agricultural Intelligence",

    introduction:
      "Water management is an important part of agricultural operations. Precision irrigation uses information about field conditions, water availability and crop requirements to support irrigation decisions. Its value depends on the quality of the data, the suitability of the equipment and how effectively operators use the information.",

    sections: [
      {
        heading: "Understanding field conditions",
        paragraphs: [
          "Agricultural sensors and monitoring systems can collect information such as soil moisture, temperature and local environmental conditions. Weather stations, satellite observations and other data sources may provide additional context.",
          "These measurements can help operators identify changes across different areas of an estate and assess where closer attention may be needed. However, readings represent specific locations and periods, and may not reflect conditions across an entire property.",
          "The source, timestamp, measurement method and limitations of the data should be understood before it is used to support operational decisions.",
        ],
      },
      {
        heading: "Supporting irrigation decisions",
        paragraphs: [
          "Precision irrigation systems can help operators plan when and where to apply water. Depending on the technology and estate setup, monitoring tools may support irrigation scheduling, identify potential inefficiencies and help compare water use across different areas.",
          "The practical benefit depends on factors such as soil type, crop requirements, equipment performance, water supply and local weather. Sensors and automated systems also require maintenance, calibration and appropriate interpretation.",
          "Technology can inform decisions, but it does not replace agronomic expertise or eliminate the effects of drought and other environmental conditions.",
        ],
      },
      {
        heading: "Water use and operating efficiency",
        paragraphs: [
          "Water management can affect operating costs, crop condition and the long-term resilience of agricultural assets. Monitoring water use may help operators identify unusual consumption patterns or areas where irrigation practices warrant review.",
          "To evaluate performance, water-use data should be considered alongside production outcomes, weather conditions and changes in cultivation practices. A reduction in water consumption alone does not necessarily demonstrate improved productivity if crop performance is also affected.",
        ],
      },
      {
        heading: "What investors should look for",
        paragraphs: [
          "When agricultural technology forms part of an investment's operating model, relevant questions include:",
          "What is being measured, and how often?",
          "Which equipment or data sources provide the information?",
          "Are readings validated, estimated or subject to known limitations?",
          "Who maintains the equipment and reviews the results?",
          "How are operational observations incorporated into estate reporting?",
          "Clear reporting helps distinguish direct measurements from estimates, interpretations and forecasts.",
        ],
      },
    ],

    keyTakeaways: [
      "Precision irrigation can support water management and operational planning.",
      "The usefulness of monitoring depends on data quality, equipment and interpretation.",
      "Technology does not remove agricultural or environmental risk.",
      "Investors should understand how operational data is collected, validated and reported.",
    ],
  },

  {
    id: "insight_wine_provenance",
    slug: "why-provenance-matters-in-fine-wine",
    title: "Why provenance matters in fine wine",
    excerpt:
      "Examine how acquisition records, storage history, authenticity and bottle condition influence the assessment and potential value of fine-wine assets.",
    category: "Fine Wine",
    publishedAt: "2024-08-14",
    readingTime: "6 min read",
    image: "/images/insights/wine-provenance.jpg",
    featured: false,
    author: "Tevuah Reserve Editorial",
    authorRole: "Fine-Wine Research",

    introduction:
      "Fine wine is a specialist asset category in which the wine's identity and quality are only part of the assessment. Provenance—the documented history of a wine's origin, ownership and handling—can help establish confidence in the asset and inform decisions about storage, valuation and potential resale.",

    sections: [
      {
        heading: "Acquisition and ownership records",
        paragraphs: [
          "Acquisition records can help establish when and where wine was purchased, its stated identity and the chain of ownership. Invoices, inventory records, producer documentation and records from recognised merchants or other relevant parties may contribute to the supporting evidence.",
          "The strength of that evidence depends on its completeness, consistency and reliability. Records should be checked for discrepancies, and documentation should not be assumed to establish authenticity on its own.",
        ],
      },
      {
        heading: "Storage and custody",
        paragraphs: [
          "Storage conditions can affect wine quality and condition over time. Temperature fluctuations, unsuitable humidity, exposure to light and improper handling may compromise the wine or its packaging.",
          "Custody records can help establish where wine has been held and which parties have been responsible for it. Relevant documentation may include storage statements, inventory records, movement histories and evidence of the storage facility's arrangements.",
          "Even with appropriate storage, the condition of an individual bottle cannot be established solely from the reputation of a facility.",
        ],
      },
      {
        heading: "Authenticity and condition",
        paragraphs: [
          "Authenticity is a central consideration when evaluating collectible wine. Bottle labels, capsules, packaging, provenance records and other available evidence may contribute to an assessment, depending on the wine and circumstances.",
          "Condition also matters. Fill level, visible damage, packaging integrity and any available inspection records may affect how a bottle is assessed by potential buyers.",
          "The appropriate checks depend on the wine, its history and the quality of the available evidence. No single document or visual inspection necessarily removes every authenticity or condition risk.",
        ],
      },
      {
        heading: "Valuation and potential resale",
        paragraphs: [
          "Fine-wine valuations may draw on market quotations, comparable transactions, specialist assessments and other available information. These sources may differ in timing, scope and reliability.",
          "A quoted valuation does not guarantee that a buyer will be available at that price. Selling costs, storage expenses, transaction arrangements and market liquidity may affect the amount ultimately realised.",
          "The potential resale value of a wine should therefore be considered alongside its provenance, condition, costs and the uncertainty involved in finding a buyer.",
        ],
      },
      {
        heading: "What investors should review",
        paragraphs: [
          "Before evaluating a fine-wine investment, investors should understand the asset inventory, available provenance records, storage and custody arrangements, valuation basis, fees and potential exit routes.",
          "Reporting should distinguish documented facts from third-party assessments and estimated values. Any material gaps in records or uncertainties around authenticity, condition or custody should be clearly identified.",
        ],
      },
    ],

    keyTakeaways: [
      "Provenance records help establish a wine's documented history.",
      "Storage, custody and condition can influence marketability and value.",
      "Documentation supports due diligence but does not eliminate authenticity risk.",
      "Valuations are estimates and do not guarantee resale proceeds.",
    ],
  },

  {
    id: "insight_asset_risk",
    slug: "understanding-illiquidity-in-private-assets",
    title: "Understanding illiquidity in private assets",
    excerpt:
      "Understand why private investments may involve extended holding periods, limited opportunities to sell and uncertainty around the timing and proceeds of an exit.",
    category: "Investor Education",
    publishedAt: "2021-05-04",
    readingTime: "8 min read",
    image: "/images/insights/private-assets.jpg",
    featured: false,
    author: "Tevuah Reserve Editorial",
    authorRole: "Investor Education",

    introduction:
      "Illiquidity is an important consideration in private-market investing. Unlike assets traded on established public exchanges, a private investment may not have a readily available market in which an investor can sell a position when desired. For investments linked to agricultural estates, AgTech or fine wine, the ability to exit may depend on the investment structure, contractual restrictions, the availability of buyers and the circumstances of the underlying assets.",

    sections: [
      {
        heading: "Why private assets can be difficult to sell",
        paragraphs: [
          "Private investments may involve ownership interests or contractual arrangements that cannot be transferred freely. A transfer may require consent, documentation, eligibility checks or compliance with specific terms.",
          "Even when a transfer is permitted, there may be no interested buyer at the desired time or price. The absence of an active secondary market can make it difficult to establish what a position could realistically be sold for.",
          "Investors should review the transfer provisions and any available exit mechanisms before committing capital.",
        ],
      },
      {
        heading: "Holding periods and exit timing",
        paragraphs: [
          "An investment may have an expected holding period, but the actual time required to realise value can differ from initial expectations.",
          "For an agricultural estate, a realisation may depend on operating performance, financing arrangements, market conditions or a sale of the underlying asset. For fine wine, the timing may depend on buyer demand, the wines held and the conditions available for sale.",
          "Events outside the control of the investor may delay an exit. Investors should not assume that capital will become available on a particular date unless the applicable contractual terms clearly establish that outcome—and even then, the relevant obligations and risks must be understood.",
        ],
      },
      {
        heading: "Liquidity and valuation are different",
        paragraphs: [
          "An asset may have an estimated value without having a buyer ready to purchase it. A reported valuation does not establish that an investor can sell their position immediately or receive the stated amount.",
          "The amount ultimately realised may differ from an estimate because of market conditions, transaction costs, timing, asset-specific factors and the terms of the sale.",
          "Investors should distinguish an asset valuation from the price that could be achieved in an actual transaction.",
        ],
      },
      {
        heading: "Cash-flow planning",
        paragraphs: [
          "Private investments may require capital to remain committed for an extended period. Distributions, where applicable, may be variable, delayed or absent, and an early exit may be unavailable or economically unattractive.",
          "Investors should consider their financial obligations, emergency reserves and foreseeable cash needs before committing funds. Capital that may be needed for near-term expenses may be unsuitable for an investment with uncertain exit timing.",
        ],
      },
      {
        heading: "Questions to consider before investing",
        paragraphs: [
          "Before making a commitment, investors should review:",
          "The expected holding period and the factors that could extend it.",
          "Whether transfers or early exits are permitted and what conditions apply.",
          "Whether a secondary market exists and how a potential buyer might be identified.",
          "How the investment is valued and what costs could affect exit proceeds.",
          "Whether distributions are expected, and the circumstances in which they may be reduced or suspended.",
          "Whether they can withstand an extended holding period or a partial or complete loss of capital.",
          "The answers will depend on the specific investment structure and its documentation.",
        ],
      },
    ],

    keyTakeaways: [
      "Private investments may not be readily transferable or saleable.",
      "Expected holding periods and exit timing can change.",
      "Estimated value does not guarantee liquidity or a particular sale price.",
      "Investors should assess their cash needs and ability to hold capital for longer than anticipated.",
    ],
  },
];

export const featuredInsights = insights.filter(
  (article) => article.featured,
);

export function getInsightBySlug(slug: string) {
  return insights.find((article) => article.slug === slug);
}
