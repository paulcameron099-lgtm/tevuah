import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import {
  formatCurrency,
} from "@/src/lib/formatters";
import type { Opportunity } from "@/src/types/investment";

import { FundingProgress } from "./funding-progress";
import { OpportunityStatusBadge } from "./opportunity-status";

type OpportunityCardProps = {
  opportunity: Opportunity;
};

export function OpportunityCard({
  opportunity,
}: OpportunityCardProps) {
  const opportunityHref = `/opportunities/${opportunity.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-forest-900/10 bg-ivory-50 shadow-[0_18px_60px_rgba(10,23,18,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(10,23,18,0.11)]">
      <Link
        href={opportunityHref}
        aria-label={`View ${opportunity.title}`}
        className="relative block aspect-4/3 overflow-hidden bg-forest-900"
      >
        <Image
          src={opportunity.image}
          alt={`${opportunity.title} illustrative opportunity`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />

        <div className="absolute inset-0 bg-linear-to-t from-forest-950/75 via-transparent to-forest-950/15" />

        <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-4">
          <OpportunityStatusBadge status={opportunity.status} />

          <span className="rounded-full border border-white/20 bg-forest-950/40 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-md">
            Illustrative
          </span>
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold-400">
              {opportunity.categoryLabel}
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
              <MapPin className="size-4" />

              <span>{opportunity.location}</span>
            </div>
          </div>

          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition group-hover:border-gold-400 group-hover:bg-gold-500 group-hover:text-forest-950">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div>
          <h3 className="font-display text-[2rem] leading-[1.05] font-medium tracking-[-0.03em] text-forest-950">
            <Link
              href={opportunityHref}
              className="transition-colors hover:text-olive-700"
            >
              {opportunity.title}
            </Link>
          </h3>

          <p className="mt-4 text-sm leading-7 text-stone-700">
            {opportunity.summary}
          </p>
        </div>

        <div className="mt-7">
          <FundingProgress
            fundedAmount={opportunity.fundedAmount}
            fundingTarget={opportunity.fundingTarget}
            currency={opportunity.currency}
          />
        </div>

        <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 border-y border-forest-900/10 py-6">
          <div className="flex gap-3">
            <WalletCards className="mt-0.5 size-4 shrink-0 text-gold-600" />

            <div>
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-500">
                Minimum
              </dt>

              <dd className="mt-1 text-sm font-semibold text-forest-950">
                {formatCurrency(
                  opportunity.minimumInvestment,
                  opportunity.currency,
                )}
              </dd>
            </div>
          </div>

          <div className="flex gap-3">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-gold-600" />

            <div>
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-500">
                Duration
              </dt>

              <dd className="mt-1 text-sm font-semibold text-forest-950">
                {opportunity.duration}
              </dd>
            </div>
          </div>

          <div className="col-span-2 flex gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-600" />

            <div>
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-500">
                Illustrative risk classification
              </dt>

              <dd className="mt-1 text-sm font-semibold text-forest-950">
                {opportunity.riskLevel}
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-auto pt-6">
          <Link
            href={opportunityHref}
            className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800 hover:text-white"
          >
            View opportunity
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}