import type { Estate } from "@/src/types/estate";

export const estates: Estate[] = [
  {
    id: "estate_val_dorcia",
    slug: "val-dorcia-vineyard-estate",
    name: "Val d’Orcia Vineyard Estate",
    estateType: "vineyard",
    estateTypeLabel: "Vineyard Estate",
    country: "Italy",
    region: "Tuscany",
    location: "Val d’Orcia, Tuscany, Italy",
    summary:
      "An illustrative Tuscan vineyard estate combining productive vines, agricultural infrastructure and long-term estate development.",
    description:
      "The Val d’Orcia Vineyard Estate is presented as a demonstration of how Tevuah Reserve can showcase productive agricultural assets with clear estate information, operational metrics, project context and related investment opportunities.",
    status: "Operating",
    totalHectares: 86,
    productiveHectares: 54,
    primaryCrop: "Wine grapes",
    established: "Illustrative 1998",
    heroImage: "/images/estates/val-dorcia/hero.jpg",
    cardImage: "/images/estates/val-dorcia/card.jpg",
    coordinates: {
      latitude: 43.058,
      longitude: 11.613,
    },
    metrics: [
      {
        label: "Total estate",
        value: "86 ha",
        description: "Illustrative total land area",
      },
      {
        label: "Productive vineyard",
        value: "54 ha",
        description: "Illustrative planted area",
      },
      {
        label: "Elevation",
        value: "320–410 m",
        description: "Illustrative elevation range",
      },
      {
        label: "Primary crop",
        value: "Wine grapes",
      },
    ],
    gallery: [
      {
        src: "/images/estates/val-dorcia/gallery-01.jpg",
        alt: "Illustrative vineyard rows in Tuscany",
      },
      {
        src: "/images/estates/val-dorcia/gallery-02.jpg",
        alt: "Illustrative Tuscan agricultural estate",
      },
      {
        src: "/images/estates/val-dorcia/gallery-03.jpg",
        alt: "Illustrative vineyard landscape",
      },
      {
        src: "/images/estates/val-dorcia/gallery-04.jpg",
        alt: "Illustrative estate operations",
      },
    ],
    infrastructure: [
      {
        title: "Vineyard blocks",
        description:
          "Illustrative productive blocks managed across multiple planting zones.",
      },
      {
        title: "Irrigation network",
        description:
          "Water-management infrastructure designed to support vineyard operations.",
      },
      {
        title: "Estate access",
        description:
          "Internal agricultural roads and operating access across the property.",
      },
      {
        title: "Storage and operations",
        description:
          "Illustrative facilities supporting tools, equipment and estate management.",
      },
    ],
    technology: [
      {
        title: "Soil monitoring",
        description:
          "Potential soil-moisture and field-condition monitoring across selected vineyard zones.",
      },
      {
        title: "Weather observations",
        description:
          "Estate-level weather data can support agricultural planning and investor reporting.",
      },
      {
        title: "Harvest reporting",
        description:
          "Production and harvest milestones can be published through the investor dashboard.",
      },
    ],
    relatedOpportunitySlugs: [
      "val-dorcia-vineyard-estate",
    ],
    featured: true,
  },

  {
    id: "estate_andalusia",
    slug: "andalusia-heritage-olive-estate",
    name: "Andalusia Heritage Olive Estate",
    estateType: "olive",
    estateTypeLabel: "Olive Estate",
    country: "Spain",
    region: "Andalusia",
    location: "Andalusia, Spain",
    summary:
      "An illustrative Mediterranean olive estate focused on productive groves, irrigation efficiency and premium agricultural operations.",
    description:
      "This estate profile demonstrates how Tevuah Reserve can present grove characteristics, infrastructure, production context and estate-level reporting for olive-focused agricultural assets.",
    status: "Operating",
    totalHectares: 124,
    productiveHectares: 96,
    primaryCrop: "Olives",
    established: "Illustrative 1987",
    heroImage: "/images/estates/andalusia/hero.jpg",
    cardImage: "/images/estates/andalusia/card.jpg",
    coordinates: {
      latitude: 37.544,
      longitude: -4.727,
    },
    metrics: [
      {
        label: "Total estate",
        value: "124 ha",
      },
      {
        label: "Productive groves",
        value: "96 ha",
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
        src: "/images/estates/andalusia/gallery-01.jpg",
        alt: "Illustrative olive grove landscape",
      },
      {
        src: "/images/estates/andalusia/gallery-02.jpg",
        alt: "Illustrative Mediterranean olive estate",
      },
      {
        src: "/images/estates/andalusia/gallery-03.jpg",
        alt: "Illustrative olive trees",
      },
      {
        src: "/images/estates/andalusia/gallery-04.jpg",
        alt: "Illustrative olive-estate operations",
      },
    ],
    infrastructure: [
      {
        title: "Productive groves",
        description:
          "Illustrative mature olive blocks across the estate.",
      },
      {
        title: "Drip irrigation",
        description:
          "Water distribution infrastructure supporting targeted grove irrigation.",
      },
      {
        title: "Harvest access",
        description:
          "Agricultural access routes supporting seasonal harvesting.",
      },
      {
        title: "Estate operations",
        description:
          "Illustrative storage and operating facilities.",
      },
    ],
    technology: [
      {
        title: "Water-use monitoring",
        description:
          "Illustrative reporting on irrigation volumes and grove-level efficiency.",
      },
      {
        title: "Crop observations",
        description:
          "Operational observations can be recorded throughout the growing cycle.",
      },
      {
        title: "Harvest metrics",
        description:
          "Yield and harvest information can feed future investor reports.",
      },
    ],
    relatedOpportunitySlugs: [
      "andalusia-heritage-olive-estate",
    ],
    featured: true,
  },

  {
    id: "estate_alentejo",
    slug: "alentejo-olive-estate",
    name: "Alentejo Olive Estate",
    estateType: "olive",
    estateTypeLabel: "Olive Estate",
    country: "Portugal",
    region: "Alentejo",
    location: "Alentejo, Portugal",
    summary:
      "An illustrative Portuguese olive estate combining productive agriculture with modern water infrastructure.",
    description:
      "The Alentejo estate demonstrates how agricultural infrastructure, land use, production zones and operating information can be presented alongside investment opportunities.",
    status: "Development",
    totalHectares: 148,
    productiveHectares: 105,
    primaryCrop: "Olives",
    established: "Illustrative development estate",
    heroImage: "/images/estates/alentejo/hero.jpg",
    cardImage: "/images/estates/alentejo/card.jpg",
    coordinates: {
      latitude: 38.015,
      longitude: -7.865,
    },
    metrics: [
      {
        label: "Total estate",
        value: "148 ha",
      },
      {
        label: "Productive area",
        value: "105 ha",
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
        src: "/images/estates/alentejo/gallery-01.jpg",
        alt: "Illustrative Alentejo agricultural estate",
      },
      {
        src: "/images/estates/alentejo/gallery-02.jpg",
        alt: "Illustrative Portuguese olive grove",
      },
      {
        src: "/images/estates/alentejo/gallery-03.jpg",
        alt: "Illustrative olive estate road",
      },
      {
        src: "/images/estates/alentejo/gallery-04.jpg",
        alt: "Illustrative agricultural operations",
      },
    ],
    infrastructure: [
      {
        title: "Irrigation expansion",
        description:
          "Illustrative development programme for targeted water infrastructure.",
      },
      {
        title: "Grove development",
        description:
          "Productive and developing olive blocks across the estate.",
      },
      {
        title: "Operating routes",
        description:
          "Internal agricultural access supporting estate activity.",
      },
    ],
    technology: [
      {
        title: "Irrigation reporting",
        description:
          "Illustrative water-use metrics for investor reporting.",
      },
      {
        title: "Field monitoring",
        description:
          "Potential sensor-assisted monitoring across productive blocks.",
      },
    ],
    relatedOpportunitySlugs: ["alentejo-olive-estate"],
    featured: false,
  },

  {
    id: "estate_rioja",
    slug: "rioja-vineyard-development",
    name: "Rioja Vineyard Development",
    estateType: "vineyard",
    estateTypeLabel: "Vineyard Estate",
    country: "Spain",
    region: "La Rioja",
    location: "La Rioja, Spain",
    summary:
      "An illustrative vineyard-development estate focused on planting, infrastructure and long-term productive capacity.",
    description:
      "This profile represents an estate still progressing through development, allowing Tevuah Reserve to communicate milestones, planted area and infrastructure build-out.",
    status: "Development",
    totalHectares: 72,
    productiveHectares: 26,
    primaryCrop: "Wine grapes",
    established: "Illustrative development programme",
    heroImage: "/images/estates/rioja/hero.jpg",
    cardImage: "/images/estates/rioja/card.jpg",
    coordinates: {
      latitude: 42.466,
      longitude: -2.445,
    },
    metrics: [
      {
        label: "Total estate",
        value: "72 ha",
      },
      {
        label: "Currently productive",
        value: "26 ha",
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
        src: "/images/estates/rioja/gallery-01.jpg",
        alt: "Illustrative Rioja vineyard",
      },
      {
        src: "/images/estates/rioja/gallery-02.jpg",
        alt: "Illustrative Spanish vineyard development",
      },
      {
        src: "/images/estates/rioja/gallery-03.jpg",
        alt: "Illustrative vineyard planting",
      },
      {
        src: "/images/estates/rioja/gallery-04.jpg",
        alt: "Illustrative vineyard landscape",
      },
    ],
    infrastructure: [
      {
        title: "Planting programme",
        description:
          "Illustrative phased development of additional vineyard blocks.",
      },
      {
        title: "Water infrastructure",
        description:
          "Agricultural water systems planned alongside new productive areas.",
      },
      {
        title: "Estate roads",
        description:
          "Access improvements supporting operations and future harvests.",
      },
    ],
    technology: [
      {
        title: "Development tracking",
        description:
          "Investor reporting can show planting and infrastructure milestones.",
      },
      {
        title: "Field observations",
        description:
          "Illustrative vineyard health and establishment data.",
      },
    ],
    relatedOpportunitySlugs: [
      "rioja-vineyard-development",
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