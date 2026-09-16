import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";
import { checkAccountAccess } from "@/src/lib/auth/account-status";


export const dynamic = "force-dynamic";


type JointInvestmentPageProps = {
  params: Promise<{
    id: string;
  }>;
};


type JointInvestmentStatusRow = {
  joint_subscription_id: string;

  opportunity_id: string;
  opportunity_title: string;
  opportunity_slug: string;
  opportunity_asset_category: string;
  opportunity_location: string | null;

  initiated_by: string;

  total_commitment_amount: number | string;
  currency: string;
  parent_status: string;

  submitted_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  rejection_reason: string | null;

  created_at: string;
  updated_at: string;

  current_user_member_id: string;
  current_user_member_slot: number;
  current_user_member_status: string;
  current_user_ownership_bps: number;
  current_user_funding_obligation_bps: number;
  current_user_obligation_amount: number | string;
  current_user_consent_status: string | null;

  other_member_id: string | null;
  other_member_investor_id: string | null;
  other_member_first_name: string | null;
  other_member_last_name: string | null;
  other_member_slot: number | null;
  other_member_status: string | null;
  other_member_ownership_bps: number | null;
  other_member_funding_obligation_bps: number | null;
  other_member_obligation_amount: number | string | null;
  other_member_consent_status: string | null;

  invitation_status: string | null;
  invitation_expires_at: string | null;

  both_members_accepted: boolean;
  both_consents_accepted: boolean;
  ready_for_review: boolean;
};


const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


