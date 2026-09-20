"use client";

import {
  ArrowRight,
  Check,
  UserRound,
  UsersRound,
} from "lucide-react";

import Link from "next/link";

import {
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  SubscriptionForm,
} from "@/src/components/investments/subscription-form";

type Props = {
  opportunity: {
    id: string;
    title: string;
    minimumInvestment: number;
    remainingAllocation: number;
  };
};

type Structure =
  | "individual"
  | "joint";

export function InvestmentStructureSelector({
  opportunity,
}: Props) {
  const [
    structure,
    setStructure,
  ] =
    useState<Structure | null>(
      null,
    );

  if (
    structure ===
    "individual"
  ) {
    return (
      <div className="space-y-6">
        <BackToStructures
          onClick={() =>
            setStructure(
              null,
            )
          }
        />

        <SubscriptionForm
          opportunity={
            opportunity
          }
        />
      </div>
    );
  }

  if (
    structure === "joint"
  ) {
    return (
      <div className="space-y-6">
        <BackToStructures
          onClick={() =>
            setStructure(
              null,
            )
          }
        />

        <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
          <div className="bg-forest-950 p-6 text-white sm:p-8">
            <div className="flex size-11 items-center justify-center rounded-full bg-white/10">
              <UsersRound className="size-5 text-gold-400" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              Joint Investment
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
              Invest together,
              equally.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
              Create a joint
              investment with one
              other eligible Tevuah
              Reserve investor. Both
              members receive 50%
              ownership and are
              responsible for 50% of
              the total commitment.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <StructurePoint>
                50% ownership for
                each investor
              </StructurePoint>

              <StructurePoint>
                50% funding
                obligation for each
                investor
              </StructurePoint>

              <StructurePoint>
                Both investors must
                review and sign
              </StructurePoint>

              <StructurePoint>
                Each investor funds
                their own obligation
              </StructurePoint>
            </div>

            <Link
              href={`/dashboard/investments/joint/new?opportunity=${encodeURIComponent(
                opportunity.id,
              )}`}
              className="focus-ring mt-8 inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800"
            >
              Continue with joint
              investment

              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investment Structure
        </p>

        <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          How would you like
          to invest?
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
          Choose whether you
          want to make this
          investment individually
          or together with another
          eligible Tevuah Reserve
          investor.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ================================================
            INDIVIDUAL
        ================================================ */}

        <button
          type="button"
          onClick={() =>
            setStructure(
              "individual",
            )
          }
          className="focus-ring group cursor-pointer rounded-[1.75rem] border border-forest-900/10 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-forest-900/20 hover:shadow-lg sm:p-8"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-ivory-50 text-forest-950">
            <UserRound className="size-5" />
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            Individual
          </p>

          <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
            Invest on your own
          </h2>

          <p className="mt-3 text-sm leading-7 text-stone-600">
            You make the full
            commitment, complete
            the subscription
            yourself and own the
            resulting investment
            position.
          </p>

          <div className="mt-7 flex items-center justify-between border-t border-forest-900/10 pt-5">
            <span className="text-sm font-semibold text-forest-950">
              Select individual
            </span>

            <div className="flex size-9 items-center justify-center rounded-full bg-forest-950 text-white transition group-hover:bg-gold-500 group-hover:text-forest-950">
              <ArrowRight className="size-4" />
            </div>
          </div>
        </button>

        {/* ================================================
            JOINT
        ================================================ */}

        <button
          type="button"
          onClick={() =>
            setStructure(
              "joint",
            )
          }
          className="focus-ring group cursor-pointer overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-forest-950 p-6 text-left text-white transition hover:-translate-y-0.5 hover:shadow-lg sm:p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/10">
              <UsersRound className="size-5 text-gold-400" />
            </div>

            <span className="rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-gold-300">
              50 / 50
            </span>
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
            Joint
          </p>

          <h2 className="font-display mt-2 text-3xl font-semibold">
            Invest with another
            investor
          </h2>

          <p className="mt-3 text-sm leading-7 text-white/65">
            Create one shared
            investment with another
            eligible investor. Each
            member owns 50% and
            funds exactly half of
            the total commitment.
          </p>

          <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
            <span className="text-sm font-semibold">
              Select joint
            </span>

            <div className="flex size-9 items-center justify-center rounded-full bg-gold-400 text-forest-950 transition group-hover:bg-gold-300">
              <ArrowRight className="size-4" />
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}

function BackToStructures({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="focus-ring cursor-pointer text-sm font-semibold text-forest-950 transition hover:text-gold-700"
    >
      ← Change investment
      structure
    </button>
  );
}

function StructurePoint({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-ivory-50 p-4">
      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-forest-950 text-white">
        <Check className="size-3" />
      </div>

      <p className="text-sm leading-6 text-stone-600">
        {children}
      </p>
    </div>
  );
}