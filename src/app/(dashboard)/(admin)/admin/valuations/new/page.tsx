import {
  ArrowLeft,
  BarChart3,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  ValuationCreateForm,
} from "@/src/components/admin/valuations/valuation-create-form";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export default async function NewValuationPage() {
  /*
   * ==================================================
   * 1. ADMIN AUTH
   * ==================================================
   */
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
   * ==================================================
   * 2. FIND OPPORTUNITIES THAT ACTUALLY HAVE
   *    FUNDED POSITIONS
   * ==================================================
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
      "Valuation funded opportunity lookup error:",
      positionsError,
    );

    throw new Error(
      "Unable to load funded investment opportunities.",
    );
  }

  /*
   * Remove duplicate opportunity IDs.
   */
  const fundedOpportunityIds =
    Array.from(
      new Set(
        (
          positionRows ??
          []
        ).map(
          (position) =>
            position.opportunity_id,
        ),
      ),
    );

  /*
   * ==================================================
   * 3. LOAD OPPORTUNITY DETAILS
   * ==================================================
   */
  let opportunities: {
    id: string;

    title: string;

    asset_category:
      | string
      | null;

    funding_target: number;

    total_funded: number;

    investor_count: number;

    status: string;
  }[] = [];

  if (
    fundedOpportunityIds.length >
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
        funding_target,
        total_funded,
        investor_count,
        status
        `,
      )
      .in(
        "id",
        fundedOpportunityIds,
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
        "Valuation opportunities load error:",
        error,
      );

      throw new Error(
        "Unable to load funded investment opportunities.",
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

          funding_target:
            Number(
              opportunity.funding_target,
            ),

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

  /*
   * ==================================================
   * 4. RENDER
   * ==================================================
   */
  return (
    <div className="space-y-8">
      <Link
        href="/admin/valuations"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to valuations
      </Link>

      <div>
        <div className="flex size-11 items-center justify-center rounded-full bg-ivory-50">
          <BarChart3 className="size-5 text-gold-600" />
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Portfolio valuation
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Create Investment Valuation
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Create a draft valuation for a funded
          opportunity. Investor portfolio values will
          not change until the valuation is reviewed
          and explicitly published.
        </p>
      </div>

      <ValuationCreateForm
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

              fundingTarget:
                opportunity.funding_target,

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