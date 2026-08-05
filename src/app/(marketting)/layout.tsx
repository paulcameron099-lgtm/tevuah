import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Footer } from "@/src/components/layout/footer";
import { Header } from "@/src/components/layout/header";
import { siteConfig } from "@/src/config/site";

type MarketingLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | Cultivated Asset Investments`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Explore vineyard estates, olive agriculture, AgTech infrastructure and fine-wine opportunities through a premium investor platform.",
  openGraph: {
    title: `${siteConfig.name} | Cultivated Asset Investments`,
    description:
      "A premium investment platform focused on vineyard estates, olive agriculture, AgTech infrastructure and fine wine.",
    images: [
      {
        url: "/images/hero/tevuah-vineyard-hero.jpg",
        width: 2400,
        height: 1600,
        alt: "Tevuah Reserve vineyard landscape",
      },
    ],
  },
};

export default function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <div className="min-h-screen">
      <Header />
      {children}
      <Footer />
    </div>
  );
}