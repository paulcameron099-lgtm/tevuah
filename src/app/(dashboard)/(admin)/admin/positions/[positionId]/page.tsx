import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Landmark,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

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

export default async function AdminPositionDetailPage({
  params,
}: PageProps) {
  /*
   * --------------------------------------------------
   * 1. ADMIN AUTH
   * --------------------------------------------------
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

  const {
    positionId,
  } = await params;

  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------
   * 2. LOAD POSITION
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

      investor:profiles!investment_positions_investor_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        country,
        city,
        state,
        account_status,
        onboarding_status,
        kyc_status,
        tax_status
      ),

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
        reviewed_at,
        reviewed_by
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

        proof_storage_path,

        status,

        investor_reported_at,
        verified_at,
        verified_by,

        rejection_reason,
        admin_notes
      )
      `,
    )
    .eq(
      "id",
      positionId,
    )
    .maybeSingle();

  if (
    positionError ||
    !position
  ) {
    console.error(
      "Admin position detail load error:",
      positionError,
    );

    notFound();
  }

  /*
   * --------------------------------------------------
   * 3. NORMALIZE RELATIONS
   * --------------------------------------------------
   */
  const investor =
    Array.isArray(
      position.investor,
    )
      ? position.investor[0] ??
        null
      : position.investor;

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
    !investor ||
    !opportunity ||
    !subscription ||
    !payment
  ) {
    notFound();
  }

  /*
   * --------------------------------------------------
   * 4. LOAD REAL AUTH EMAIL
   * --------------------------------------------------
   *
   * profiles does not contain email in your schema.
   */
  const {
    data: authInvestorData,
    error: authInvestorError,
  } =
    await admin.auth.admin.getUserById(
      investor.id,
    );

  if (authInvestorError) {
    console.error(
      "Position investor Auth lookup error:",
      authInvestorError,
    );
  }

  const investorEmail =
    authInvestorData.user
      ?.email ??
    "Email unavailable";

  const investorName =
    [
      investor.first_name,
      investor.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Investor";

  /*
   * --------------------------------------------------
   * 5. CREATE PRIVATE PROOF URL
   * --------------------------------------------------
   */
  let paymentProofUrl:
    | string
    | null =
    null;

  if (
    payment.proof_storage_path
  ) {
    const {
      data: signedProof,
      error: signedProofError,
    } = await admin.storage
      .from(
        "investment-payment-proofs",
      )
      .createSignedUrl(
        payment.proof_storage_path,
        60 * 10,
      );

    if (signedProofError) {
      console.error(
        "Admin position payment proof signed URL error:",
        signedProofError,
      );
    }

    paymentProofUrl =
      signedProof?.signedUrl ??
      null;
  }

  /*
   * --------------------------------------------------
   * 6. PAYMENT AUDIT
   * --------------------------------------------------
   */
  const {
    data: paymentAudit,
    error: paymentAuditError,
  } = await admin
    .from(
      "investment_payment_audit",
    )
    .select(
      `
      id,
      actor_id,
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

  if (paymentAuditError) {
    console.error(
      "Position payment audit load error:",
      paymentAuditError,
    );
  }

  /*
   * --------------------------------------------------
   * 7. SUBSCRIPTION AUDIT
   * --------------------------------------------------
   */
  const {
    data: subscriptionAudit,
    error: subscriptionAuditError,
  } = await admin
    .from(
      "investment_subscription_audit",
    )
    .select(
      `
      id,
      actor_id,
      action,
      metadata,
      created_at
      `,
    )
    .eq(
      "subscription_id",
      subscription.id,
    )
    .order(
      "created_at",
      {
        ascending:
          true,
      },
    );

  if (subscriptionAuditError) {
    console.error(
      "Position subscription audit load error:",
      subscriptionAuditError,
    );
  }

  /*
   * --------------------------------------------------
   * 8. DERIVED VALUES
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

  const remainingAllocation =
    fundingTarget -
    totalFunded;

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
   * 9. COMBINED AUDIT TIMELINE
   * --------------------------------------------------
   */
  const timeline = [
    ...(subscriptionAudit ??
      []).map(
      (
        entry,
      ) => ({
        id:
          `subscription-${entry.id}`,

        action:
          entry.action,

        createdAt:
          entry.created_at,

        source:
          "Subscription",
      }),
    ),

    ...(paymentAudit ??
      []).map(
      (
        entry,
      ) => ({
        id:
          `payment-${entry.id}`,

        action:
          entry.action,

        createdAt:
          entry.created_at,

        source:
          "Payment",
      }),
    ),
  ].sort(
    (
      a,
      b,
    ) =>
      new Date(
        a.createdAt,
      ).getTime() -
      new Date(
        b.createdAt,
      ).getTime(),
  );

  /*
   * --------------------------------------------------
   * 10. RENDER
   * --------------------------------------------------
   */
  return (
    <div className="space-y-8">
      <Link
        href="/admin/positions"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to positions
      </Link>

      {/* ==========================================
          HEADER
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
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

              <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                Payment{" "}
                {humanize(
                  payment.status,
                )}
              </span>
            </div>

            <p className="mt-4 text-sm text-stone-500">
              Investor:{" "}
              <strong className="text-forest-950">
                {investorName}
              </strong>
            </p>
          </div>

          <div className="rounded-3xl bg-forest-950 p-6 text-white xl:min-w-72">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-400">
              Principal invested
            </p>

            <p className="font-display mt-2 text-4xl font-semibold">
              {formatMoney(
                principalAmount,
              )}
            </p>

            <p className="mt-3 text-xs leading-6 text-white/45">
              Verified funded capital represented by
              this investment position.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1fr_390px]">
        <div className="space-y-8">
          {/* ======================================
              INVESTOR
          ====================================== */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <UserRound className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Investor
            </h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <DataPoint
                label="Name"
                value={
                  investorName
                }
              />

              <DataPoint
                label="Email"
                value={
                  investorEmail
                }
              />

              <DataPoint
                label="Phone"
                value={
                  investor.phone ??
                  "—"
                }
              />

              <DataPoint
                label="Location"
                value={
                  [
                    investor.city,
                    investor.state,
                    investor.country,
                  ]
                    .filter(Boolean)
                    .join(", ") ||
                  "—"
                }
              />

              <DataPoint
                label="Account status"
                value={humanize(
                  investor.account_status ??
                    "active",
                )}
              />

              <DataPoint
                label="Onboarding"
                value={humanize(
                  investor.onboarding_status ??
                    "not_started",
                )}
              />

              <DataPoint
                label="KYC"
                value={humanize(
                  investor.kyc_status ??
                    "not_started",
                )}
              />

              <DataPoint
                label="Tax"
                value={humanize(
                  investor.tax_status ??
                    "not_started",
                )}
              />
            </div>

            <Link
              href={`/admin/investors/${investor.id}`}
              className="focus-ring mt-7 inline-flex min-h-10 cursor-pointer items-center rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
            >
              View investor profile
            </Link>
          </section>

          {/* ======================================
              POSITION
          ====================================== */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <WalletCards className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Investment Position
            </h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <DataPoint
                label="Principal"
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
                label="Funded"
                value={
                  position.funded_at
                    ? formatDateTime(
                        position.funded_at,
                      )
                    : "—"
                }
              />

              <DataPoint
                label="Position ID"
                value={
                  position.id
                }
              />

              <DataPoint
                label="Payment ID"
                value={
                  position.payment_id
                }
              />
            </div>
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
                label="Remaining allocation"
                value={formatMoney(
                  Math.max(
                    0,
                    remainingAllocation,
                  ),
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

              <DataPoint
                label="Opportunity status"
                value={humanize(
                  opportunity.status,
                )}
              />

              <DataPoint
                label="Location"
                value={
                  opportunity.location ??
                  "—"
                }
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

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/admin/opportunities/${opportunity.id}/edit`}
                className="focus-ring inline-flex min-h-10 cursor-pointer items-center rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
              >
                Manage opportunity
              </Link>

              {opportunity.slug ? (
                <Link
                  href={`/investments/${opportunity.slug}`}
                  className="focus-ring inline-flex min-h-10 cursor-pointer items-center rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
                >
                  View public opportunity
                </Link>
              ) : null}
            </div>
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
                label="Commitment"
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
                label="Offering documents acknowledged"
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
                label="Risk disclosure accepted"
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

            <Link
              href={`/admin/subscriptions/${subscription.id}`}
              className="focus-ring mt-7 inline-flex min-h-10 cursor-pointer items-center rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
            >
              View subscription review
            </Link>
          </section>

          {/* ======================================
              PAYMENT
          ====================================== */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <Banknote className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Payment Record
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

            {payment.rejection_reason ? (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-700">
                  Previous rejection reason
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-red-900">
                  {
                    payment.rejection_reason
                  }
                </p>
              </div>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/admin/payments/${payment.id}`}
                className="focus-ring inline-flex min-h-10 cursor-pointer items-center rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
              >
                View payment review
              </Link>

              {paymentProofUrl ? (
                <a
                  href={
                    paymentProofUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex min-h-10 cursor-pointer items-center rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
                >
                  View payment proof
                </a>
              ) : null}
            </div>
          </section>

          {/* ======================================
              FULL AUDIT HISTORY
          ====================================== */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <ShieldCheck className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Investment Audit History
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
              Combined subscription and payment activity
              leading to this funded investment position.
            </p>

            {timeline.length ===
            0 ? (
              <p className="mt-6 text-sm text-stone-500">
                No audit activity found.
              </p>
            ) : (
              <div className="mt-7 space-y-3">
                {timeline.map(
                  (
                    entry,
                  ) => (
                    <div
                      key={
                        entry.id
                      }
                      className="rounded-xl border border-forest-900/10 bg-ivory-50 p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-forest-950">
                            {humanize(
                              entry.action,
                            )}
                          </p>

                          <p className="mt-1 text-xs text-stone-500">
                            {
                              entry.source
                            }
                          </p>
                        </div>

                        <p className="text-xs text-stone-400">
                          {formatDateTime(
                            entry.createdAt,
                          )}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>
        </div>

        {/* ==========================================
            ADMIN SIDEBAR
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
              This position represents verified funded
              capital associated with the investor.
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

              <SideData
                label="Investor account"
                value={humanize(
                  investor.account_status ??
                    "active",
                )}
              />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
              Administrative record
            </p>

            <p className="mt-3 text-sm leading-7 text-stone-600">
              Investment positions should represent only
              verified funded capital. Subscription approval
              alone should never create a funded position.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

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
      (
        letter,
      ) =>
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
      Number(
        minimum,
      ) ===
      Number(
        maximum,
      )
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