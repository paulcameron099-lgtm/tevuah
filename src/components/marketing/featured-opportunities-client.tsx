"use client";

import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
} from "lucide-react";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { Section } from "@/src/components/ui/section";
import { SectionHeading } from "./section-heading";

import { premiumEase } from "@/src/components/motion/premium-motion";

export type FeaturedOpportunity = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  asset_category: string;
  funding_target: number;
  minimum_investment: number;
  total_funded: number;
  expected_duration_months: number | null;
  target_return_min: number | null;
  target_return_max: number | null;
  coverImageUrl: string | null;
};

type FeaturedOpportunitiesClientProps = {
  opportunities: FeaturedOpportunity[];
  loadError?: boolean;
};

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(cents) / 100);
}

function returnDisplay(
  minimum: number | null,
  maximum: number | null,
) {
  if (minimum != null && maximum != null) {
    return `${minimum}%–${maximum}%`;
  }

  if (minimum != null) {
    return `${minimum}% target`;
  }

  if (maximum != null) {
    return `Up to ${maximum}%`;
  }

  return "See details";
}

function DataPoint({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function FeaturedInvestmentCard({
  opportunity,
}: {
  opportunity: FeaturedOpportunity;
}) {
  const target = opportunity.funding_target;
  const funded = opportunity.total_funded;

  const progress =
    target > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round((funded / target) * 100),
          ),
        )
      : 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(10,23,18,0.08)]">
      {/* COVER IMAGE */}

      <div className="h-52 shrink-0 overflow-hidden bg-forest-950">
        {opportunity.coverImageUrl ? (
          <img
            src={opportunity.coverImageUrl}
            alt={opportunity.title}
            className="size-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-white/30">
            <BriefcaseBusiness className="size-8" />
          </div>
        )}
      </div>

      {/* CONTENT */}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-forest-950 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white">
            {humanize(opportunity.asset_category)}
          </span>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-emerald-700">
            Open
          </span>
        </div>

        <h3 className="font-display mt-5 text-2xl font-semibold leading-tight text-forest-950">
          {opportunity.title}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-7 text-stone-600">
          {opportunity.short_description ??
            "Investment opportunity available through Tevuah Reserve."}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <DataPoint
            label="Target"
            value={formatMoney(
              opportunity.funding_target,
            )}
          />

          <DataPoint
            label="Minimum"
            value={formatMoney(
              opportunity.minimum_investment,
            )}
          />

          <DataPoint
            label="Duration"
            value={
              opportunity.expected_duration_months
                ? `${opportunity.expected_duration_months} months`
                : "—"
            }
          />

          <DataPoint
            label="Target return"
            value={returnDisplay(
              opportunity.target_return_min,
              opportunity.target_return_max,
            )}
          />
        </div>

        {/* FUNDING PROGRESS */}

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-forest-950">
              Funding progress
            </span>

            <span className="text-stone-500">
              {progress}%
            </span>
          </div>

          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-forest-900/10"
            role="progressbar"
            aria-label={`Funding progress for ${opportunity.title}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-gold-500 transition-[width] duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-stone-500">
            {formatMoney(opportunity.total_funded)} funded
          </p>

          <Link
            href={`/investments/${opportunity.slug}`}
            className="focus-ring mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
          >
            View opportunity

            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function FeaturedOpportunitiesClient({
  opportunities,
  loadError = false,
}: FeaturedOpportunitiesClientProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="overflow-hidden bg-white">
      <Container>
        {/* SECTION HEADING */}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            className="max-w-4xl"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 28 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true,
              amount: 0.35,
            }}
            transition={{
              duration: 0.85,
              ease: premiumEase,
            }}
          >
            <SectionHeading
              eyebrow="Featured opportunities"
              title="Explore opportunities across cultivated assets."
              description="Review currently available opportunities across fine wine, agricultural technology, vineyard estates and olive agriculture."
              className="max-w-4xl"
            />
          </motion.div>

          <motion.div
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 18 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true,
              amount: 0.6,
            }}
            transition={{
              duration: 0.7,
              delay: reduceMotion ? 0 : 0.08,
              ease: premiumEase,
            }}
          >
            <Button
              href="/investments"
              variant="secondary"
              size="lg"
              className="w-fit shrink-0"
            >
              View all opportunities

              <ArrowUpRight className="size-4" />
            </Button>
          </motion.div>
        </div>

        {/* REAL OPPORTUNITIES */}

        {opportunities.length > 0 ? (
          <motion.div
            className="mt-12 grid items-stretch gap-7 md:grid-cols-2 xl:grid-cols-4"
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.08,
            }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.11,
                  delayChildren: 0.08,
                },
              },
            }}
          >
            {opportunities.map((opportunity) => (
              <motion.div
                key={opportunity.id}
                className="h-full"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 32,
                    scale: 0.99,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 0.8,
                      ease: premiumEase,
                    },
                  },
                }}
              >
                <FeaturedInvestmentCard
                  opportunity={opportunity}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="mt-12 rounded-[1.75rem] border border-forest-900/10 bg-ivory-100 px-6 py-14 text-center"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 18 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.7,
              ease: premiumEase,
            }}
          >
            <BriefcaseBusiness className="mx-auto size-8 text-stone-400" />

            <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
              {loadError
                ? "Opportunities temporarily unavailable"
                : "No open opportunities currently available"}
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-600">
              {loadError
                ? "We could not load the latest opportunities. Please try again later."
                : "New opportunities will appear here when they become available."}
            </p>
          </motion.div>
        )}

        {/* DISCLOSURE */}

        <motion.div
          className="mt-8 flex gap-3 rounded-2xl border border-gold-500/25 bg-gold-500/5 px-5 py-5 sm:px-6"
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 15 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{
            once: true,
            amount: 0.5,
          }}
          transition={{
            duration: 0.7,
            ease: premiumEase,
          }}
        >
          <motion.span
            aria-hidden="true"
            className="mt-2 size-2 shrink-0 rounded-full bg-gold-600"
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [0.55, 1, 0.55],
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          />

          <p className="text-xs leading-6 text-stone-700">
            Investment availability, funding progress and
            supporting information are subject to change.
            Review the relevant opportunity documents,
            eligibility requirements and risk disclosures
            before making an investment decision.
          </p>
        </motion.div>
      </Container>
    </Section>
  );
}