
import type {
  NavigationGroup,
  NavigationItem,
} from "@/src/types/navigation";

export const mainNavigation = [
  {
    label: "About",
    href: "/about",
  },
  
  {
    label: "Investments",
    href: "/investments",
  },
  {
    label: "How It Works",
    href: "/how-it-works",
  },
  {
    label: "Our Estates",
    href: "/estates",
  },
  {
    label: "AgTech",
    href: "/agtech",
  },
  {
    label: "Fine Wine",
    href: "/fine-wine",
  },
] as const;

export const moreNavigation = [
  {
    label: "FAQ",
    href: "/faq",
    description:
      "Answers to common questions about investor access, opportunities and the investment process.",
  },
  {
    label: "Risk Disclosure",
    href: "/risk-disclosure",
    description:
      "Important information about the risks associated with private investments.",
  },
  {
    label: "Contact",
    href: "/contact",
    description:
      "Speak with Tevuah Reserve about opportunities, investor access and portfolio considerations.",
  },
  {
    label: "Insights",
    href: "/insights",
    description:
      "Perspectives on cultivated assets, agricultural technology, fine wine and private markets.",
  },
] as const;

export const mobileNavigation = [
  ...mainNavigation,
  ...moreNavigation.map(({ label, href }) => ({
    label,
    href,
  })),
] as const;

export const footerNavigation: NavigationGroup[] = [
  {
    title: "Invest",
    items: [
      {
        label: "Vineyard Estates",
        href: "/investments?category=vineyard",
      },
      {
        label: "Olive Estates",
        href: "/investments?category=olive",
      },
      {
        label: "AgTech",
        href: "/investments?category=agtech",
      },
      {
        label: "Fine Wine",
        href: "/investments?category=fine-wine",
      },
      {
        label: "All Opportunities",
        href: "/investments",
      },
    ],
  },
  {
    title: "Company",
    items: [
      {
        label: "About",
        href: "/about",
      },
      {
        label: "Our Estates",
        href: "/estates",
      },
      {
        label: "Insights",
        href: "/insights",
      },
      {
        label: "Contact",
        href: "/contact",
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        label: "How It Works",
        href: "/how-it-works",
      },
      {
        label: "Frequently Asked Questions",
        href: "/faqs",
      },
      {
        label: "Risk Disclosure",
        href: "/risk-disclosure",
      },
    ],
  },
  {
    title: "Legal",
    items: [
      {
        label: "Terms of Use",
        href: "/terms",
      },
      {
        label: "Privacy Policy",
        href: "/privacy",
      },
      {
        label: "Cookie Policy",
        href: "/cookies",
      },
      {
        label: "Complaints",
        href: "/complaints",
      },
    ],
  },
];
