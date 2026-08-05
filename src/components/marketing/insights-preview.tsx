import { ArrowUpRight } from "lucide-react";

import { InsightCard } from "@/src/components/marketing/insight-card";
import { SectionHeading } from "@/src/components/marketing/section-heading";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { featuredInsights } from "@/src/data/insights";

export function InsightsPreview() {
  return (
    <Section className="bg-ivory-50">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Insights and perspectives"
            title="Knowledge from the field, cellar and investment process."
            description="Explore educational content about cultivated assets, estate operations, agricultural technology and long-term portfolio considerations."
            className="max-w-5xl"
          />

          <Button
            href="/insights"
            variant="secondary"
            size="lg"
            className="w-fit shrink-0"
          >
            View all insights
            <ArrowUpRight className="size-4" />
          </Button>
        </div>

        <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {featuredInsights.map((article, index) => (
            <InsightCard
              key={article.id}
              article={article}
              priority={index === 0}
            />
          ))}
        </div>

        <div className="mt-9 border-t border-forest-900/10 pt-7">
          <p className="max-w-4xl text-xs leading-6 text-stone-500">
            Articles published by Tevuah Reserve are intended for general
            information and investor education. They should not be presented
            as personalised financial, legal, tax or investment advice.
          </p>
        </div>
      </Container>
    </Section>
  );
}