import { ArrowUpRight } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { featuredOpportunities } from "@/src/data/opportunities";

import { OpportunityCard } from "./opportunity-card";
import { SectionHeading } from "./section-heading";

export function FeaturedOpportunities() {
  return (
    <Section className="bg-white">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Featured opportunities"
            title="Explore what cultivated investing could look like."
            description="Review illustrative opportunities across vineyard estates, olive agriculture and agricultural infrastructure."
            className="max-w-4xl"
          />

          <Button
            href="/investments"
            variant="secondary"
            size="lg"
            className="w-fit shrink-0"
          >
            View all opportunities
            <ArrowUpRight className="size-4" />
          </Button>
        </div>

        <div className="mt-12 grid items-stretch gap-7 md:grid-cols-2 xl:grid-cols-3">
          {featuredOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
            />
          ))}
        </div>

        <div className="mt-8 flex gap-3 rounded-2xl border border-gold-500/25 bg-gold-500/5 px-5 py-5 sm:px-6">
          <span
            aria-hidden="true"
            className="mt-2 size-2 shrink-0 rounded-full bg-gold-600"
          />

          <p className="text-xs leading-6 text-stone-700">
            These opportunities, funding values, locations and classifications
            are illustrative content created for the Tevuah Reserve platform
            design. They are not live offerings and do not represent guaranteed
            returns or investment recommendations.
          </p>
        </div>
      </Container>
    </Section>
  );
}