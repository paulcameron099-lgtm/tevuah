import { AgTechSection } from "@/src/components/marketing/agtech-section";
import { AssetIntroduction } from "@/src/components/marketing/asset-introduction";
import { FeaturedOpportunities } from "@/src/components/marketing/featured-opportunities";
import { FinalCta } from "@/src/components/marketing/final-cta";
import { GovernanceSection } from "@/src/components/marketing/governance-section";
import { HomeHero } from "@/src/components/marketing/home-hero";
import { HowItWorks } from "@/src/components/marketing/how-it-works";
import { InsightsPreview } from "@/src/components/marketing/insights-preview";
import { InvestmentCategories } from "@/src/components/marketing/investment-categories";
import { TrustStrip } from "@/src/components/marketing/trust-strip";
import { WineSection } from "@/src/components/marketing/wine-section";

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <TrustStrip />
      <AssetIntroduction />
      <InvestmentCategories />
      <FeaturedOpportunities />
      <HowItWorks />
      <AgTechSection />
      <WineSection />
      <GovernanceSection />
      <InsightsPreview />
      <FinalCta />
    </main>
  );
}