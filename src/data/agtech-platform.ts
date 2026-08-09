import {
  CloudSun,
  Droplets,
  Gauge,
  Leaf,
  RadioTower,
  Satellite,
  ScanLine,
  Sprout,
  type LucideIcon,
} from "lucide-react";

export type AgTechPillar = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type IntelligenceMetric = {
  id: string;
  label: string;
  value: string;
  unit?: string;
  status: string;
  progress: number;
  icon: LucideIcon;
};

export type MonitoringStep = {
  number: string;
  title: string;
  description: string;
};

export const agTechPillars: AgTechPillar[] = [
  {
    id: "field-monitoring",
    title: "Field monitoring",
    description:
      "Collect estate-level observations across soil, crop health, weather and agricultural conditions.",
    icon: ScanLine,
  },
  {
    id: "water-management",
    title: "Water management",
    description:
      "Track irrigation activity, resource usage and selected water-efficiency indicators.",
    icon: Droplets,
  },
  {
    id: "remote-observation",
    title: "Remote observation",
    description:
      "Use drone, satellite or aerial information to support broader estate visibility.",
    icon: Satellite,
  },
  {
    id: "sensor-networks",
    title: "Sensor networks",
    description:
      "Integrate field devices that can report environmental and infrastructure conditions.",
    icon: RadioTower,
  },
];

export const intelligenceMetrics: IntelligenceMetric[] = [
  {
    id: "soil-moisture",
    label: "Soil moisture",
    value: "68",
    unit: "%",
    status: "Optimal range",
    progress: 68,
    icon: Gauge,
  },
  {
    id: "irrigation-efficiency",
    label: "Irrigation efficiency",
    value: "84",
    unit: "%",
    status: "Stable",
    progress: 84,
    icon: Droplets,
  },
  {
    id: "crop-health",
    label: "Crop health index",
    value: "92",
    unit: "%",
    status: "Strong",
    progress: 92,
    icon: Leaf,
  },
  {
    id: "growing-conditions",
    label: "Growing conditions",
    value: "Good",
    status: "7-day outlook",
    progress: 78,
    icon: CloudSun,
  },
  {
    id: "development-progress",
    label: "Estate programme",
    value: "73",
    unit: "%",
    status: "On schedule",
    progress: 73,
    icon: Sprout,
  },
];

export const monitoringSteps: MonitoringStep[] = [
  {
    number: "01",
    title: "Collect",
    description:
      "Field devices, estate operators and approved external sources generate operational observations.",
  },
  {
    number: "02",
    title: "Validate",
    description:
      "Data should be timestamped, checked and linked to its source before appearing in investor reporting.",
  },
  {
    number: "03",
    title: "Interpret",
    description:
      "Raw readings are converted into understandable estate indicators, trends and project milestones.",
  },
  {
    number: "04",
    title: "Report",
    description:
      "Approved information can be presented through estate updates, investor dashboards and periodic reports.",
  },
];