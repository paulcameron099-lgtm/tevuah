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
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

type StatusItem = {
  title: string;
  completed: boolean;
  status: string;
};

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

function sectionLabel(
  section: string,
) {
  const labels:
    Record<string, string> = {
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

function sectionHref(
  section: string,
) {
  const routes:
    Record<string, string> = {
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
   * 1. Authenticate investor.
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
   * 2. Load profile + onboarding progress.
   */
  const admin =
    createAdminClient();

  const [
    profileResult,
    onboardingResult,
    complianceResult,
  ] = await Promise.all([
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

    admin
      .from(
        "compliance_reviews",
      )
      .select(
        `
        status,
        action_required_reason,
        rejection_reason
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),
  ]);

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

  if (complianceResult.error) {
    console.error(
      "Onboarding compliance load error:",
      complianceResult.error,
    );
  }

  const profile =
    profileResult.data;

  const onboarding =
    onboardingResult.data;

  const compliance =
    complianceResult.data;

  const editableSections =
  onboarding?.editable_sections ??
  [];

  const actionRequiredReason =
    compliance?.action_required_reason ??
    onboarding?.unlock_reason ??
    null;

  const rejectionReason =
    compliance?.rejection_reason ??
    null;

  /*
   * IMPORTANT:
   *
   * Final investor approval is represented by
   * profiles.onboarding_status = "approved".
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
   * 3. Build real onboarding status list.
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
   * 4. Decide button destination/text.
   */
  let actionHref =
    "/dashboard/onboarding/profile";

  let actionLabel =
    "Begin onboarding";

  if (
    onboarding?.current_step
  ) {
    actionHref =
      `/dashboard/onboarding/${onboarding.current_step}`;

    actionLabel =
      "Continue onboarding";
  }

  if (
    onboarding?.submitted_at
  ) {
    actionHref =
      "/dashboard/onboarding/review";

    actionLabel =
      "View submitted onboarding";
  }

  if (isApproved) {
    actionHref =
      "/dashboard/onboarding/review";

    actionLabel =
      "View verification details";
  }

  if (isActionRequired) {
    actionHref =
      "/dashboard/onboarding/review";

    actionLabel =
      "Review requested updates";
  }

  if (isRejected) {
    actionHref =
      "/dashboard/onboarding/review";

    actionLabel =
      "View compliance decision";
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="rounded-[1.75rem] border border-forest-900/10 bg-white p-7 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Onboarding status
        </p>

        {/*
         * APPROVED
         */}
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
              Your investor onboarding and verification
              information have been reviewed and approved
              by the Tevuah Reserve compliance team.
            </p>
          </>
        ) : isUnderReview ? (
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
          <>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
              <TriangleAlert className="size-4" />

              Action required
            </div>

            <h2 className="font-display mt-5 text-3xl font-semibold text-forest-950">
              Additional information is required.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
              The compliance team has requested an
              update to your onboarding information.
              Review the requested section and submit
              the required changes.
            </p>

            {editableSections.length > 0 ? (
            <div className="mt-6 rounded-[1.25rem] border border-red-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
                Sections requiring updates
              </p>

        <div className="mt-4 space-y-3">
          {editableSections.map(
            (section: string) => (
              <Button
                key={section}
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

        {actionRequiredReason ? (
          <div className="mt-5 border-t border-red-100 pt-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
              Compliance guidance
            </p>

            <p className="mt-2 text-sm leading-7 text-stone-600">
              {actionRequiredReason}
            </p>
          </div>
        ) : null}
      </div>
    ) : null}
          </>
        ) : isRejected ? (
          <>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
              <TriangleAlert className="size-4" />

              Verification not approved
            </div>

            <h2 className="font-display mt-5 text-3xl font-semibold text-forest-950">
              Your investor verification requires review.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
              Your current verification submission was not approved.
              The reason recorded by the compliance team is shown below.
            </p>

            {rejectionReason ? (
              <div className="mt-6 rounded-[1.25rem] border border-red-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
                  Reason for decision
                </p>

                <p className="mt-3 text-sm leading-7 text-red-900">
                  {rejectionReason}
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.25rem] border border-red-200 bg-white p-5">
                <p className="text-sm leading-7 text-red-900">
                  No rejection reason is currently available in the onboarding record.
                  Contact Tevuah Reserve for assistance.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Your investor account is not yet verified.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
              Complete each onboarding stage so Tevuah
              Reserve can determine which investment
              opportunities may be available to your
              account.
            </p>
          </>
        )}

        {isLocked &&
        !isApproved ? (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-amber-700" />

            <div>
              <p className="text-sm font-semibold text-amber-900">
                Onboarding locked
              </p>

              <p className="mt-1 text-xs leading-6 text-amber-800">
                {isActionRequired
                  ? "Your submitted onboarding remains locked overall. Only the sections listed in the compliance request are available for correction."
                  : isRejected
                    ? "Your onboarding package is locked after the compliance decision. An administrator must explicitly reopen selected sections before you can edit and resubmit."
                    : "Your submitted information is locked while compliance review is in progress."}
              </p>
            </div>
          </div>
        ) : null}

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
                      index +
                      1
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

        <Button
          href={
            actionHref
          }
          size="lg"
          className="mt-8"
        >
          {actionLabel}

          <ArrowRight className="size-4" />
        </Button>
      </div>

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
            (item) => (
              <div
                key={
                  item
                }
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