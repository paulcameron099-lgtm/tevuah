import Image from "next/image";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

import { JourneyStepCard } from "@/src/components/marketing/journey-step-card";
import { SectionHeading } from "@/src/components/marketing/section-heading";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { investorJourneySteps } from "@/src/data/investor-journey";

const reviewPoints = [
  "Clear opportunity information",
  "Supporting documentation",
  "Visible project milestones",
  "Private investor reporting",
];

export function HowItWorks() {
  return (
    <Section className="overflow-hidden bg-ivory-100">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-end lg:gap-20">
          <SectionHeading
            eyebrow="How it works"
            title="A considered path from discovery to portfolio reporting."
            description="Tevuah Reserve is being designed to give investors a clear, structured journey through opportunity review, commitment and long-term monitoring."
          />

          <div className="lg:pb-2">
            <p className="max-w-xl text-sm leading-7 text-stone-700">
              Every genuine opportunity will require its own legal,
              operational and financial documentation. The platform experience
              should make that information easier to review without hiding the
              underlying risks.
            </p>

            <Button
              href="/how-it-works"
              variant="secondary"
              size="lg"
              className="mt-7"
            >
              Explore the investor journey
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-14 grid gap-9 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
          {investorJourneySteps.map((step, index) => (
            <JourneyStepCard
              key={step.number}
              step={step}
              isLast={index === investorJourneySteps.length - 1}
            />
          ))}
        </div>

        <div className="mt-16 grid overflow-hidden rounded-4xl bg-forest-950 text-white lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-105 lg:min-h-145">
            <Image
              src="/images/sections/how-it-works-estate-review.jpg"
              alt="An estate review representing the Tevuah Reserve investment process"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-linear-to-t from-forest-950/65 via-transparent to-forest-950/10" />

            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-forest-950/55 p-5 backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                Structured review
              </p>

              <p className="mt-3 text-sm leading-6 text-white/75">
                Opportunity presentation should support informed review, not
                replace independent judgement or professional advice.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Before commitment
            </p>

            <h3 className="font-display mt-5 text-4xl leading-[1.02] font-medium tracking-[-0.03em] sm:text-5xl">
              Understand the asset, structure and risks.
            </h3>

            <p className="mt-6 text-sm leading-7 text-white/65">
              Each opportunity should present the investment structure, use of
              funds, estate operator, project assumptions, fees, duration,
              risks and available documentation in one clear experience.
            </p>

            <ul className="mt-8 space-y-4">
              {reviewPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-3 text-sm text-white/80"
                >
                  <CheckCircle2 className="size-5 shrink-0 text-gold-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}