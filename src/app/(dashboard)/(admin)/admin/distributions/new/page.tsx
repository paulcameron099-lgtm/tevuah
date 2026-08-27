import {
  ArrowLeft,
  HandCoins,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  DistributionCreateForm,
} from "@/src/components/admin/distributions/distribution-create-form";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export default async function NewDistributionPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !== "admin" &&
    user.role !== "super_admin"
  ) {
    redirect("/dashboard");
  }

  const admin =
    createAdminClient();

  /*
   * Find only opportunities with funded positions.
   */
  const {
    data: positionRows,
    error: positionsError,
  } = await admin
    .from(
      "investment_positions",
    )
    .select(
      `
      opportunity_id,
      status
      `,
    )
    .in(
      "status",
      [
        "active",
        "matured",
      ],
    );

  if (positionsError) {
    console.error(
      "Distribution funded opportunity lookup error:",
      positionsError,
    );

    throw new Error(
      "Unable to load funded opportunities.",
    );
  }

  const opportunityIds =
    Array.from(
      new Set(
        (
          positionRows ??
          []
        ).map(
          (
            position,
          ) =>
            position.opportunity_id,
        ),
      ),
    );

  let opportunities: {
    id: string;

    title: string;

    asset_category:
      | string
      | null;

    total_funded: number;

    investor_count: number;

    status: string;
  }[] = [];

  if (
    opportunityIds.length >
    0
  ) {
    const {
      data,
      error,
    } = await admin
      .from(
        "investment_opportunities",
      )
      .select(
        `
        id,
        title,
        asset_category,
        total_funded,
        investor_count,
        status
        `,
      )
      .in(
        "id",
        opportunityIds,
      )
      .order(
        "title",
        {
          ascending:
            true,
        },
      );

    if (error) {
      console.error(
        "Distribution opportunities load error:",
        error,
      );

      throw new Error(
        "Unable to load funded opportunities.",
      );
    }

    opportunities =
      (
        data ??
        []
      ).map(
        (
          opportunity,
        ) => ({
          id:
            opportunity.id,

          title:
            opportunity.title,

          asset_category:
            opportunity.asset_category,

          total_funded:
            Number(
              opportunity.total_funded,
            ),

          investor_count:
            Number(
              opportunity.investor_count ??
                0,
            ),

          status:
            opportunity.status,
        }),
      );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/admin/distributions"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to distributions
      </Link>

      <div>
        <div className="flex size-11 items-center justify-center rounded-full bg-ivory-50">
          <HandCoins className="size-5 text-gold-600" />
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investor distributions
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Create Distribution
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Create a draft cash distribution for a
          funded investment opportunity. Investor
          allocations will be calculated during the
          review step.
        </p>
      </div>

      <DistributionCreateForm
        opportunities={
          opportunities.map(
            (
              opportunity,
            ) => ({
              id:
                opportunity.id,

              title:
                opportunity.title,

              assetCategory:
                opportunity.asset_category,

              totalFunded:
                opportunity.total_funded,

              investorCount:
                opportunity.investor_count,

              status:
                opportunity.status,
            }),
          )
        }
      />
    </div>
  );
}