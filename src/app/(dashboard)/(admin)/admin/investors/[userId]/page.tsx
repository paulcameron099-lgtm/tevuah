import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Mail,
  MapPin,
  Phone,
  PiggyBank,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import { AdminInvestorCashAccountButton } from "@/src/components/admin/investors/admin-investor-cash-account-button";
import { InvestorAccountActions } from "@/src/components/admin/investors/investor-account-actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function AdminInvestorDetailPage({
  params,
}: PageProps) {
  /*
   * --------------------------------------------------
   * 1. ADMIN AUTHORIZATION
   * --------------------------------------------------
   */
  await requireAdmin();

  const {
    userId,
  } = await params;

  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------
   * 2. LOAD INVESTOR PROFILE
   * --------------------------------------------------
   */
  const {
    data: profile,
    error: profileError,
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
      postal_code,
      profession,
      nationality,
      date_of_birth,
      role,
      avatar_url,
      account_status,
      onboarding_status,
      kyc_status,
      tax_status,
      eligibility_status,
      suitability_status,
      created_at,
      updated_at
      `,
    )
    .eq(
      "id",
      userId,
    )
    .maybeSingle();

  if (
    profileError ||
    !profile
  ) {
    console.error(
      "Investor profile load error:",
      profileError,
    );

    notFound();
  }

  /*
   * This page is intended for investor
   * accounts only.
   */
  if (
    profile.role !==
    "investor"
  ) {
    notFound();
  }

  /*
   * --------------------------------------------------
   * 3. LOAD AUTH USER
   * --------------------------------------------------
   */
  const {
    data: authUserData,
    error: authUserError,
  } =
    await admin.auth.admin.getUserById(
      userId,
    );

  if (authUserError) {
    console.error(
      "Investor Auth user load error:",
      authUserError,
    );
  }

  const authUser =
    authUserData.user;

  const investorEmail =
    authUser?.email ??
    "Email unavailable";

  /*
   * --------------------------------------------------
   * 4. LOAD COMPLIANCE + ONBOARDING
   * --------------------------------------------------
   */
  const [
    complianceResult,
    onboardingResult,
  ] = await Promise.all([
    admin
      .from(
        "compliance_reviews",
      )
      .select(
        `
        user_id,
        status,
        rejection_reason,
        action_required_reason,
        assigned_admin_id,
        submitted_at,
        reviewed_at,
        created_at,
        updated_at
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),

    admin
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
        unlock_reason,
        locked_at
        `,
      )
      .eq(
        "user_id",
        userId,
      )
      .maybeSingle(),
  ]);

  if (
    complianceResult.error
  ) {
    console.error(
      "Investor compliance load error:",
      complianceResult.error,
    );
  }

  if (
    onboardingResult.error
  ) {
    console.error(
      "Investor onboarding load error:",
      onboardingResult.error,
    );
  }

  const compliance =
    complianceResult.data;

  const onboarding =
    onboardingResult.data;

  /*
   * --------------------------------------------------
   * 5. BUILD DISPLAY VALUES
   * --------------------------------------------------
   */
  const investorName =
    [
      profile.first_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Investor";

  const location =
    [
      profile.city,
      profile.state,
      profile.country,
    ]
      .filter(Boolean)
      .join(", ") ||
    "Not provided";

  const onboardingItems = [
    {
      label:
        "Personal information",

      completed:
        Boolean(
          onboarding?.profile_completed,
        ),
    },

    {
      label:
        "Identity verification",

      completed:
        Boolean(
          onboarding?.identity_completed,
        ),
    },

    {
      label:
        "Address verification",

      completed:
        Boolean(
          onboarding?.address_completed,
        ),
    },

    {
      label:
        "Investor eligibility",

      completed:
        Boolean(
          onboarding?.eligibility_completed,
        ),
    },

    {
      label:
        "Suitability assessment",

      completed:
        Boolean(
          onboarding?.suitability_completed,
        ),
    },

    {
      label:
        "Tax & IRS certification",

      completed:
        Boolean(
          onboarding?.tax_completed,
        ),
    },
  ];

  const completedCount =
    onboardingItems.filter(
      (item) =>
        item.completed,
    ).length;

  /*
   * --------------------------------------------------
   * 6. RENDER
   * --------------------------------------------------
   */
  return (
    <div className="space-y-8">
      {/* ==========================================
          BACK LINK
      ========================================== */}

      <Link
        href="/admin/investors"
        className="inline-flex items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to investors
      </Link>

      {/* ==========================================
          HEADER
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-forest-950 text-lg font-bold text-white">
              {initials(
                profile.first_name,
                profile.last_name,
              )}
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                Investor account
              </p>

              <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.035em] text-forest-950">
                {
                  investorName
                }
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusBadge
                  label="Account"
                  status={
                    profile.account_status ??
                    "active"
                  }
                />

                <StatusBadge
                  label="Verification"
                  status={
                    profile.onboarding_status ??
                    "not_started"
                  }
                />

                <StatusBadge
                  label="Compliance"
                  status={
                    compliance?.status ??
                    "not_started"
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <AdminInvestorCashAccountButton
              investorId={profile.id}
            />

            <Link
              href={`/admin/investors/${userId}/retirement-accounts`}
              className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-forest-900/10 bg-white px-5 text-sm font-semibold text-forest-950 transition hover:bg-ivory-50"
            >
              <PiggyBank className="size-4" />

              Retirement accounts
            </Link>

            <Link
              href={`/admin/compliance/${userId}`}
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-forest-900/10 bg-white px-5 text-sm font-semibold text-forest-950 transition hover:bg-ivory-50"
            >
              <ShieldCheck className="size-4" />

              Compliance review
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================
          PROFILE + ACCOUNT CONTROL
      ========================================== */}

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Investor profile
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Account information
            </h2>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <ProfileItem
              icon={
                Mail
              }
              label="Email"
              value={
                investorEmail
              }
            />

            <ProfileItem
              icon={
                Phone
              }
              label="Phone"
              value={
                profile.phone ??
                "Not provided"
              }
            />

            <ProfileItem
              icon={
                MapPin
              }
              label="Location"
              value={
                location
              }
            />

            <ProfileItem
              icon={
                UserRound
              }
              label="Profession"
              value={
                profile.profession ??
                "Not provided"
              }
            />

            <ProfileItem
              icon={
                CalendarDays
              }
              label="Date of birth"
              value={
                profile.date_of_birth ??
                "Not provided"
              }
            />

            <ProfileItem
              icon={
                BadgeCheck
              }
              label="Nationality"
              value={
                profile.nationality ??
                "Not provided"
              }
            />
          </div>

          <div className="mt-8 border-t border-forest-900/10 pt-7">
            <div className="grid gap-5 sm:grid-cols-3">
              <DataPoint
                label="Joined"
                value={
                  formatDate(
                    profile.created_at,
                  )
                }
              />

              <DataPoint
                label="Email status"
                value={
                  authUser?.email_confirmed_at
                    ? "Confirmed"
                    : "Unconfirmed"
                }
              />

              <DataPoint
                label="Last sign-in"
                value={
                  authUser?.last_sign_in_at
                    ? formatDateTime(
                        authUser.last_sign_in_at,
                      )
                    : "Never"
                }
              />
            </div>
          </div>
        </section>

        {/* ========================================
            ACCOUNT ACTIONS
        ======================================== */}

        <InvestorAccountActions
          userId={
            userId
          }
          investorName={
            investorName
          }
          currentStatus={
            profile.account_status ??
            "active"
          }
        />
      </div>

      {/* ==========================================
          VERIFICATION SUMMARY
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Verification
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Verification summary
        </h2>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <VerificationCard
            label="Identity / KYC"
            status={
              profile.kyc_status ??
              "not_started"
            }
          />

          <VerificationCard
            label="Eligibility"
            status={
              profile.eligibility_status ??
              "not_started"
            }
          />

          <VerificationCard
            label="Suitability"
            status={
              profile.suitability_status ??
              "not_started"
            }
          />

          <VerificationCard
            label="Tax & IRS"
            status={
              profile.tax_status ??
              "not_started"
            }
          />
        </div>
      </section>

      {/* ==========================================
          ONBOARDING PROGRESS
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Investor onboarding
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Onboarding progress
            </h2>
          </div>

          <div className="rounded-full border border-forest-900/10 bg-ivory-50 px-4 py-2 text-sm font-semibold text-forest-950">
            {completedCount}/
            {onboardingItems.length}{" "}
            completed
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {onboardingItems.map(
            (item) => (
              <div
                key={
                  item.label
                }
                className="flex items-center justify-between gap-4 rounded-xl border border-forest-900/10 bg-ivory-50 p-4"
              >
                <span className="text-sm font-semibold text-forest-950">
                  {
                    item.label
                  }
                </span>

                {item.completed ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="size-4" />

                    Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                    <Clock3 className="size-4" />

                    Incomplete
                  </span>
                )}
              </div>
            ),
          )}
        </div>

        <div className="mt-7 grid gap-5 border-t border-forest-900/10 pt-6 sm:grid-cols-3">
          <DataPoint
            label="Current step"
            value={
              humanize(
                onboarding?.current_step ??
                "not_started",
              )
            }
          />

          <DataPoint
            label="Submitted"
            value={
              onboarding?.submitted_at
                ? formatDateTime(
                    onboarding.submitted_at,
                  )
                : "Not submitted"
            }
          />

          <DataPoint
            label="Package lock"
            value={
              onboarding?.is_locked
                ? "Locked"
                : "Editable"
            }
          />
        </div>
      </section>

      {/* ==========================================
          COMPLIANCE SUMMARY
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Compliance
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Compliance review
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Review the investor&apos;s full identity,
              tax, suitability and compliance package
              from the compliance workspace.
            </p>
          </div>

          <StatusBadge
            label="Status"
            status={
              compliance?.status ??
              "not_started"
            }
          />
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-3">
          <DataPoint
            label="Submitted"
            value={
              compliance?.submitted_at
                ? formatDateTime(
                    compliance.submitted_at,
                  )
                : "Not submitted"
            }
          />

          <DataPoint
            label="Reviewed"
            value={
              compliance?.reviewed_at
                ? formatDateTime(
                    compliance.reviewed_at,
                  )
                : "Not reviewed"
            }
          />

          <DataPoint
            label="Assigned admin"
            value={
              compliance?.assigned_admin_id ??
              "Unassigned"
            }
          />
        </div>

        {compliance?.action_required_reason ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
              Information requested
            </p>

            <p className="mt-2 text-sm leading-7 text-amber-900">
              {
                compliance.action_required_reason
              }
            </p>
          </div>
        ) : null}

        {compliance?.rejection_reason ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-700">
              Rejection reason
            </p>

            <p className="mt-2 text-sm leading-7 text-red-900">
              {
                compliance.rejection_reason
              }
            </p>
          </div>
        ) : null}

        <Link
          href={`/admin/compliance/${userId}`}
          className="focus-ring mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800"
        >
          <ShieldCheck className="size-4" />

          Open compliance review
        </Link>
      </section>
    </div>
  );
}

/*
 * ==================================================
 * PROFILE ITEM
 * ==================================================
 */
function ProfileItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ivory-50 text-gold-700">
        <Icon className="size-4" />
      </span>

      <div className="min-w-0">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
          {label}
        </p>

        <p className="mt-1 wrap-break-word text-sm font-medium text-forest-950">
          {value}
        </p>
      </div>
    </div>
  );
}

/*
 * ==================================================
 * DATA POINT
 * ==================================================
 */
function DataPoint({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-1 wrap-break-word text-sm font-medium text-forest-950">
        {value}
      </p>
    </div>
  );
}

/*
 * ==================================================
 * VERIFICATION CARD
 * ==================================================
 */
function VerificationCard({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  const successful =
    status === "verified" ||
    status === "approved" ||
    status === "eligible" ||
    status === "suitable";

  const review =
    status ===
    "under_review";

  const problem =
    status === "rejected" ||
    status === "action_required";

  return (
    <div className="rounded-[1.25rem] border border-forest-900/10 bg-ivory-50 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-forest-950">
          {label}
        </p>

        {successful ? (
          <CheckCircle2 className="size-5 text-emerald-600" />
        ) : review ? (
          <Clock3 className="size-5 text-amber-600" />
        ) : problem ? (
          <CircleAlert className="size-5 text-red-600" />
        ) : (
          <Clock3 className="size-5 text-stone-400" />
        )}
      </div>

      <p
        className={`mt-4 text-xs font-semibold uppercase tracking-[0.12em] ${
          successful
            ? "text-emerald-700"
            : review
              ? "text-amber-700"
              : problem
                ? "text-red-700"
                : "text-stone-500"
        }`}
      >
        {humanize(
          status,
        )}
      </p>
    </div>
  );
}

/*
 * ==================================================
 * STATUS BADGE
 * ==================================================
 */
function StatusBadge({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  const approved =
    status === "approved" ||
    status === "verified" ||
    status === "active";

  const warning =
    status === "under_review" ||
    status === "in_progress";

  const problem =
    status === "rejected" ||
    status === "action_required" ||
    status === "suspended" ||
    status === "disabled";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.65rem] font-semibold ${
        approved
          ? "bg-emerald-50 text-emerald-700"
          : warning
            ? "bg-amber-50 text-amber-700"
            : problem
              ? "bg-red-50 text-red-700"
              : "bg-stone-100 text-stone-600"
      }`}
    >
      <span className="text-current/60">
        {label}:
      </span>

      {humanize(
        status,
      )}
    </span>
  );
}

/*
 * ==================================================
 * HELPERS
 * ==================================================
 */
function initials(
  firstName: string,
  lastName: string,
) {
  return [
    firstName?.[0],
    lastName?.[0],
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase() ||
    "TR";
}

function humanize(
  value: string,
) {
  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function formatDateTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}