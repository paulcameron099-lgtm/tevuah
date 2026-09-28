import {
  ArrowLeft,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  InvestmentStructureSelector,
} from "@/src/components/investments/investment-structure-selector";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    opportunityId: string;
  }>;
};

export default async function SubscriptionPage({
  params,
}: PageProps) {
  /*
   * --------------------------------------------------
   * 1. CURRENT INVESTOR
   * --------------------------------------------------
   */
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !==
    "investor"
  ) {
    redirect("/dashboard");
  }

  /*
   * --------------------------------------------------
   * 2. ACCOUNT MUST BE ACTIVE
   * --------------------------------------------------
   */
  const access =
    await checkAccountAccess(
      user.id,
    );

  if (!access.allowed) {
    redirect(
      "/account-restricted",
    );
  }

  /*
   * --------------------------------------------------
   * 3. ONBOARDING MUST BE APPROVED
   * --------------------------------------------------
   */
  if (
    user.onboarding_status !==
    "approved"
  ) {
    redirect(
      "/dashboard/onboarding",
    );
  }

  const {
    opportunityId,
  } = await params;

  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------
   * 4. OPPORTUNITY MUST STILL BE PUBLICLY AVAILABLE
   * --------------------------------------------------
   *
   * Administrative close:
   *   status = closed
   *   -> opportunity is unavailable entirely.
   *
   * Fully funded:
   *   status may remain published
   *   funding_closed_at is persistent
   *   -> opportunity remains publicly visible,
   *      but no new investment can begin.
   */
  const {
    data: opportunity,
    error,
  } = await admin
    .from(
      "investment_opportunities",
    )
    .select(
      `
      id,
      slug,
      title,

      minimum_investment,
      funding_target,
      total_funded,

      status,
      funding_closed_at
      `,
    )
    .eq(
      "id",
      opportunityId,
    )
    .maybeSingle();

  if (
    error ||
    !opportunity ||
    opportunity.status !==
      "published" ||
    Boolean(
      opportunity.funding_closed_at,
    )
  ) {
    notFound();
  }

  /*
   * --------------------------------------------------
   * 5. AVAILABLE ALLOCATION
   * --------------------------------------------------
   */
  const fundingTargetCents =
    Number(
      opportunity.funding_target,
    );

  const totalFundedCents =
    Number(
      opportunity.total_funded,
    );

  const minimumInvestmentCents =
    Number(
      opportunity.minimum_investment,
    );

  const remainingAllocationCents =
    fundingTargetCents -
    totalFundedCents;

  /*
   * A subscription cannot begin when:
   *
   * 1. No allocation remains.
   * 2. Remaining allocation is below the
   *    opportunity minimum.
   *
   * The database/API must still enforce
   * these rules again when capital is
   * actually committed.
   */
  if (
    remainingAllocationCents <=
      0 ||
    remainingAllocationCents <
      minimumInvestmentCents
  ) {
    notFound();
  }

  const minimumInvestment =
    minimumInvestmentCents /
    100;

  const remainingAllocation =
    remainingAllocationCents /
    100;

  /*
   * --------------------------------------------------
   * 6. RENDER
   * --------------------------------------------------
   */
  return (
    <div className="space-y-8">
      <Link
        href={`/investments/${opportunity.slug}`}
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to opportunity
      </Link>

      <InvestmentStructureSelector
        opportunity={{
          id:
            opportunity.id,

          title:
            opportunity.title,

          minimumInvestment,

          remainingAllocation,
        }}
      />
    </div>
  );
}