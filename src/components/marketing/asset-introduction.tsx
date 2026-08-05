import { ArrowUpRight } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";

export function AssetIntroduction() {
  return (
    <Section
      id="introduction"
      className="overflow-hidden bg-ivory-100"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.55fr] lg:gap-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
              A cultivated perspective
            </p>
          </div>

          <div>
            <h2 className="font-display max-w-5xl text-balance text-4xl leading-[1.02] font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
              Real assets shaped by heritage and strengthened by modern
              intelligence.
            </h2>

            <div className="mt-8 grid gap-7 md:grid-cols-2">
              <p className="text-base leading-8 text-stone-700">
                Tevuah Reserve is being designed to connect investors with
                carefully presented opportunities across productive
                agriculture, estate development and fine-wine assets.
              </p>

              <p className="text-base leading-8 text-stone-700">
                Each opportunity will bring together clear documentation,
                operating information, project milestones and an investor
                experience built around long-term transparency.
              </p>
            </div>

            <div className="mt-9">
              <Button
                href="/how-it-works"
                variant="secondary"
                size="lg"
              >
                Understand our approach
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}