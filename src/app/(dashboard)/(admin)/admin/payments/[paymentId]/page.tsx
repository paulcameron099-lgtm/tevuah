import {
  ArrowLeft,
  Banknote,
  FileCheck2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import { PaymentReviewActions } from "@/src/components/admin/payments/payment-review-actions";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    paymentId: string;
  }>;
};

export default async function AdminPaymentDetailPage({
  params,
}: PageProps) {
  await requireAdmin();

  const {
    paymentId,
  } = await params;

  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------
   * 1. LOAD PAYMENT
   * --------------------------------------------------
   */
  const {
    data: payment,
    error,
  } = await admin
    .from(
      "investment_payments",
    )
    .select(
      `
      id,

      subscription_id,
      investor_id,
      opportunity_id,

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
      admin_notes,

      created_at,
      updated_at,

      investor:profiles!investment_payments_investor_id_fkey (
        id,
        first_name,
        last_name,
        phone,
        country,
        city,
        state,
        account_status,
        onboarding_status
      ),

      opportunity:investment_opportunities!investment_payments_opportunity_id_fkey (
        id,
        slug,
        title,
        asset_category,
        funding_target,
        total_funded,
        investor_count,
        status
      ),

      subscription:investment_subscriptions!investment_payments_subscription_id_fkey (
        id,
        commitment_amount,
        status,
        submitted_at,
        reviewed_at
      )
      `,
    )
    .eq(
      "id",
      paymentId,
    )
    .maybeSingle();

  if (
    error ||
    !payment
  ) {
    console.error(
      "Admin payment detail load error:",
      error,
    );

    notFound();
  }

  /*
   * --------------------------------------------------
   * 2. NORMALIZE RELATIONS
   * --------------------------------------------------
   */
  const investor =
    Array.isArray(
      payment.investor,
    )
      ? payment.investor[0] ??
        null
      : payment.investor;

  const opportunity =
    Array.isArray(
      payment.opportunity,
    )
      ? payment.opportunity[0] ??
        null
      : payment.opportunity;

  const subscription =
    Array.isArray(
      payment.subscription,
    )
      ? payment.subscription[0] ??
        null
      : payment.subscription;

  if (
    !investor ||
    !opportunity ||
    !subscription
  ) {
    notFound();
  }

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
   * 3. REAL AUTH EMAIL
   * --------------------------------------------------
   */
  const {
    data: authInvestorData,
    error:
      authInvestorError,
  } =
    await admin.auth.admin.getUserById(
      investor.id,
    );

  if (authInvestorError) {
    console.error(
      "Payment investor auth email error:",
      authInvestorError,
    );
  }

  const investorEmail =
    authInvestorData.user
      ?.email ??
    "Email unavailable";

  /*
   * --------------------------------------------------
   * 4. SIGN PRIVATE PROOF
   * --------------------------------------------------
   */
  let proofUrl:
    | string
    | null =
    null;

  if (
    payment.proof_storage_path
  ) {
    const {
      data:
        proofSignedData,
      error:
        proofSignedError,
    } = await admin.storage
      .from(
        "investment-payment-proofs",
      )
      .createSignedUrl(
        payment.proof_storage_path,
        60 * 10,
      );

    if (proofSignedError) {
      console.error(
        "Payment proof signed URL error:",
        proofSignedError,
      );
    }

    proofUrl =
      proofSignedData?.signedUrl ??
      null;
  }

  /*
   * --------------------------------------------------
   * 5. AUDIT HISTORY
   * --------------------------------------------------
   */
  const {
    data: auditHistory,
    error: auditError,
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
          false,
      },
    );

  if (auditError) {
    console.error(
      "Payment audit load error:",
      auditError,
    );
  }

  /*
   * --------------------------------------------------
   * 6. CALCULATE CURRENT REMAINING ALLOCATION
   * --------------------------------------------------
   */
  const remainingAllocation =
    Number(
      opportunity.funding_target,
    ) -
    Number(
      opportunity.total_funded,
    );

  return (
    <div className="space-y-8">
      <Link
        href="/admin/payments"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to payment queue
      </Link>

      {/* HEADER */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Payment verification
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          {opportunity.title}
        </h1>

        <div className="mt-5 flex flex-wrap gap-3">
          <StatusPill
            label="Payment"
            value={
              payment.status
            }
          />

          <StatusPill
            label="Subscription"
            value={
              subscription.status
            }
          />

          <StatusPill
            label="Account"
            value={
              investor.account_status ??
              "active"
            }
          />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* INVESTOR */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <UserRound className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Investor
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
                label="Verification"
                value={humanize(
                  investor.onboarding_status ??
                    "not_started",
                )}
              />
            </div>

            <Link
              href={`/admin/investors/${investor.id}`}
              className="focus-ring mt-6 inline-flex min-h-10 cursor-pointer items-center rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950"
            >
              View investor profile
            </Link>
          </section>

          {/* PAYMENT DETAILS */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <Banknote className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Payment details
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
                    : "Not verified"
                }
              />

              <DataPoint
                label="Tevuah reference"
                value={
                  payment.payment_reference ??
                  "—"
                }
              />

              <DataPoint
                label="Investor transaction reference"
                value={
                  payment.investor_reference ??
                  "—"
                }
              />

              <DataPoint
                label="Reported"
                value={
                  payment.investor_reported_at
                    ? formatDate(
                        payment.investor_reported_at,
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
          </section>

          {/* PROOF */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <FileCheck2 className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Proof of payment
            </h2>

            {!payment.proof_storage_path ? (
              <p className="mt-4 text-sm text-stone-500">
                The investor has not uploaded payment
                proof.
              </p>
            ) : proofUrl ? (
              <div className="mt-6">
                <p className="text-sm leading-7 text-stone-600">
                  The proof is stored privately. Use
                  the temporary secure link below to
                  inspect it.
                </p>

                <a
                  href={
                    proofUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
                >
                  View payment proof
                </a>

                <p className="mt-3 text-xs text-stone-400">
                  This link expires automatically.
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Payment proof exists, but a secure
                viewing link could not be created.
              </div>
            )}
          </section>

          {/* OPPORTUNITY */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <ShieldCheck className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Funding position
            </h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <DataPoint
                label="Funding target"
                value={formatMoney(
                  Number(
                    opportunity.funding_target,
                  ),
                )}
              />

              <DataPoint
                label="Currently funded"
                value={formatMoney(
                  Number(
                    opportunity.total_funded,
                  ),
                )}
              />

              <DataPoint
                label="Remaining allocation"
                value={formatMoney(
                  remainingAllocation,
                )}
              />

              <DataPoint
                label="Current funded investors"
                value={String(
                  opportunity.investor_count,
                )}
              />
            </div>
          </section>

          {/* AUDIT */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <ShieldCheck className="size-5 text-gold-600" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              Payment audit history
            </h2>

            <div className="mt-6 space-y-3">
              {(auditHistory ??
                []).map(
                (entry) => (
                  <div
                    key={
                      entry.id
                    }
                    className="rounded-xl border border-forest-900/10 bg-ivory-50 p-4"
                  >
                    <p className="text-sm font-semibold text-forest-950">
                      {humanize(
                        entry.action,
                      )}
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      {formatDate(
                        entry.created_at,
                      )}
                    </p>
                  </div>
                ),
              )}

              {(auditHistory ??
                []).length ===
              0 ? (
                <p className="text-sm text-stone-500">
                  No payment audit events yet.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        {/* ACTIONS */}

        <PaymentReviewActions
          paymentId={
            payment.id
          }
          currentStatus={
            payment.status
          }
          expectedAmount={
            Number(
              payment.expected_amount,
            )
          }
          reportedAmount={
            payment.reported_amount !=
            null
              ? Number(
                  payment.reported_amount,
                )
              : null
          }
          remainingAllocation={
            remainingAllocation
          }
          proofAvailable={
            Boolean(
              payment.proof_storage_path,
            )
          }
        />
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

function StatusPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <span className="rounded-full bg-ivory-50 px-3 py-1.5 text-xs font-semibold text-forest-950">
      {label}:{" "}
      {humanize(value)}
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

      hour:
        "numeric",

      minute:
        "2-digit",
    },
  ).format(
    new Date(value),
  );
}