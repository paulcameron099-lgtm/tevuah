import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    positionId: string;
  }>;
};

export default async function InvestorPositionDetailPage({
  params,
}: PageProps) {
  /*
   * --------------------------------------------------
   * 1. AUTHENTICATE INVESTOR
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
   * 2. ACCOUNT ACCESS
   * --------------------------------------------------
   */
  const accountAccess =
    await checkAccountAccess(
      user.id,
    );

  if (
    !accountAccess.allowed
  ) {
    redirect(
      "/account-restricted",
    );
  }

  const {
    positionId,
  } = await params;

  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------
   * 3. LOAD POSITION
   *
   * IMPORTANT:
   *
   * We filter by BOTH:
   *
   * position id
   * investor id
   *
   * so one investor cannot open another investor's
   * position merely by knowing the UUID.
   * --------------------------------------------------
   */
  const {
    data: position,
    error: positionError,
  } = await admin
    .from(
      "investment_positions",
    )
    .select(
      `
      id,

      investor_id,
      opportunity_id,
      subscription_id,
      payment_id,

      principal_amount,
      currency,
      status,

      funded_at,
      created_at,
      updated_at,

      opportunity:investment_opportunities!investment_positions_opportunity_id_fkey (
        id,
        slug,
        title,
        short_description,
        full_description,
        asset_category,
        location,

        status,

        funding_target,
        total_funded,
        investor_count,

        expected_duration_months,

        target_return_min,
        target_return_max,
        target_return_note
      ),

      subscription:investment_subscriptions!investment_positions_subscription_id_fkey (
        id,

        commitment_amount,
        status,

        offering_acknowledged,
        offering_acknowledged_at,

        risk_disclosure_accepted,
        risk_disclosure_accepted_at,

        electronic_signature,
        signed_at,

        submitted_at,
        reviewed_at
      ),

      payment:investment_payments!investment_positions_payment_id_fkey (
        id,

        expected_amount,
        reported_amount,
        verified_amount,

        currency,
        payment_method,

        investor_reference,
        payment_reference,

        status,

        investor_reported_at,
        verified_at
      )
      `,
    )
    .eq(
      "id",
      positionId,
    )
    .eq(
      "investor_id",
      user.id,
    )
    .maybeSingle();

  if (
    positionError ||
    !position
  ) {
    console.error(
      "Investor position detail load error:",
      positionError,
    );

    notFound();
  }

  /*
   * --------------------------------------------------
   * 4. NORMALIZE SUPABASE RELATIONS
   *
   * Depending on generated relationship metadata,
   * Supabase may type these as arrays.
   * --------------------------------------------------
   */
  const opportunity =
    Array.isArray(
      position.opportunity,
    )
      ? position.opportunity[0] ??
        null
      : position.opportunity;

  const subscription =
    Array.isArray(
      position.subscription,
    )
      ? position.subscription[0] ??
        null
      : position.subscription;

  const payment =
    Array.isArray(
      position.payment,
    )
      ? position.payment[0] ??
        null
      : position.payment;

  if (
    !opportunity ||
    !subscription ||
    !payment
  ) {
    notFound();
  }

  /*
   * --------------------------------------------------
   * 5. LOAD POSITION / PAYMENT AUDIT HISTORY
   * --------------------------------------------------
   *
   * Right now payment audit contains the funding
   * lifecycle events such as:
   *
   * payment_reported
   * payment_rejected
   * payment_resubmitted
   * payment_verified
   */
  const {
    data: paymentAudit,
    error: auditError,
  } = await admin
    .from(
      "investment_payment_audit",
    )
    .select(
      `
      id,
      action,
      metadata,
      created_at
      `,
    )
    .eq(
      "payment_id",
      payment.id,
    )
    .order(
      "created_at",
      {
        ascending:
          true,
      },
    );

  if (auditError) {
    console.error(
      "Position payment audit load error:",
      auditError,
    );
  }

  /*
   * --------------------------------------------------
   * 6. DERIVED VALUES
   * --------------------------------------------------
   */
  const principalAmount =
    Number(
      position.principal_amount,
    );

  const fundingTarget =
    Number(
      opportunity.funding_target,
    );

  const totalFunded =
    Number(
      opportunity.total_funded,
    );

  const fundingProgress =
    fundingTarget > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (
              totalFunded /
              fundingTarget
            ) *
              100,
          ),
        )
      : 0;

  /*
   * --------------------------------------------------
   * 7. RENDER
   * --------------------------------------------------
   */
  return (
    <div className="space-y-8">
      {/* ==========================================
          BACK
      ========================================== */}

      <Link
        href="/dashboard/portfolio"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to portfolio
      </Link>

      {/* ==========================================
          HEADER
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Funded investment position
            </p>

            <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
              {opportunity.title}
            </h1>

            <div className="mt-5 flex flex-wrap gap-2">
              <PositionStatusBadge
                status={
                  position.status
                }
              />

              <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                {humanize(
                  opportunity.asset_category,
                )}
              </span>
            </div>

            {opportunity.location ? (
              <p className="mt-4 text-sm text-stone-500">
                {opportunity.location}
              </p>
            ) : null}
          </div>

          <div className="rounded-3xl bg-forest-950 p-5 text-white lg:min-w-72">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-400">
              Principal invested
            </p>

            <p className="font-display mt-2 text-4xl font-semibold">
              {formatMoney(
                principalAmount,
              )}
            </p>

            <p className="mt-3 text-xs leading-6 text-white/45">
              Verified funded capital associated
              with this investment position.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          MAIN GRID
      ========================================== */}

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* ======================================
              POSITION SUMMARY
          ====================================== */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <WalletCards className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Position Summary
            </h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <DataPoint
                label="Principal invested"
                value={formatMoney(
                  principalAmount,
                )}
              />

              <DataPoint
                label="Currency"
                value={
                  position.currency
                }
              />

              <DataPoint
                label="Position status"
                value={humanize(
                  position.status,
                )}
              />

              <DataPoint
                label="Funded date"
                value={
                  position.funded_at
                    ? formatDateTime(
                        position.funded_at,
                      )
                    : "—"
                }
              />

              <DataPoint
                label="Expected duration"
                value={
                  opportunity.expected_duration_months !=
                  null
                    ? `${opportunity.expected_duration_months} months`
                    : "—"
                }
              />

              <DataPoint
                label="Target return"
                value={formatTargetReturn(
                  opportunity.target_return_min,
                  opportunity.target_return_max,
                )}
              />
            </div>

            {opportunity.target_return_note ? (
              <div className="mt-6 rounded-xl border border-forest-900/10 bg-ivory-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                  Return presentation / disclosure
                </p>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-600">
                  {
                    opportunity.target_return_note
                  }
                </p>
              </div>
            ) : null}
          </section>

          {/* ======================================
              OPPORTUNITY
          ====================================== */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <Landmark className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Investment Opportunity
            </h2>

            {opportunity.short_description ? (
              <p className="mt-4 text-sm leading-7 text-stone-600">
                {
                  opportunity.short_description
                }
              </p>
            ) : null}

            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <DataPoint
                label="Funding target"
                value={formatMoney(
                  fundingTarget,
                )}
              />

              <DataPoint
                label="Total funded"
                value={formatMoney(
                  totalFunded,
                )}
              />

              <DataPoint
                label="Funded investors"
                value={String(
                  opportunity.investor_count ??
                    0,
                )}
              />

              <DataPoint
                label="Opportunity status"
                value={humanize(
                  opportunity.status,
                )}
              />
            </div>

            <div className="mt-7">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                  Funding progress
                </p>

                <p className="text-sm font-semibold text-forest-950">
                  {fundingProgress.toFixed(
                    1,
                  )}
                  %
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-forest-950"
                  style={{
                    width:
                      `${fundingProgress}%`,
                  }}
                />
              </div>
            </div>

            {opportunity.slug ? (
              <Link
                href={`/investments/${opportunity.slug}`}
                className="focus-ring mt-7 inline-flex min-h-10 cursor-pointer items-center rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
              >
                View opportunity
              </Link>
            ) : null}
          </section>

          {/* ======================================
              SUBSCRIPTION
          ====================================== */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <FileCheck2 className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Subscription Record
            </h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <DataPoint
                label="Approved commitment"
                value={formatMoney(
                  Number(
                    subscription.commitment_amount,
                  ),
                )}
              />

              <DataPoint
                label="Subscription status"
                value={humanize(
                  subscription.status,
                )}
              />

              <DataPoint
                label="Submitted"
                value={
                  subscription.submitted_at
                    ? formatDateTime(
                        subscription.submitted_at,
                      )
                    : "—"
                }
              />

              <DataPoint
                label="Reviewed"
                value={
                  subscription.reviewed_at
                    ? formatDateTime(
                        subscription.reviewed_at,
                      )
                    : "—"
                }
              />

              <DataPoint
                label="Electronic signature"
                value={
                  subscription.electronic_signature ??
                  "—"
                }
              />

              <DataPoint
                label="Signed"
                value={
                  subscription.signed_at
                    ? formatDateTime(
                        subscription.signed_at,
                      )
                    : "—"
                }
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Acknowledgement
                label="Offering documents"
                complete={
                  Boolean(
                    subscription.offering_acknowledged,
                  )
                }
                date={
                  subscription.offering_acknowledged_at
                }
              />

              <Acknowledgement
                label="Risk disclosure"
                complete={
                  Boolean(
                    subscription.risk_disclosure_accepted,
                  )
                }
                date={
                  subscription.risk_disclosure_accepted_at
                }
              />
            </div>
          </section>

          {/* ======================================
              PAYMENT
          ====================================== */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <Banknote className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Funding & Payment Record
            </h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <DataPoint
                label="Expected amount"
                value={formatMoney(
                  Number(
                    payment.expected_amount,
                  ),
                )}
              />

              <DataPoint
                label="Reported amount"
                value={
                  payment.reported_amount !=
                  null
                    ? formatMoney(
                        Number(
                          payment.reported_amount,
                        ),
                      )
                    : "—"
                }
              />

              <DataPoint
                label="Verified amount"
                value={
                  payment.verified_amount !=
                  null
                    ? formatMoney(
                        Number(
                          payment.verified_amount,
                        ),
                      )
                    : "—"
                }
              />

              <DataPoint
                label="Payment method"
                value={humanize(
                  payment.payment_method,
                )}
              />

              <DataPoint
                label="Tevuah reference"
                value={
                  payment.payment_reference ??
                  "—"
                }
              />

              <DataPoint
                label="Investor transfer reference"
                value={
                  payment.investor_reference ??
                  "—"
                }
              />

              <DataPoint
                label="Payment status"
                value={humanize(
                  payment.status,
                )}
              />

              <DataPoint
                label="Reported"
                value={
                  payment.investor_reported_at
                    ? formatDateTime(
                        payment.investor_reported_at,
                      )
                    : "—"
                }
              />

              <DataPoint
                label="Verified"
                value={
                  payment.verified_at
                    ? formatDateTime(
                        payment.verified_at,
                      )
                    : "—"
                }
              />
            </div>
          </section>

          {/* ======================================
              INVESTMENT TIMELINE
          ====================================== */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <ShieldCheck className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Investment Timeline
            </h2>

            <div className="mt-7 space-y-0">
              <TimelineEvent
                title="Subscription submitted"
                description="Your investment subscription was submitted for review."
                date={
                  subscription.submitted_at
                }
                complete={
                  Boolean(
                    subscription.submitted_at,
                  )
                }
              />

              <TimelineEvent
                title="Subscription approved"
                description="Tevuah Reserve approved your capital commitment."
                date={
                  subscription.reviewed_at
                }
                complete={
                  subscription.status ===
                    "approved" ||
                  position.status ===
                    "active"
                }
              />

              <TimelineEvent
                title="Payment reported"
                description="Your payment information and proof were submitted for verification."
                date={
                  payment.investor_reported_at
                }
                complete={
                  Boolean(
                    payment.investor_reported_at,
                  )
                }
              />

              <TimelineEvent
                title="Payment verified"
                description="Receipt of the investment capital was verified."
                date={
                  payment.verified_at
                }
                complete={
                  payment.status ===
                  "verified"
                }
              />

              <TimelineEvent
                title="Investment position activated"
                description="Your funded investment position was created."
                date={
                  position.funded_at
                }
                complete={
                  position.status ===
                    "active" ||
                  position.status ===
                    "matured" ||
                  position.status ===
                    "redeemed"
                }
                last={
                  (paymentAudit ??
                    []).length ===
                  0
                }
              />

              {(paymentAudit ??
                []).map(
                (
                  event,
                  index,
                ) => (
                  <TimelineEvent
                    key={
                      event.id
                    }
                    title={humanize(
                      event.action,
                    )}
                    description={auditDescription(
                      event.action,
                    )}
                    date={
                      event.created_at
                    }
                    complete
                    last={
                      index ===
                      (
                        paymentAudit ??
                        []
                      ).length -
                        1
                    }
                  />
                ),
              )}
            </div>
          </section>
        </div>

        {/* ==========================================
            SIDEBAR
        ========================================== */}

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <section className="rounded-[1.75rem] bg-forest-950 p-7 text-white">
            <ShieldCheck className="size-6 text-gold-400" />

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
              Position status
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold">
              {humanize(
                position.status,
              )}
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/60">
              This position represents verified
              funded capital and is separate from
              your original subscription request.
            </p>

            <div className="mt-7 space-y-5 border-t border-white/10 pt-6">
              <SideData
                label="Principal"
                value={formatMoney(
                  principalAmount,
                )}
              />

              <SideData
                label="Funded"
                value={
                  position.funded_at
                    ? formatDate(
                        position.funded_at,
                      )
                    : "—"
                }
              />

              <SideData
                label="Payment"
                value={humanize(
                  payment.status,
                )}
              />

              <SideData
                label="Subscription"
                value={humanize(
                  subscription.status,
                )}
              />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
              Important
            </p>

            <p className="mt-3 text-sm leading-7 text-stone-600">
              Target-return information is an
              investment presentation and is not a
              guarantee of future performance.
              Investment outcomes may differ from
              projections.
            </p>
          </section>
        </aside>
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

      <p className="mt-1 wrap-break-word text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

/*
 * ==================================================
 * SIDE DATA
 * ==================================================
 */

function SideData({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
      <p className="text-xs text-white/40">
        {label}
      </p>

      <p className="mt-1 wrap-break-word text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

/*
 * ==================================================
 * ACKNOWLEDGEMENT
 * ==================================================
 */

function Acknowledgement({
  label,
  complete,
  date,
}: {
  label: string;

  complete: boolean;

  date:
    | string
    | null;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        complete
          ? "border-emerald-200 bg-emerald-50"
          : "border-stone-200 bg-stone-50"
      }`}
    >
      <div className="flex items-start gap-3">
        {complete ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
        ) : (
          <Clock3 className="mt-0.5 size-4 shrink-0 text-stone-400" />
        )}

        <div>
          <p
            className={`text-sm font-semibold ${
              complete
                ? "text-emerald-900"
                : "text-stone-700"
            }`}
          >
            {label}
          </p>

          <p className="mt-1 text-xs text-stone-500">
            {complete
              ? date
                ? formatDateTime(
                    date,
                  )
                : "Completed"
              : "Not completed"}
          </p>
        </div>
      </div>
    </div>
  );
}

/*
 * ==================================================
 * TIMELINE
 * ==================================================
 */

function TimelineEvent({
  title,
  description,
  date,
  complete,
  last = false,
}: {
  title: string;

  description: string;

  date:
    | string
    | null;

  complete: boolean;

  last?: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      <div className="flex w-5 shrink-0 flex-col items-center">
        <span
          className={`z-10 mt-1 flex size-5 items-center justify-center rounded-full ${
            complete
              ? "bg-emerald-100 text-emerald-700"
              : "bg-stone-100 text-stone-400"
          }`}
        >
          {complete ? (
            <CheckCircle2 className="size-3.5" />
          ) : (
            <Clock3 className="size-3" />
          )}
        </span>

        {!last ? (
          <span className="h-full min-h-14 w-px bg-forest-900/10" />
        ) : null}
      </div>

      <div className="pb-7">
        <p className="text-sm font-semibold text-forest-950">
          {title}
        </p>

        <p className="mt-1 text-xs leading-6 text-stone-500">
          {description}
        </p>

        <p className="mt-2 text-[0.7rem] font-medium text-stone-400">
          {date
            ? formatDateTime(
                date,
              )
            : "Pending"}
        </p>
      </div>
    </div>
  );
}

/*
 * ==================================================
 * STATUS BADGE
 * ==================================================
 */

function PositionStatusBadge({
  status,
}: {
  status: string;
}) {
  const active =
    status ===
    "active";

  const matured =
    status ===
    "matured";

  const redeemed =
    status ===
    "redeemed";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : matured
            ? "bg-blue-50 text-blue-700"
            : redeemed
              ? "bg-stone-100 text-stone-700"
              : "bg-red-50 text-red-700"
      }`}
    >
      {active ? (
        <CheckCircle2 className="size-3" />
      ) : (
        <Clock3 className="size-3" />
      )}

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

function auditDescription(
  action: string,
) {
  switch (action) {
    case "payment_reported":
      return "Payment details were submitted for verification.";

    case "payment_rejected":
      return "Payment verification required corrective action.";

    case "payment_resubmitted":
      return "Updated payment information was submitted for another review.";

    case "payment_verified":
      return "Tevuah Reserve verified receipt of the investment capital.";

    default:
      return "Investment funding activity was recorded.";
  }
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

function formatMoney(
  cents: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        "USD",

      maximumFractionDigits:
        0,
    },
  ).format(
    cents / 100,
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

function formatTargetReturn(
  minimum:
    | number
    | null
    | undefined,

  maximum:
    | number
    | null
    | undefined,
) {
  if (
    minimum != null &&
    maximum != null
  ) {
    if (
      Number(minimum) ===
      Number(maximum)
    ) {
      return `${Number(
        minimum,
      )}%`;
    }

    return `${Number(
      minimum,
    )}% – ${Number(
      maximum,
    )}%`;
  }

  if (
    minimum != null
  ) {
    return `${Number(
      minimum,
    )}%`;
  }

  if (
    maximum != null
  ) {
    return `Up to ${Number(
      maximum,
    )}%`;
  }

  return "—";
}