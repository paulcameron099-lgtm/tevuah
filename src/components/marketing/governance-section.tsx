import Image from "next/image";
import {
  ArrowUpRight,
  CheckCircle2,
  LockKeyhole,
  SearchCheck,
} from "lucide-react";

import { GovernanceCard } from "@/src/components/marketing/governance-card";
import { SectionHeading } from "@/src/components/marketing/section-heading";
import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { governancePrinciples } from "@/src/data/governance-principles";

const reviewStages = [
  "Asset and operator review",
  "Legal and structural review",
  "Financial assumptions",
  "Risk and disclosure preparation",
];

export function GovernanceSection() {
  return (
    <Section className="overflow-hidden bg-ivory-100">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Governance and trust"
            title="Trust should be supported by systems, evidence and oversight."
            description="A professional investment platform must make its review process, documentation, risks and operational controls visible—not merely rely on design or marketing claims."
            className="max-w-5xl"
          />

          <Button
            href="/about"
            variant="secondary"
            size="lg"
            className="w-fit shrink-0"
          >
            Learn about our approach
            <ArrowUpRight className="size-4" />
          </Button>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {governancePrinciples.map((principle, index) => (
            <GovernanceCard
              key={principle.id}
              principle={principle}
              index={index}
            />
          ))}
        </div>

        <div className="mt-16 grid overflow-hidden rounded-4xl border border-forest-900/10 bg-white lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-110 lg:min-h-155">
            <Image
              src="/images/sections/governance-estate-review.jpg"
              alt="Professional estate review representing Tevuah Reserve governance and due diligence"
              fill
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-linear-to-t from-forest-950/75 via-forest-950/15 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-forest-950/65 p-5 text-white backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-md">
              <div className="flex items-center gap-3">
                <SearchCheck className="size-5 text-gold-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                  Review before publication
                </p>
              </div>

              <p className="mt-4 text-sm leading-7 text-white/70">
                The platform should not present an opportunity as approved
                simply because basic information or attractive imagery has
                been uploaded.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-forest-950 text-gold-400">
                <LockKeyhole className="size-5" />
              </span>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
                Due-diligence framework
              </p>
            </div>

            <h3 className="font-display mt-6 text-balance text-4xl leading-[1.02] font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
              Review the opportunity before inviting investor capital.
            </h3>

            <p className="mt-6 text-base leading-8 text-stone-700">
              Before a real opportunity is published, Tevuah Reserve should
              have a defined internal process for reviewing the asset,
              operator, ownership structure, financial model, legal documents,
              fees and material risks.
            </p>

            <ul className="mt-8 space-y-4">
              {reviewStages.map((stage) => (
                <li
                  key={stage}
                  className="flex items-center gap-3 text-sm font-medium text-forest-950"
                >
                  <CheckCircle2 className="size-5 shrink-0 text-gold-600" />
                  {stage}
                </li>
              ))}
            </ul>

            <div className="mt-9 rounded-2xl border border-gold-500/25 bg-gold-500/5 p-5">
              <p className="text-xs leading-6 text-stone-700">
                The final governance and compliance process must be designed
                with qualified legal, financial and regulatory advisers for
                the jurisdictions where the platform, assets and investors are
                located.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}