export type EstateType = "vineyard" | "olive";

export type EstateStatus =
  | "Operating"
  | "Development"
  | "Illustrative";

export type EstateMetric = {
  label: string;
  value: string;
  description?: string;
};

export type EstateGalleryImage = {
  src: string;
  alt: string;
};

export type EstateInfrastructureItem = {
  title: string;
  description: string;
};

export type EstateTechnologyItem = {
  title: string;
  description: string;
};

export type Estate = {
  id: string;
  slug: string;
  name: string;
  estateType: EstateType;
  estateTypeLabel: string;
  country: string;
  region: string;
  location: string;
  summary: string;
  description: string;
  status: EstateStatus;
  totalHectares: number;
  productiveHectares: number;
  primaryCrop: string;
  established: string;
  heroImage: string;
  cardImage: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  metrics: EstateMetric[];
  gallery: EstateGalleryImage[];
  infrastructure: EstateInfrastructureItem[];
  technology: EstateTechnologyItem[];
  relatedOpportunitySlugs: string[];
  featured: boolean;
};