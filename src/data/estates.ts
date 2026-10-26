import type { Estate } from "@/src/types/estate";

export const estates: Estate[] = [
  {
    id: "estate_val_dorcia",
    slug: "Bordeaux_Grand_Cru_Vineyard_Estate",
    name: "Bordeaux Grand Cru Vineyard Estate",

    overviewHeading:
      "Established vineyard land with a long-term stewardship focus.",
    infrastructureHeading:
      "The physical systems supporting agricultural operations.",
    intelligenceHeading:
      "Agricultural reporting designed around the estate.",
    intelligenceDescription:
      "Estate reporting brings together field observations, production records and resource-use information to support operational oversight and informed assessment.",
    relatedInvestmentsHeading:
      "Explore the investment associated with this estate.",

    estateType: "vineyard",
    estateTypeLabel: "Vineyard Estate",
    country: "France",
    region: "Bordeaux Grand Cru",
    location: "Bordeaux Grand Cru Vineyard Estate",
    summary:
      "A Bordeaux vineyard estate focused on established wine-production infrastructure, productive vineyard land and long-term estate stewardship.",
    description:
      "The Bordeaux Grand Cru Vineyard Estate focuses on productive vineyard land, wine-production infrastructure and the agricultural management required to maintain long-term estate value. Its operating priorities include vineyard maintenance, resource management, production planning and the preservation of productive capacity.",
    status: "Operating",
    totalHectares: 145,
    productiveHectares: 92,
    primaryCrop: "Wine grapes",
    established: "1986",
    heroImage: "/images/estates/val-dorcia/card.jpeg",
    cardImage: "/images/estates/val-dorcia/card.jpeg",
    coordinates: {
      latitude: 43.058,
      longitude: 11.613,
    },
    metrics: [
      {
        label: "Total estate",
        value: "145 ha",
        description: "total land area",
      },
      {
        label: "Productive vineyard",
        value: "92 ha",
        description: "planted area",
      },
      {
        label: "Elevation",
        value: "320–410 m",
        description: "elevation range",
      },
      {
        label: "Primary crop",
        value: "Wine grapes",
      },
    ],
    gallery: [
      {
        src: "/images/estates/val-dorcia/gallery-01.jpeg",
        alt: "vineyard rows in Tuscany",
      },
      {
        src: "/images/estates/val-dorcia/gallery-02.jpeg",
        alt: "Tuscan agricultural estate",
      },
      {
        src: "/images/estates/val-dorcia/gallery-03.jpeg",
        alt: "vineyard landscape",
      },
      {
        src: "/images/estates/val-dorcia/gallery-04.jpeg",
        alt: "estate operations",
      },
    ],
    infrastructure: [
      {
        title: "Vineyard blocks",
        description:
          "Productive vineyard parcels support vine management, seasonal maintenance and harvest planning.",
      },
      {
        title: "Water and soil management",
        description:
          "Water distribution, drainage and soil monitoring support resource management and vineyard resilience.",
      },
      {
        title: "Production and storage",
        description:
          "Winery and storage facilities, where included in the estate's operating structure, support grape handling and wine production.",
      },
      {
        title: "Estate access",
        description:
          "Internal roads and equipment access support routine vineyard maintenance and seasonal operations.",
      },
    ],
    technology: [
      {
        title: "Soil monitoring",
        description:
          "Track soil conditions, moisture levels and field observations across vineyard parcels.",
      },
      {
        title: "Weather observations",
        description:
          "Review local weather information to support seasonal planning and vineyard management.",
      },
      {
        title: "Harvest metrics",
        description:
          "Record harvest timing, crop volumes and production milestones using estate operating records.",
      },
    ],
    relatedOpportunitySlugs: [
      "Bordeaux-Grand-Cru-Vineyard-Estate",
    ],
    featured: true,
  },

  {
    id: "estate_andalusia",
    slug: "Andalusia_Olive_Estate",
    name: "Andalusia Olive Estate",

    overviewHeading:
      "Productive olive agriculture with a focus on efficient estate operations.",
    infrastructureHeading:
      "The physical systems supporting agricultural operations.",
    intelligenceHeading:
      "Agricultural reporting designed around the estate.",
    intelligenceDescription:
      "Estate reporting connects field observations, water use and harvest records to support operational oversight and agricultural planning.",
    relatedInvestmentsHeading:
      "Explore opportunities associated with Andalusia.",

    estateType: "olive",
    estateTypeLabel: "Olive Estate",
    country: "Spain",
    region: "Andalusia",
    location: "Andalusia, Spain",
    summary:
      "An olive-growing estate in Andalusia focused on productive groves, agricultural infrastructure, efficient water management and long-term operating performance.",
    description:
      "The Andalusia Olive Estate focuses on commercial olive cultivation, agricultural infrastructure and the management of productive land. Estate priorities include grove maintenance, water efficiency, harvest planning and improvements to operating infrastructure that support long-term agricultural productivity.",
    status: "Operating",
    totalHectares: 380,
    productiveHectares: 310,
    primaryCrop: "Olives",
    established: "1978",
    heroImage: "/images/estates/andalusia/card.jpeg",
    cardImage: "/images/estates/andalusia/card.jpeg",
    coordinates: {
      latitude: 37.544,
      longitude: -4.727,
    },
    metrics: [
      {
        label: "Total estate",
        value: "320 ha",
      },
      {
        label: "Productive groves",
        value: "310 ha",
      },
      {
        label: "Irrigation",
        value: "Drip-supported",
      },
      {
        label: "Primary crop",
        value: "Olives",
      },
    ],
    gallery: [
      {
        src: "/images/estates/andalusia/gallery-01.jpeg",
        alt: "olive grove landscape",
      },
      {
        src: "/images/estates/andalusia/gallery-02.jpeg",
        alt: "Mediterranean olive estate",
      },
      {
        src: "/images/estates/andalusia/gallery-03.jpeg",
        alt: "olive trees",
      },
      {
        src: "/images/estates/andalusia/gallery-04.jpeg",
        alt: "olive-estate operations",
      },
    ],
    infrastructure: [
      {
        title: "Productive groves",
        description:
          "Managed olive-growing parcels support pruning, seasonal maintenance and harvest planning.",
      },
      {
        title: "Irrigation network",
        description:
          "Water distribution infrastructure supports irrigation management and efficient resource use.",
      },
      {
        title: "Harvest access",
        description:
          "Agricultural roads and equipment access support seasonal harvesting and movement of harvested olives.",
      },
      {
        title: "Storage and processing",
        description:
          "Storage facilities and access to suitable processing infrastructure support post-harvest handling and production workflows.",
      },
    ],
    technology: [
      {
        title: "Water-use monitoring",
        description:
          "Track irrigation activity and water consumption to support resource planning.",
      },
      {
        title: "Crop observations",
        description:
          "Record grove conditions, tree development and seasonal maintenance activity.",
      },
      {
        title: "Harvest metrics",
        description:
          "Monitor harvest timing, collected volumes and production outcomes using documented estate records.",
      },
    ],
    relatedOpportunitySlugs: [
      "Andalusia-Olive-Estate",
    ],
    featured: true,
  },

  {
    id: "estate_alentejo",
    slug: "Kalamata_Olive_Estate",
    name: "Kalamata Olive Estate",

    overviewHeading:
      "Olive-growing land with a focus on long-term agricultural productivity.",
    infrastructureHeading:
      "The physical systems supporting agricultural operations.",
    intelligenceHeading:
      "Agricultural reporting designed around the estate.",
    intelligenceDescription:
      "Agricultural reporting connects field observations with resource use, cultivation activities and seasonal production records.",
    relatedInvestmentsHeading:
      "Explore opportunities associated with the Kalamata region.",

    estateType: "olive",
    estateTypeLabel: "Olive Estate",
    country: "Greece",
    region: "Kalamata",
    location: "Kalamata, Greece",
    summary:
      "An olive-growing estate in the Kalamata region focused on agricultural development, productive land and infrastructure supporting long-term cultivation.",
    description:
      "The Kalamata Olive Estate focuses on olive cultivation, productive agricultural land and the infrastructure required to support efficient grove management. Its operating priorities include tree maintenance, soil care, water management and the coordination of harvesting and post-harvest activities.",
    status: "Development",
    totalHectares: 165,
    productiveHectares: 128,
    primaryCrop: "Olives",
    established: "1989",
    heroImage: "/images/estates/alentejo/card.jpeg",
    cardImage: "/images/estates/alentejo/card.jpeg",
    coordinates: {
      latitude: 38.015,
      longitude: -7.865,
    },
    metrics: [
      {
        label: "Total estate",
        value: "165 ha",
      },
      {
        label: "Productive area",
        value: "128 ha",
      },
      {
        label: "Development",
        value: "Expansion",
      },
      {
        label: "Primary crop",
        value: "Olives",
      },
    ],
    gallery: [
      {
        src: "/images/estates/alentejo/gallery-01.jpeg",
        alt: "Alentejo agricultural estate",
      },
      {
        src: "/images/estates/alentejo/gallery-02.jpeg",
        alt: "Portuguese olive grove",
      },
      {
        src: "/images/estates/alentejo/gallery-03.jpeg",
        alt: "olive estate road",
      },
      {
        src: "/images/estates/alentejo/gallery-04.jpeg",
        alt: "agricultural operations",
      },
    ],
    infrastructure: [
      {
        title: "Productive groves",
        description:
          "Olive-growing parcels support tree management, pruning, soil care and seasonal maintenance.",
      },
      {
        title: "Water and soil management",
        description:
          "Irrigation planning and soil-condition monitoring support resource management and grove development.",
      },
      {
        title: "Harvest operations",
        description:
          "Harvest planning, equipment access and handling arrangements support the collection and movement of olives.",
      },
      {
        title: "Storage and processing",
        description:
          "Storage arrangements and access to suitable olive-processing facilities support post-harvest handling.",
      },
    ],
    technology: [
      {
        title: "Field-condition monitoring",
        description:
          "Record observations on tree condition, soil moisture and grove maintenance.",
      },
      {
        title: "Weather observations",
        description:
          "Review seasonal weather information to support irrigation and harvest planning.",
      },
      {
        title: "Harvest reporting",
        description:
          "Track harvest timing, collected volumes and production records across productive parcels.",
      },
    ],
    relatedOpportunitySlugs: ["Kalamata-Olive-Estate"],
    featured: false,
  },

  {
    id: "estate_rioja",
    slug: "Napa_Valley_VineyardEstate",
    name: "Napa Valley Vineyard Estate",

    overviewHeading:
      "Premium vineyard land with a focus on productive capacity.",
    infrastructureHeading:
      "The physical systems supporting agricultural operations.",
    intelligenceHeading:
      "Agricultural reporting designed around the estate.",
    intelligenceDescription:
      "Structured reporting connects vineyard observations with operating records and seasonal production information.",
    relatedInvestmentsHeading:
      "Explore the investment associated with this estate.",

    estateType: "vineyard",
    estateTypeLabel: "Vineyard Estate",
    country: "United States",
    region: "Napa Valley",
    location: "Napa Valley, United States",
    summary:
      "A premium Napa Valley vineyard estate focused on expanding productive acreage, improving agricultural infrastructure and strengthening long-term production capacity.",
    description:
      "The Napa Valley Vineyard Estate focuses on vineyard cultivation, agricultural infrastructure and the operational requirements of premium wine production. Estate management priorities include productive acreage, crop quality, resource efficiency and infrastructure capable of supporting long-term agricultural operations.",
    status: "Development",
    totalHectares: 210,
    productiveHectares: 125,
    primaryCrop: "Wine grapes",
    established: "1994",
    heroImage: "/images/estates/rioja/card.jpeg",
    cardImage: "/images/estates/rioja/card.jpeg",
    coordinates: {
      latitude: 42.466,
      longitude: -2.445,
    },
    metrics: [
      {
        label: "Total estate",
        value: "210 ha",
      },
      {
        label: "Currently productive",
        value: "125 ha",
      },
      {
        label: "Planned planting",
        value: "18 ha",
      },
      {
        label: "Primary crop",
        value: "Wine grapes",
      },
    ],
    gallery: [
      {
        src: "/images/estates/rioja/gallery-01.jpeg",
        alt: " Rioja vineyard",
      },
      {
        src: "/images/estates/rioja/gallery-02.jpeg",
        alt: "Spanish vineyard development",
      },
      {
        src: "/images/estates/rioja/gallery-03.jpeg",
        alt: "vineyard planting",
      },
      {
        src: "/images/estates/rioja/gallery-04.jpeg",
        alt: "vineyard landscape",
      },
    ],
    infrastructure: [
      {
        title: "Vineyard management",
        description:
          "Vineyard parcels support planting management, seasonal maintenance and monitoring of vine development.",
      },
      {
        title: "Irrigation and water efficiency",
        description:
          "Irrigation infrastructure supports crop requirements and resource management in response to local conditions.",
      },
      {
        title: "Equipment and maintenance",
        description:
          "Agricultural equipment and maintenance facilities support routine fieldwork and seasonal operations.",
      },
      {
        title: "Production facilities",
        description:
          "Wine-production and post-harvest facilities, where included, support grape handling and production workflows.",
      },
    ],
    technology: [
      {
        title: "Field monitoring",
        description:
          "Record vineyard conditions, vine development and maintenance activity across productive parcels.",
      },
      {
        title: "Climate observations",
        description:
          "Review seasonal weather patterns relevant to crop planning and vineyard management.",
      },
      {
        title: "Harvest reporting",
        description:
          "Track harvest volumes, crop condition and production milestones using documented records.",
      },
    ],
    relatedOpportunitySlugs: [
      "Napa-Valley-Vineyard-Estate",
    ],
    featured: false,
  },
];

export const featuredEstates = estates.filter(
  (estate) => estate.featured,
);

export function getEstateBySlug(slug: string) {
  return estates.find((estate) => estate.slug === slug);
}

export const estateCountries = Array.from(
  new Set(estates.map((estate) => estate.country)),
).sort((a, b) => a.localeCompare(b));