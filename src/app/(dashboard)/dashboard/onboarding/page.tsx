import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { redirect } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase/server";

type StatusItem = {
  title: string;
  completed: boolean;
  status: string;
};

/*
 * Convert database status values such as:
 *
 * under_review -> Under Review
 * not_started  -> Not Started
 * approved     -> Approved
 */
function humanizeStatus(
  value: string | null | undefined,
) {
  if (!value) {
    return "Not started";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

/*
 * Convert editable section database keys
 * into labels that make sense to investors.
 */
function sectionLabel(
  section: string,
) {
  const labels: Record<
    string,
    string
  > = {
    profile:
      "Personal Information",

    identity:
      "Identity Verification",

    address:
      "Address Verification",

    eligibility:
      "Investor Eligibility",

    suitability:
      "Suitability Assessment",

    tax:
      "Tax & IRS Certification",
  };

  return (
    labels[section] ??
    section
  );
}

/*
 * Convert editable section database keys
 * into their onboarding page URLs.
 */
function sectionHref(
  section: string,
) {
  const routes: Record<
    string,
    string
  > = {
    profile:
      "/dashboard/onboarding/profile",

    identity:
      "/dashboard/onboarding/identity",

    address:
      "/dashboard/onboarding/address",

    eligibility:
      "/dashboard/onboarding/eligibility",

    suitability:
      "/dashboard/onboarding/suitability",

    tax:
      "/dashboard/onboarding/tax",
  };

  return (
    routes[section] ??
    "/dashboard/onboarding"
  );
}

export default async function InvestorOnboardingPage() {
  /*
   * --------------------------------------------------
   * 1. AUTHENTICATE INVESTOR
   * --------------------------------------------------
   */

  const supabase =
    await createClient();

  const {
    data: claimsData,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  /*
   * --------------------------------------------------
   * 2. LOAD PROFILE + ONBOARDING PROGRESS
   * --------------------------------------------------
   */

  const [
    profileResult,
    onboardingResult,
  ] = await Promise.all([
    /*
     * Investor profile/status information.
     */
    supabase
      .from("profiles")
      .select(
        `
        onboarding_status,
        kyc_status,
        eligibility_status,
        suitability_status,
        tax_status
        `,
      )
      .eq(
        "id",
        userId,
      )
      .maybeSingle(),

    /*
     * Investor onboarding progress.
     *
     * editable_sections contains the
     * sections reopened by compliance.
     *
     * unlock_reason contains the reason
     * supplied by compliance.
     */
    supabase
      .from(
        "investor_onboarding",
      )
      .select(
        `
        profile_completed,
        identity_completed,
        address_completed,
        eligibility_completed,
        suitability_completed,
        tax_completed,
        current_step,
        submitted_at,
        is_locked,
        editable_sections,
        unlock_reason
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),
  ]);

  /*
   * Log database errors during development.
   *
   * We don't crash the entire page because
   * the UI can still render sensible defaults.
   */
  if (profileResult.error) {
    console.error(
      "Onboarding profile load error:",
      profileResult.error,
    );
  }

  if (onboardingResult.error) {
    console.error(
      "Onboarding progress load error:",
      onboardingResult.error,
    );
  }

  const profile =
    profileResult.data;

  const onboarding =
    onboardingResult.data;

  /*
   * --------------------------------------------------
   * 3. READ REOPENED SECTIONS
   * --------------------------------------------------
   */

  const editableSections:
    string[] =
    Array.isArray(
      onboarding?.editable_sections,
    )
      ? onboarding.editable_sections
      : [];

  const unlockReason =
    typeof onboarding?.unlock_reason ===
    "string"
      ? onboarding.unlock_reason
      : null;

  /*
   * --------------------------------------------------
   * 4. DETERMINE FINAL ONBOARDING STATUS
   * --------------------------------------------------
   *
   * profiles.onboarding_status is our main
   * source for the investor's final status.
   */

  const onboardingStatus =
    profile?.onboarding_status ??
    "not_started";

  const isApproved =
    onboardingStatus ===
    "approved";

  const isUnderReview =
    onboardingStatus ===
    "under_review";

  const isActionRequired =
    onboardingStatus ===
    "action_required";

  const isRejected =
    onboardingStatus ===
    "rejected";

  const isLocked =
    Boolean(
      onboarding?.is_locked,
    );

  /*
   * --------------------------------------------------
   * 5. BUILD ONBOARDING CHECKLIST
   * --------------------------------------------------
   */

  const items: StatusItem[] = [
    {
      title:
        "Personal information",

      completed:
        Boolean(
          onboarding?.profile_completed,
        ),

      status:
        onboarding?.profile_completed
          ? "Completed"
          : "Not started",
    },

    {
      title:
        "Identity verification",

      completed:
        Boolean(
          onboarding?.identity_completed,
        ),

      status:
        humanizeStatus(
          profile?.kyc_status,
        ),
    },

    {
      title:
        "Address verification",

      completed:
        Boolean(
          onboarding?.address_completed,
        ),

      status:
        onboarding?.address_completed
          ? "Completed"
          : "Not started",
    },

    {
      title:
        "Investor eligibility",

      completed:
        Boolean(
          onboarding?.eligibility_completed,
        ),

      status:
        humanizeStatus(
          profile?.eligibility_status,
        ),
    },

    {
      title:
        "Suitability assessment",

      completed:
        Boolean(
          onboarding?.suitability_completed,
        ),

      status:
        humanizeStatus(
          profile?.suitability_status,
        ),
    },

    {
      title:
        "Tax & IRS certification",

      completed:
        Boolean(
          onboarding?.tax_completed,
        ),

      status:
        humanizeStatus(
          profile?.tax_status,
        ),
    },
  ];

  /*
   * --------------------------------------------------
   * 6. DETERMINE MAIN BUTTON
   * --------------------------------------------------
   */

  let actionHref =
    "/dashboard/onboarding/profile";

  let actionLabel =
    "Begin onboarding";

  /*
   * Normal onboarding progress.
   */
  if (
    onboarding?.current_step
  ) {
    actionHref =
      `/dashboard/onboarding/${onboarding.current_step}`;

    actionLabel =
      "Continue onboarding";
  }

  /*
   * Submitted package.
   */
  if (
    onboarding?.submitted_at
  ) {
    actionHref =
      "/dashboard/onboarding/review";

    actionLabel =
      "View submitted onboarding";
  }

  /*
   * Approved investor.
   */
  if (isApproved) {
    actionHref =
      "/dashboard/onboarding/review";

    actionLabel =
      "View verification details";
  }

  /*
   * If compliance requested changes,
   * send the investor directly to the
   * first reopened section.
   */
  if (
    isActionRequired &&
    editableSections.length > 0
  ) {
    actionHref =
      sectionHref(
        editableSections[0],
      );

    actionLabel =
      "Update requested information";
  }

  /*
   * --------------------------------------------------
   * 7. RENDER PAGE
   * --------------------------------------------------
   */

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* ==========================================
          MAIN ONBOARDING PANEL
      ========================================== */}

      <div className="rounded-[1.75rem] border border-forest-900/10 bg-white p-7 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Onboarding status
        </p>

        {/* ========================================
            APPROVED
        ======================================== */}

        {isApproved ? (
          <>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="size-4" />

              Verified investor
            </div>

            <h2 className="font-display mt-5 text-3xl font-semibold text-forest-950">
              Your investor account is verified.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
              Your investor onboarding and
              verification information have been
              reviewed and approved by the Tevuah
              Reserve compliance team.
            </p>
          </>
        ) : isUnderReview ? (
          /*
           * ========================================
           * UNDER REVIEW
           * ========================================
           */
          <>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <Clock3 className="size-4" />

              Under compliance review
            </div>

            <h2 className="font-display mt-5 text-3xl font-semibold text-forest-950">
              Your verification is under review.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
              Your completed onboarding package has
              been submitted to the Tevuah Reserve
              compliance team for review.
            </p>
          </>
        ) : isActionRequired ? (
          /*
           * ========================================
           * ACTION REQUIRED
           * ========================================
           */
          <>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
              <TriangleAlert className="size-4" />

              Action required
            </div>

            <h2 className="font-display mt-5 text-3xl font-semibold text-forest-950">
              Additional information is required.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
              The compliance team has requested
              changes to your onboarding
              information. Update only the sections
              listed below and resubmit them for
              review.
            </p>

            {/* Reopened sections */}

            {editableSections.length >
            0 ? (
              <div className="mt-6 rounded-[1.25rem] border border-red-200 bg-red-50/40 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
                  Sections requiring updates
                </p>

                <div className="mt-4 space-y-3">
                  {editableSections.map(
                    (
                      section,
                    ) => (
                      <Button
                        key={
                          section
                        }
                        href={sectionHref(
                          section,
                        )}
                        variant="secondary"
                        className="w-full justify-between"
                      >
                        <span>
                          {sectionLabel(
                            section,
                          )}
                        </span>

                        <span className="flex items-center gap-2">
                          <span className="text-xs">
                            Edit
                          </span>

                          <ArrowRight className="size-4" />
                        </span>
                      </Button>
                    ),
                  )}
                </div>

                {/* Compliance reason */}

                {unlockReason ? (
                  <div className="mt-5 border-t border-red-100 pt-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
                      Compliance guidance
                    </p>

                    <p className="mt-2 text-sm leading-7 text-stone-600">
                      {
                        unlockReason
                      }
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              /*
               * Fallback in case the status says
               * action_required but no sections
               * were stored.
               */
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  Compliance update pending
                </p>

                <p className="mt-1 text-xs leading-6 text-amber-800">
                  Your account requires additional
                  information, but no editable
                  onboarding section has been
                  assigned yet.
                </p>
              </div>
            )}
          </>
        ) : isRejected ? (
          /*
           * ========================================
           * REJECTED
           * ========================================
           */
          <>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
              <TriangleAlert className="size-4" />

              Verification not approved
            </div>

            <h2 className="font-display mt-5 text-3xl font-semibold text-forest-950">
              Your investor verification requires
              review.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
              Your current verification submission
              was not approved. Additional guidance
              will be provided through your account.
            </p>
          </>
        ) : (
          /*
           * ========================================
           * NOT STARTED / IN PROGRESS
           * ========================================
           */
          <>
            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Your investor account is not yet
              verified.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
              Complete each onboarding stage so
              Tevuah Reserve can determine which
              investment opportunities may be
              available to your account.
            </p>
          </>
        )}

        {/* ==========================================
            LOCKED NOTICE
        ========================================== */}

        {isLocked &&
        !isApproved &&
        !isActionRequired ? (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-amber-700" />

            <div>
              <p className="text-sm font-semibold text-amber-900">
                Onboarding locked
              </p>

              <p className="mt-1 text-xs leading-6 text-amber-800">
                Your submitted information is locked
                while compliance review is in
                progress.
              </p>
            </div>
          </div>
        ) : null}

        {/* ==========================================
            ONBOARDING CHECKLIST
        ========================================== */}

        <div className="mt-8 space-y-3">
          {items.map(
            (
              item,
              index,
            ) => (
              <div
                key={
                  item.title
                }
                className="flex items-center justify-between gap-5 rounded-xl border border-forest-900/10 bg-ivory-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-9 items-center justify-center rounded-full text-xs font-bold ${
                      item.completed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-white text-forest-950"
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-forest-950">
                      {
                        item.title
                      }
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      {
                        item.status
                      }
                    </p>
                  </div>
                </div>

                {item.completed ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : (
                  <Clock3 className="size-4 text-stone-400" />
                )}
              </div>
            ),
          )}
        </div>

        {/* ==========================================
            MAIN ACTION BUTTON
        ========================================== */}

        <Button
          href={actionHref}
          size="lg"
          className="mt-8"
        >
          {actionLabel}

          <ArrowRight className="size-4" />
        </Button>
      </div>

      {/* ==========================================
          RIGHT SIDEBAR
      ========================================== */}

      <aside className="rounded-[1.75rem] bg-forest-950 p-7 text-white">
        <ShieldCheck className="size-6 text-gold-400" />

        <h2 className="font-display mt-5 text-3xl font-semibold">
          Why we ask for this information.
        </h2>

        <p className="mt-4 text-sm leading-7 text-white/60">
          Verification information helps support
          identity, eligibility, tax and compliance
          requirements before investment access.
        </p>

        <div className="mt-7 space-y-4">
          {[
            "Identity verification",
            "Address verification",
            "Investor eligibility",
            "Suitability review",
            "Tax documentation",
          ].map(
            (
              item,
            ) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm text-white/70"
              >
                <CheckCircle2 className="size-4 text-gold-400" />

                {item}
              </div>
            ),
          )}
        </div>
      </aside>
    </div>
  );
} 