function money(
  cents: number | string | null | undefined,
  currency = "USD",
) {
  const value = Number(cents ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}


function percentage(
  basisPoints: number | null | undefined,
) {
  const value = Number(basisPoints ?? 0) / 100;

  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}%`;
}


function prettyStatus(
  status: string | null | undefined,
) {
  if (!status) {
    return "Not started";
  }

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}


function dateTime(
  value: string | null | undefined,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}


function participantName(
  firstName: string | null,
  lastName: string | null,
) {
  const value = [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return value || "Joint investor";
}


function statusClasses(
  status: string | null | undefined,
) {
  switch (status) {
    case "accepted":
    case "approved":
    case "funded":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300";

    case "submitted":
    case "under_review":
    case "funding":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300";

    case "declined":
    case "rejected":
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300";

    case "pending":
    case "invited":
    case "awaiting_member_acceptance":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300";
  }
}


function StatusBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        statusClasses(status),
      ].join(" ")}
    >
      {prettyStatus(status)}
    </span>
  );
}


function ProgressItem({
  title,
  description,
  complete,
  current = false,
}: {
  title: string;
  description: string;
  complete: boolean;
  current?: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
            complete
              ? "border-emerald-600 bg-emerald-600 text-white"
              : current
                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                : "border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-950",
          ].join(" ")}
        >
          {complete ? "✓" : "•"}
        </div>
      </div>

      <div className="pb-7">
        <p className="font-medium text-slate-950 dark:text-white">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}


export default async function JointInvestmentPage({
  params,
}: JointInvestmentPageProps) {
  const { id } = await params;


  /*
   * ==========================================================
   * 1. VALIDATE ROUTE
   * ==========================================================
   */

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }


  /*
   * ==========================================================
   * 2. AUTHENTICATE
   * ==========================================================
   */

  const supabase =
    await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;


  if (
    claimsError ||
    !userId
  ) {
    redirect(
      `/login?next=${encodeURIComponent(
        `/dashboard/investments/joint/${id}`,
      )}`,
    );
  }


  /*
   * ==========================================================
   * 3. ACCOUNT ACCESS
   * ==========================================================
   */

  const accountAccess =
    await checkAccountAccess(
      userId,
    );

  if (!accountAccess.allowed) {
    redirect("/dashboard");
  }


  /*
   * ==========================================================
   * 4. AUTHORIZED STATUS
   * ==========================================================
   *
   * Important:
   *
   * Do NOT use the admin client here.
   *
   * The RPC independently requires auth.uid() to belong to
   * this joint investment.
   */

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_joint_investment_status",
      {
        p_joint_subscription_id:
          id,
      },
    );


  if (error) {
    console.error(
      "Joint investment page RPC error:",
      error,
    );

    throw new Error(
      "Unable to load joint investment.",
    );
  }


  const row =
    (
      Array.isArray(data)
        ? data[0]
        : data
    ) as
      | JointInvestmentStatusRow
      | undefined;


  /*
   * Covers both:
   *
   * - nonexistent subscription
   * - user is not a member
   */

  if (!row) {
    notFound();
  }


  /*
   * ==========================================================
   * 5. DERIVED DISPLAY STATE
   * ==========================================================
   */

  const isInitiator =
    row.initiated_by ===
    userId;


  const otherName =
    participantName(
      row.other_member_first_name,
      row.other_member_last_name,
    );


  const acceptanceComplete =
    row.both_members_accepted &&
    row.both_consents_accepted;


  const submitted =
    [
      "submitted",
      "under_review",
      "approved",
      "funding",
      "funded",
    ].includes(
      row.parent_status,
    );


  const underReview =
    [
      "under_review",
      "approved",
      "funding",
      "funded",
    ].includes(
      row.parent_status,
    );


  const approved =
    [
      "approved",
      "funding",
      "funded",
    ].includes(
      row.parent_status,
    );


  const funding =
    [
      "funding",
      "funded",
    ].includes(
      row.parent_status,
    );


  const funded =
    row.parent_status ===
    "funded";


  /*
   * ==========================================================
   * 6. PAGE
   * ==========================================================
   */

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Back */}

      <div className="mb-7">
        <Link
          href="/dashboard/investments"
          className="text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:hover:text-white"
        >
          ← Back to investments
        </Link>
      </div>


      {/* Header */}

      <section className="border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                Joint Investment
              </p>

              {isInitiator && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  You initiated
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              {row.opportunity_title}
            </h1>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
              <span>
                {row.opportunity_asset_category}
              </span>

              {row.opportunity_location && (
                <span>
                  {row.opportunity_location}
                </span>
              )}

              <span>
                Created {dateTime(row.created_at)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Current status
            </p>

            <StatusBadge
              status={
                row.parent_status
              }
            />
          </div>
        </div>
      </section>


      {/* Main summary */}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          {/* Financial summary */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Joint commitment
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {money(
                  row.total_commitment_amount,
                  row.currency,
                )}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Your commitment
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                  {money(
                    row.current_user_obligation_amount,
                    row.currency,
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Your ownership
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                  {percentage(
                    row.current_user_ownership_bps,
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Funding share
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                  {percentage(
                    row.current_user_funding_obligation_bps,
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Each investor has an independent funding
                obligation. No funds are transferred merely by
                accepting the joint investment.
              </p>
            </div>
          </section>


          {/* Participants */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                Joint investors
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Both investors must independently accept the
                investment and associated disclosures.
              </p>
            </div>


            <div className="mt-7 space-y-4">
              {/* Current user */}

              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950 dark:text-white">
                        You
                      </p>

                      {isInitiator && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-900">
                          Initiator
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {percentage(
                        row.current_user_ownership_bps,
                      )}{" "}
                      ownership ·{" "}
                      {money(
                        row.current_user_obligation_amount,
                        row.currency,
                      )}{" "}
                      obligation
                    </p>
                  </div>

                  <StatusBadge
                    status={
                      row.current_user_member_status
                    }
                  />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
                  <span className="text-slate-500">
                    Consent
                  </span>

                  <StatusBadge
                    status={
                      row.current_user_consent_status
                    }
                  />
                </div>
              </div>


              {/* Other investor */}

              {row.other_member_id && (
                <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">
                        {otherName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {percentage(
                          row.other_member_ownership_bps,
                        )}{" "}
                        ownership ·{" "}
                        {money(
                          row.other_member_obligation_amount,
                          row.currency,
                        )}{" "}
                        obligation
                      </p>
                    </div>

                    <StatusBadge
                      status={
                        row.other_member_status
                      }
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
                    <span className="text-slate-500">
                      Consent
                    </span>

                    <StatusBadge
                      status={
                        row.other_member_consent_status
                      }
                    />
                  </div>
                </div>
              )}
            </div>


            {/* Invitation state */}

            {row.invitation_status && (
              <div className="mt-6 rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-950 dark:text-white">
                      Invitation
                    </p>

                    {row.invitation_expires_at &&
                      row.invitation_status ===
                        "pending" && (
                        <p className="mt-1 text-xs text-slate-500">
                          Expires{" "}
                          {dateTime(
                            row.invitation_expires_at,
                          )}
                        </p>
                      )}
                  </div>

                  <StatusBadge
                    status={
                      row.invitation_status
                    }
                  />
                </div>
              </div>
            )}
          </section>


          {/* Readiness */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              Participation readiness
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
                <p className="text-sm text-slate-500">
                  Members accepted
                </p>

                <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                  {row.both_members_accepted
                    ? "Complete"
                    : "Waiting"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
                <p className="text-sm text-slate-500">
                  Consents accepted
                </p>

                <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                  {row.both_consents_accepted
                    ? "Complete"
                    : "Waiting"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
                <p className="text-sm text-slate-500">
                  Ready for review
                </p>

                <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                  {row.ready_for_review
                    ? "Yes"
                    : "Not yet"}
                </p>
              </div>
            </div>
          </section>


          {/* Rejection */}

          {row.parent_status ===
            "rejected" && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30 sm:p-8">
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">
                Joint investment not approved
              </h2>

              <p className="mt-3 text-sm leading-6 text-red-800 dark:text-red-300">
                {row.rejection_reason ||
                  "This joint investment was not approved."}
              </p>
            </section>
          )}
        </div>


        {/* Timeline */}

        <aside>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:sticky lg:top-8">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Investment progress
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Track the joint investment from participant
              acceptance through funding.
            </p>


            <div className="mt-7">
              <ProgressItem
                title="Joint investment created"
                description={`Created ${dateTime(
                  row.created_at,
                )}`}
                complete
              />

              <ProgressItem
                title="Investor acceptance"
                description={
                  acceptanceComplete
                    ? "Both investors have accepted their participation and disclosures."
                    : "Waiting for all investors to complete acceptance and consent."
                }
                complete={
                  acceptanceComplete
                }
                current={
                  !acceptanceComplete
                }
              />

              <ProgressItem
                title="Submitted"
                description={
                  row.submitted_at
                    ? `Submitted ${dateTime(
                        row.submitted_at,
                      )}`
                    : "The investment will submit after all required participant actions are complete."
                }
                complete={
                  submitted
                }
                current={
                  acceptanceComplete &&
                  !submitted
                }
              />

              <ProgressItem
                title="Review"
                description={
                  row.reviewed_at
                    ? `Review recorded ${dateTime(
                        row.reviewed_at,
                      )}`
                    : "Tevuah Reserve review."
                }
                complete={
                  underReview
                }
                current={
                  row.parent_status ===
                    "submitted"
                }
              />

              <ProgressItem
                title="Approved"
                description={
                  row.approved_at
                    ? `Approved ${dateTime(
                        row.approved_at,
                      )}`
                    : "Approval is required before the funding stage."
                }
                complete={
                  approved
                }
                current={
                  row.parent_status ===
                    "under_review"
                }
              />

              <ProgressItem
                title="Funding"
                description="Each investor will satisfy their individual funding obligation."
                complete={
                  funding
                }
                current={
                  row.parent_status ===
                    "approved"
                }
              />

              <ProgressItem
                title="Funded"
                description="The joint investment is complete after both funding obligations and finalization requirements are satisfied."
                complete={
                  funded
                }
                current={
                  row.parent_status ===
                    "funding"
                }
              />
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}