import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Leaf,
  MapPin,
  Ruler,
} from "lucide-react";

import type { Estate } from "@/src/types/estate";

import { EstateStatusBadge } from "./estate-status-badge";

type EstateCardProps = {
  estate: Estate;
  priority?: boolean;
};

export function EstateCard({
  estate,
  priority = false,
}: EstateCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-forest-900/10 bg-white shadow-[0_18px_60px_rgba(10,23,18,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(10,23,18,0.1)]">
      <Link
        href={`/estates/${estate.slug}`}
        className="relative block aspect-4/3 overflow-hidden bg-forest-950"
      >
        <Image
          src={estate.cardImage}
          alt={`${estate.name} illustrative estate imagery`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
        />

        <div className="absolute inset-0 bg-linear-to-t from-forest-950/75 via-forest-950/15 to-transparent" />

        <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-4">
          <EstateStatusBadge status={estate.status} />

          <span className="rounded-full border border-white/20 bg-forest-950/40 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
            Illustrative
          </span>
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-5">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold-400">
              {estate.estateTypeLabel}
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
              <MapPin className="size-4" />
              {estate.region}, {estate.country}
            </div>
          </div>

          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition group-hover:border-gold-400 group-hover:bg-gold-500 group-hover:text-forest-950">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </Link>

      <div className="p-6 sm:p-7">
        <h2 className="font-display text-3xl leading-[1.02] font-medium tracking-[-0.03em] text-forest-950">
          <Link
            href={`/estates/${estate.slug}`}
            className="transition-colors hover:text-olive-700"
          >
            {estate.name}
          </Link>
        </h2>

        <p className="mt-4 text-sm leading-7 text-stone-700">
          {estate.summary}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-5 border-y border-forest-900/10 py-5">
          <div className="flex gap-3">
            <Ruler className="mt-0.5 size-4 shrink-0 text-gold-600" />

            <div>
              <dt className="text-[0.62rem] uppercase tracking-[0.13em] text-stone-500">
                Estate size
              </dt>

              <dd className="mt-1 text-sm font-semibold text-forest-950">
                {estate.totalHectares} ha
              </dd>
            </div>
          </div>

          <div className="flex gap-3">
            <Leaf className="mt-0.5 size-4 shrink-0 text-gold-600" />

            <div>
              <dt className="text-[0.62rem] uppercase tracking-[0.13em] text-stone-500">
                Productive
              </dt>

              <dd className="mt-1 text-sm font-semibold text-forest-950">
                {estate.productiveHectares} ha
              </dd>
            </div>
          </div>
        </dl>

        <Link
          href={`/estates/${estate.slug}`}
          className="focus-ring mt-6 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-forest-950 transition hover:text-olive-700"
        >
          Explore estate
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}