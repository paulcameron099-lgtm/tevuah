export type EventSection = {
  title: string;
  description: string;
};

export type TevuahEvent = {
  slug: string;
  title: string;
  date: string;
  dateISO: string;
  location: string;
  format: string;
  category: string;
  eyebrow: string;
  image: string;
  summary: string;
  highlights: [string, string][];
  aboutHeading: string;
  about: string[];
  sessionHeading: string;
  sessions: EventSection[];
  experienceHeading: string;
  experience: string[];
  registrationHeading: string;
  registrationText: string;
  disclosureHeading: string;
  disclosure: string;
};

export const events: TevuahEvent[] = [
  {
    slug: "art-of-the-cellar-napa-valley",
    title: "The Art of the Cellar: Napa Valley’s Finest",
    date: "16 January 2027",
    dateISO: "2027-01-16",
    location: "Napa Valley, California, USA",
    format: "Fine wine masterclass and tasting",
    category: "Fine wine",
    eyebrow: "Fine Wine · Masterclass and Tasting",
    image: "/images/hero/fine-wine-page-hero.jpg",

    summary:
      "Explore the character, provenance and collectibility of Napa Valley wines through a specialist tasting and discussion. Examine how vintage quality, producer reputation, storage conditions and market demand influence the assessment of fine wine as a collectible asset.",

    highlights: [
      ["Discover", "Wine character and vintage"],
      ["Examine", "Provenance and collectibility"],
      ["Understand", "Market considerations"],
    ],

    aboutHeading: "What makes a wine worth collecting?",

    about: [
      "Fine wine brings together craftsmanship, regional character, vintage variation and a history that can extend across generations. Understanding its collectibility requires more than appreciating what is in the glass.",
      "Provenance, producer reputation, storage conditions and market demand all contribute to how a wine is assessed.",
      "This masterclass explores these considerations through the wines of Napa Valley, examining the relationship between quality, origin and reputation. The discussion connects the experience of tasting with the practical considerations involved in assessing fine wine as a collectible asset.",
      "Participants will gain a broader perspective on how wine is evaluated, what supports confidence in its provenance and why the conditions surrounding ownership and custody matter.",
    ],

    sessionHeading: "From the vineyard to the cellar.",

    sessions: [
      {
        title: "Vintage and character",
        description:
          "Examine how growing conditions, harvest decisions and vintage variation influence a wine’s character, quality and standing among collectors.",
      },
      {
        title: "Producer reputation",
        description:
          "Explore the role of winemaking consistency, established reputation and critical recognition in shaping the perception of individual wines.",
      },
      {
        title: "Provenance and storage",
        description:
          "Understand why documented ownership history, appropriate storage and continuity of custody matter when assessing the condition and credibility of a collectible wine.",
      },
      {
        title: "Collectibility and demand",
        description:
          "Consider how scarcity, collector preferences, market activity and changing demand influence a wine’s position in the secondary market.",
      },
    ],

    experienceHeading: "A tasting informed by context.",

    experience: [
      "The session combines guided wine tasting with specialist discussion. Participants will explore the relationship between sensory characteristics and the wider factors that contribute to a wine’s reputation and collectibility.",
      "The emphasis is on developing a more informed approach to wine appreciation and understanding the distinctions between enjoying a wine, collecting it and evaluating it as an asset.",
    ],

    registrationHeading: "Join the conversation.",

    registrationText:
      "Register your interest to enquire about participation and receive further information regarding the event. Registration of interest does not guarantee a place; participation remains subject to availability and confirmation.",

    disclosureHeading: "An informed perspective",

    disclosure:
      "Fine wine is a specialist asset class involving risks related to valuation, liquidity, storage, authenticity and market demand.",
  },

  {
    slug: "intelligent-estate-data-into-decisions",
    title: "The Intelligent Estate: Data Into Decisions",
    date: "8 February 2027",
    dateISO: "2027-02-08",
    location: "Sacramento, California, USA",
    format: "Technology and investment briefing",
    category: "AgTech",
    eyebrow: "AgTech · Technology and Investment Briefing",
    image: "/images/hero/our-estates-page-hero.jpg",

    summary:
      "Explore how precision agriculture, sensor networks and field intelligence are changing the management of productive land. This session examines the practical application of agricultural data, from irrigation efficiency to crop monitoring, operational planning and resource management.",

    highlights: [
      ["Discover", "Agricultural intelligence"],
      ["Examine", "Operational decisions"],
      ["Understand", "Technology and asset management"],
    ],

    aboutHeading:
      "Turning agricultural data into practical decisions.",

    about: [
      "Modern agricultural operations generate information about soil conditions, water use, crop development, weather and field performance. The challenge is not simply collecting that information, but determining how it can support better decisions across a productive estate.",
      "The Intelligent Estate examines the practical application of precision agriculture and monitoring technologies. From sensor networks to irrigation data and remote field observation, the session considers how technology can help operators understand changing conditions, identify operational priorities and allocate resources more effectively.",
      "The discussion also considers the investment perspective: how technology adoption, implementation costs, data quality and operational discipline affect the assessment of an agricultural asset.",
    ],

    sessionHeading:
      "The systems behind informed estate management.",

    sessions: [
      {
        title: "Precision agriculture",
        description:
          "Explore how field-level measurements and location-specific information can help operators understand variations in growing conditions and make more targeted management decisions.",
      },
      {
        title: "Sensor networks and monitoring",
        description:
          "Examine how connected sensors and remote observation can support the collection of information on soil moisture, weather conditions, irrigation and crop development.",
      },
      {
        title: "Water and resource management",
        description:
          "Consider how monitoring and analysis can inform irrigation scheduling, water allocation and the efficient use of agricultural resources.",
      },
      {
        title: "Data-led operational planning",
        description:
          "Understand how field observations and historical records can contribute to harvest planning, maintenance priorities, resource allocation and operational reporting.",
      },
      {
        title: "Technology and investment considerations",
        description:
          "Examine implementation costs, infrastructure requirements, system reliability, operator adoption and the distinction between technology potential and demonstrated operational results.",
      },
    ],

    experienceHeading: "Beyond the technology itself.",

    experience: [
      "The briefing focuses on practical applications rather than technology for its own sake. Participants will explore the relationship between data collection, interpretation and action, including the limitations that arise when information is incomplete, poorly maintained or disconnected from operational expertise.",
      "The central question is how agricultural technology can support the productive asset without distracting from the fundamentals of land, water, cultivation and responsible management.",
    ],

    registrationHeading:
      "Explore the next generation of agricultural management.",

    registrationText:
      "Register your interest to enquire about participation and receive further event information. Participation is subject to availability and confirmation.",

    disclosureHeading: "Technology in context",

    disclosure:
      "Technology does not guarantee improved yields, reduced costs or stronger investment performance. Results depend on implementation, local conditions, data quality, operator decisions and ongoing maintenance.",
  },

  {
    slug: "mediterranean-harvest-grove-to-value",
    title: "The Mediterranean Harvest: From Grove to Value",
    date: "19 December 2026",
    dateISO: "2026-12-19",
    location: "Jaén, Spain",
    format: "Olive estate and production briefing",
    category: "Olive estates",
    eyebrow: "Olive Estates · Estate and Production Briefing",
    image: "/images/hero/our-estates-page-hero.jpg",

    summary:
      "A closer look at the commercial realities of olive cultivation, from harvest timing and irrigation to milling, oil quality and market positioning. Examine the operational decisions that influence productivity and the long-term stewardship of established olive estates.",

    highlights: [
      ["Discover", "Olive cultivation"],
      ["Examine", "Harvest and production"],
      ["Understand", "Estate economics and stewardship"],
    ],

    aboutHeading:
      "Understanding the work behind every harvest.",

    about: [
      "An olive estate is shaped by a series of connected decisions throughout the growing and production cycle. Water availability, grove condition, pruning, harvest timing and milling practices can all influence the quantity and quality of the final product.",
      "The Mediterranean Harvest examines how these factors interact and why effective estate management requires attention to both agricultural performance and commercial realities.",
      "The session explores the journey from grove management to finished olive oil, considering the operational choices that affect productivity, quality, costs and market positioning. It also addresses the longer-term responsibilities involved in maintaining productive land and managing an estate through changing seasonal conditions.",
    ],

    sessionHeading:
      "From cultivation to commercial value.",

    sessions: [
      {
        title: "Grove management",
        description:
          "Examine cultivation practices, tree condition, pruning and the maintenance decisions that support the health and productive capacity of olive groves.",
      },
      {
        title: "Water and irrigation",
        description:
          "Explore how water availability, irrigation planning and seasonal conditions influence grove management, particularly where water resources require careful allocation.",
      },
      {
        title: "Harvest timing and execution",
        description:
          "Understand the considerations involved in choosing harvest dates, coordinating labour and equipment, and balancing fruit condition, oil quality and production requirements.",
      },
      {
        title: "Milling and oil quality",
        description:
          "Follow the production process from harvested olives to finished oil, examining milling practices, handling, storage and the factors that influence quality.",
      },
      {
        title: "Commercial positioning",
        description:
          "Consider how product quality, production costs, distribution channels, market demand and brand positioning affect the commercial prospects of olive oil.",
      },
      {
        title: "Long-term estate stewardship",
        description:
          "Explore the importance of soil management, water planning, infrastructure maintenance and responsible agricultural practices in sustaining productive capacity over time.",
      },
    ],

    experienceHeading:
      "A practical perspective on olive estate management.",

    experience: [
      "The briefing connects agricultural practices with the economics of operating an olive estate. Participants will examine why production volume alone does not determine commercial success and how quality, costs, timing and market access contribute to the overall outcome.",
      "The discussion also considers the uncertainties associated with weather, harvest variability, water availability and changing market conditions.",
    ],

    registrationHeading: "Enquire about the experience.",

    registrationText:
      "Request event details to obtain further information about the programme, participation arrangements and availability. Attendance is subject to confirmation.",

    disclosureHeading: "A long-term perspective",

    disclosure:
      "Agricultural productivity and commercial outcomes are not guaranteed. Olive estate operations may be affected by weather, pests, water restrictions, production costs, crop variability and changes in market demand.",
  },

  {
    slug: "beyond-the-vintage-bordeaux",
    title:
      "Beyond the Vintage: The Fine Wine Investment Perspective",
    date: "24 November 2026",
    dateISO: "2026-11-24",
    location: "Bordeaux, France",
    format: "Investment seminar and guided tasting",
    category: "Fine wine",
    eyebrow:
      "Fine Wine · Investment Seminar and Guided Tasting",
    image: "/images/hero/fine-wine-page-hero.jpg",

    summary:
      "An informed discussion of fine wine as a collectible asset, covering provenance, custody, valuation, liquidity and secondary-market dynamics. Explore the considerations involved in building and managing a collection over an extended holding period.",

    highlights: [
      ["Examine", "Asset quality and provenance"],
      ["Understand", "Valuation and liquidity"],
      ["Explore", "Collection management"],
    ],

    aboutHeading:
      "Looking beyond the reputation of a vintage.",

    about: [
      "Fine wine can attract collectors for its quality, scarcity, heritage and cultural significance. Assessing it from an investment perspective, however, requires a broader understanding of ownership, valuation, market access and the costs associated with holding a collection.",
      "Beyond the Vintage brings these considerations into focus through an investment seminar and guided tasting. The session examines how wine is assessed, how provenance and custody affect confidence in an asset, and why quoted valuations do not necessarily reflect the price an owner could realise through a sale.",
      "Participants will also explore the practical challenges of holding fine wine over an extended period, including storage, insurance, transaction costs and the possibility of limited liquidity.",
    ],

    sessionHeading:
      "The considerations behind a fine-wine collection.",

    sessions: [
      {
        title: "Provenance and authenticity",
        description:
          "Understand the importance of documented origin, ownership history, authenticity and reliable records when assessing collectible wines.",
      },
      {
        title: "Custody and storage",
        description:
          "Explore the role of professional storage, appropriate environmental conditions, inventory records and insurance in protecting a collection.",
      },
      {
        title: "Valuation methodology",
        description:
          "Examine the sources and methods used to assess fine-wine values, including comparable transactions, market quotations, valuation dates and the limitations of available data.",
      },
      {
        title: "Liquidity and secondary markets",
        description:
          "Consider how buyer demand, trading activity, transaction costs and market access influence the ability to sell a wine and the price that may be achieved.",
      },
      {
        title: "Building and managing a collection",
        description:
          "Explore selection criteria, concentration, holding periods, ongoing costs and the practical responsibilities associated with maintaining a collection.",
      },
      {
        title: "Risk and uncertainty",
        description:
          "Understand why fine-wine values can fluctuate and why authenticity, storage conditions, changing preferences and market conditions may affect outcomes.",
      },
    ],

    experienceHeading:
      "Specialist insight, supported by a guided tasting.",

    experience: [
      "The seminar combines an investment-focused discussion with a guided tasting to connect the characteristics of fine wine with the considerations involved in collecting and ownership.",
      "The objective is to develop a more complete understanding of fine wine as a tangible asset, including the distinctions between personal appreciation, market valuation and the ability to realise proceeds from a sale.",
    ],

    registrationHeading:
      "Take a more informed view of fine wine.",

    registrationText:
      "Register your interest to enquire about participation and receive further information about the event. Registration of interest does not guarantee admission; participation remains subject to availability and confirmation.",

    disclosureHeading: "Investment perspective",

    disclosure:
      "Fine wine is not a guaranteed source of returns. Valuations may be uncertain, sales may take time, and realised proceeds may be reduced by storage, insurance, transaction costs and market conditions. Past market performance does not guarantee future results.",
  },
];

export function getEvent(
  slug: string,
): TevuahEvent | undefined {
  return events.find((event) => event.slug === slug);
}