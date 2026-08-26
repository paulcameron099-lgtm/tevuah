import {
  BadgeCheck,
  CircleDollarSign,
  FileSignature,
  Home,
  Scale,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export const onboardingSteps = [
  {
    id: "profile",
    number: 1,
    label: "Personal profile",
    href: "/dashboard/onboarding/profile",
    icon: UserRound,
  },
  {
    id: "identity",
    number: 2,
    label: "Identity verification",
    href: "/dashboard/onboarding/identity",
    icon: ShieldCheck,
  },
  {
    id: "address",
    number: 3,
    label: "Address verification",
    href: "/dashboard/onboarding/address",
    icon: Home,
  },
  {
    id: "eligibility",
    number: 4,
    label: "Investor eligibility",
    href: "/dashboard/onboarding/eligibility",
    icon: BadgeCheck,
  },
  {
    id: "suitability",
    number: 5,
    label: "Suitability",
    href: "/dashboard/onboarding/suitability",
    icon: Scale,
  },
  {
    id: "tax",
    number: 6,
    label: "Tax & IRS",
    href: "/dashboard/onboarding/tax",
    icon: CircleDollarSign,
  },
  {
    id: "review",
    number: 7,
    label: "Review & submit",
    href: "/dashboard/onboarding/review",
    icon: FileSignature,
  },
];