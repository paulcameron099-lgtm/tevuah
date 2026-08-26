import {
  Users,
} from "lucide-react";

import { InvestorDirectory } from "@/src/components/admin/investors/investor-directory";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

/*
 * Supabase Auth users are paginated.
 *
 * We keep fetching until there are no
 * more users so the directory isn't
 * limited to only the first page.
 */
async function getAllAuthUsers() {
  const admin =
    createAdminClient();

  const perPage = 1000;

  let page = 1;

  const users: {
    id: string;
    email?: string;
    created_at: string;
    last_sign_in_at?: string;
    email_confirmed_at?: string;
  }[] = [];

  while (true) {
    const {
      data,
      error,
    } =
      await admin.auth.admin.listUsers({
        page,
        perPage,
      });

    if (error) {
      console.error(
        "Auth users load error:",
        error,
      );

      throw new Error(
        "Unable to load investor authentication records.",
      );
    }

    users.push(
      ...data.users.map(
        (user) => ({
          id:
            user.id,

          email:
            user.email,

          created_at:
            user.created_at,

          last_sign_in_at:
            user.last_sign_in_at,

          email_confirmed_at:
            user.email_confirmed_at,
        }),
      ),
    );

    /*
     * Fewer than perPage means
     * there are no more pages.
     */
    if (
      data.users.length <
      perPage
    ) {
      break;
    }

    page += 1;
  }

  return users;
}

export default async function AdminInvestorsPage() {
  /*
   * --------------------------------------------------
   * 1. ADMIN AUTHORIZATION
   * --------------------------------------------------
   */
  await requireAdmin();

  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------
   * 2. LOAD INVESTOR PROFILES
   * --------------------------------------------------
   */
  const {
    data: profiles,
    error: profilesError,
  } = await admin
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      phone,
      country,
      city,
      state,
      role,
      account_status,
      onboarding_status,
      kyc_status,
      tax_status,
      eligibility_status,
      suitability_status,
      created_at
      `,
    )
    .eq(
      "role",
      "investor",
    )
    .order(
      "created_at",
      {
        ascending:
          false,
      },
    );

  if (profilesError) {
    console.error(
      "Investor directory profile error:",
      profilesError,
    );

    throw new Error(
      "Unable to load investor profiles.",
    );
  }

  const investorProfiles =
    profiles ?? [];

  /*
   * --------------------------------------------------
   * 3. LOAD COMPLIANCE REVIEWS
   * --------------------------------------------------
   */
  const investorIds =
    investorProfiles.map(
      (profile) =>
        profile.id,
    );

  let complianceReviews: {
    user_id: string;
    status: string;
    submitted_at:
      | string
      | null;
    reviewed_at:
      | string
      | null;
  }[] = [];

  if (
    investorIds.length > 0
  ) {
    const {
      data,
      error,
    } = await admin
      .from(
        "compliance_reviews",
      )
      .select(
        `
        user_id,
        status,
        submitted_at,
        reviewed_at
        `,
      )
      .in(
        "user_id",
        investorIds,
      );

    if (error) {
      console.error(
        "Investor compliance load error:",
        error,
      );
    } else {
      complianceReviews =
        data ?? [];
    }
  }

  /*
   * --------------------------------------------------
   * 4. LOAD REAL SUPABASE AUTH EMAILS
   * --------------------------------------------------
   */
  const authUsers =
    await getAllAuthUsers();

  const authUserMap =
    new Map(
      authUsers.map(
        (user) => [
          user.id,
          user,
        ],
      ),
    );

  const complianceMap =
    new Map(
      complianceReviews.map(
        (review) => [
          review.user_id,
          review,
        ],
      ),
    );

  /*
   * --------------------------------------------------
   * 5. MERGE PROFILE + AUTH + COMPLIANCE
   * --------------------------------------------------
   */
  const investors =
    investorProfiles.map(
      (profile) => {
        const authUser =
          authUserMap.get(
            profile.id,
          );

        const compliance =
          complianceMap.get(
            profile.id,
          );

        return {
          id:
            profile.id,

          firstName:
            profile.first_name,

          lastName:
            profile.last_name,

          email:
            authUser?.email ??
            "Email unavailable",

          phone:
            profile.phone,

          country:
            profile.country,

          city:
            profile.city,

          state:
            profile.state,

          role:
            profile.role,

          accountStatus:
            profile.account_status ??
            "active",

          onboardingStatus:
            profile.onboarding_status ??
            "not_started",

          kycStatus:
            profile.kyc_status ??
            "not_started",

          taxStatus:
            profile.tax_status ??
            "not_started",

          eligibilityStatus:
            profile.eligibility_status ??
            "not_started",

          suitabilityStatus:
            profile.suitability_status ??
            "not_started",

          complianceStatus:
            compliance?.status ??
            "not_started",

          createdAt:
            profile.created_at,

          lastSignInAt:
            authUser?.last_sign_in_at ??
            null,

          emailConfirmed:
            Boolean(
              authUser?.email_confirmed_at,
            ),
        };
      },
    );

  /*
   * --------------------------------------------------
   * 6. DIRECTORY SUMMARY
   * --------------------------------------------------
   */
  const totalInvestors =
    investors.length;

  const approvedInvestors =
    investors.filter(
      (investor) =>
        investor.onboardingStatus ===
        "approved",
    ).length;

  const underReview =
    investors.filter(
      (investor) =>
        investor.onboardingStatus ===
        "under_review",
    ).length;

  const actionRequired =
    investors.filter(
      (investor) =>
        investor.onboardingStatus ===
        "action_required",
    ).length;

  /*
   * --------------------------------------------------
   * 7. RENDER
   * --------------------------------------------------
   */
  return (
    <div className="space-y-8">
      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Administration
          </p>

          <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
            Investor Directory
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
            Search investor accounts, review
            verification progress and access
            individual investor records.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-forest-900/10 bg-white px-4 py-2">
          <Users className="size-4 text-gold-600" />

          <span className="text-sm font-semibold text-forest-950">
            {totalInvestors}{" "}
            {totalInvestors === 1
              ? "Investor"
              : "Investors"}
          </span>
        </div>
      </div>

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total investors"
          value={
            totalInvestors
          }
        />

        <SummaryCard
          label="Verified"
          value={
            approvedInvestors
          }
        />

        <SummaryCard
          label="Under review"
          value={
            underReview
          }
        />

        <SummaryCard
          label="Action required"
          value={
            actionRequired
          }
        />
      </div>

      {/* ==========================================
          DIRECTORY
      ========================================== */}

      <InvestorDirectory
        investors={
          investors
        }
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="font-display mt-3 text-3xl font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}