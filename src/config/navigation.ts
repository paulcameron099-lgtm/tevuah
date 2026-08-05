
import type {
  NavigationGroup,
  NavigationItem,
} from "@/src/types/navigation";

export const mainNavigation: NavigationItem[] = [
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
  {
    label: "Insights",
    href: "/insights",
  },
];

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
        label: "Careers",
        href: "/careers",
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
        label: "Investor Education",
        href: "/investor-education",
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
        label: "AML Policy",
        href: "/aml-policy",
      },
      {
        label: "Complaints",
        href: "/complaints",
      },
    ],
  },
];