import {
  CloudSun,
  Droplets,
  Gauge,
  Leaf,
  type LucideIcon,
} from "lucide-react";

export type AgTechMetric = {
  id: string;
  label: string;
  value: string;
  change: string;
  description: string;
  icon: LucideIcon;
  progress: number;
};

export const agTechMetrics: AgTechMetric[] = [
  {
    id: "soil-moisture",
    label: "Soil moisture",
    value: "68%",
    change: "Optimal range",
    description: "Illustrative root-zone reading",
    icon: Gauge,
    progress: 68,
  },
  {
    id: "irrigation",
    label: "Irrigation efficiency",
    value: "84%",
    change: "12% improvement",
    description: "Illustrative water-use efficiency",
    icon: Droplets,
    progress: 84,
  },
  {
    id: "crop-health",
    label: "Crop health",
    value: "92%",
    change: "Stable",
    description: "Illustrative vegetation index",
    icon: Leaf,
    progress: 92,
  },
  {
    id: "weather",
    label: "Growing conditions",
    value: "Good",
    change: "Next 7 days",
    description: "Illustrative forecast assessment",
    icon: CloudSun,
    progress: 78,
  },
];