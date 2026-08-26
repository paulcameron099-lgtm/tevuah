import {
  ArrowLeft,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import { SubscriptionForm } from "@/src/components/investments/subscription-form";
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
   * 4. OPPORTUNITY MUST BE PUBLISHED
   * --------------------------------------------------
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

      status
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
      "published"
  ) {
    notFound();
  }

  /*
   * --------------------------------------------------
   * 5. AVAILABLE ALLOCATION
   * --------------------------------------------------
   */
  const remainingAllocationCents =
    Number(
      opportunity.funding_target,
    ) -
    Number(
      opportunity.total_funded,
    );

  if (
    remainingAllocationCents <=
    0
  ) {
    notFound();
  }

  const minimumInvestment =
    Number(
      opportunity.minimum_investment,
    ) / 100;

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

      <SubscriptionForm
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