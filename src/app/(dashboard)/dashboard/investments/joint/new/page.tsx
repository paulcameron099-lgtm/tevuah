import {
  ArrowLeft,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  JointInvestmentCreationForm,
} from "@/src/components/investments/joint-investment-creation-form";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type SearchParams = {
  opportunity?: string;
};

export default async function NewJointInvestmentPage({
  searchParams,
}: {
  searchParams:
    Promise<SearchParams>;
}) {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

if (
  user.role !==
  "investor"
) {
  redirect("/dashboard");
}

  const {
    opportunity: opportunityId,
  } =
    await searchParams;

  if (!opportunityId) {
    redirect("/investments");
  }

  const admin =
    createAdminClient();

  const {
    data: opportunity,
    error,
  } =
    await admin
      .from(
        "investment_opportunities",
      )
      .select(
        `
          id,
          title,
          slug,
          asset_category,
          location,
          currency,
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
    !opportunity
  ) {
    console.error(
      "Joint investment opportunity lookup error:",
      error,
    );

    notFound();
  }

  if (
    opportunity.status !==
    "published"
  ) {
    return (
      <UnavailableOpportunity />
    );
  }

  const remainingCapacity =
    Math.max(
      0,
      Number(
        opportunity.funding_target,
      ) -
        Number(
          opportunity.total_funded,
        ),
    );

  return (
    <div className="min-h-screen bg-[#f7f6f1]">
      <div className="border-b border-forest-900/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-10">
          <Link
            href={`/investments/${opportunity.slug}`}
            className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-forest-950 transition hover:text-gold-700"
          >
            <ArrowLeft className="size-4" />

            Back to opportunity
          </Link>

          <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400 sm:flex">
            <ShieldCheck className="size-4 text-gold-600" />

            Secure investment setup
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <section className="overflow-hidden rounded-4xl bg-forest-950 text-white">
          <div className="relative px-6 py-9 sm:px-9 sm:py-11 lg:px-12">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl" />

            <div className="relative max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <UsersRound className="size-3.5 text-gold-300" />

                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold-300">
                  Joint Investment
                </span>
              </div>

              <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
                Build your joint
                investment
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
                Invest alongside one
                other verified Tevuah
                Reserve investor with
                equal 50/50 ownership
                and equal funding
                responsibility.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8">
         <JointInvestmentCreationForm
  opportunity={{
    id: opportunity.id,
    title: opportunity.title,
    slug: opportunity.slug,
    assetCategory: opportunity.asset_category,
    location: opportunity.location,
    currency: opportunity.currency,
    minimumInvestmentCents: Number(
      opportunity.minimum_investment,
    ),
    remainingCapacityCents: Math.max(
      0,
      Number(opportunity.funding_target) -
        Number(opportunity.total_funded),
    ),
  }}
/>
        </div>
      </main>
    </div>
  );
}

function UnavailableOpportunity() {
  return (
    <div className="min-h-screen bg-[#f7f6f1] px-5 py-16">
      <div className="mx-auto max-w-xl rounded-4xl border border-forest-900/10 bg-white p-8 text-center">
        <h1 className="font-display text-3xl font-semibold text-forest-950">
          Joint investment unavailable
        </h1>

        <p className="mt-3 text-sm leading-7 text-stone-600">
          This opportunity is not
          currently accepting new
          investments.
        </p>

        <Link
          href="/investments"
          className="focus-ring mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-forest-950 px-5 text-sm font-semibold text-white"
        >
          Browse investments
        </Link>
      </div>
    </div>
  );
}