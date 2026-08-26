import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import { FundingSubmissionForm } from "@/src/components/investments/funding-submission-form";
import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    subscriptionId: string;
  }>;
};

export default async function InvestmentFundingPage({
  params,
}: PageProps) {
  /*
   * --------------------------------------------------
   * 1. AUTHENTICATED INVESTOR
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
    subscriptionId,
  } = await params;

  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------
   * 2. LOAD APPROVED SUBSCRIPTION
   *
   * Investor ID is included in the query so one
   * investor cannot access another investor's
   * funding page.
   * --------------------------------------------------
   */
  const {
    data: subscription,
    error: subscriptionError,
  } = await admin
    .from(
      "investment_subscriptions",
    )
    .select(
      `
      id,
      investor_id,
      opportunity_id,
      commitment_amount,
      status,

      opportunity:investment_opportunities!investment_subscriptions_opportunity_id_fkey (
        id,
        slug,
        title,
        status
      )
      `,
    )
    .eq(
      "id",
      subscriptionId,
    )
    .eq(
      "investor_id",
      user.id,
    )
    .maybeSingle();

  if (
    subscriptionError ||
    !subscription
  ) {
    console.error(
      "Funding subscription load error:",
      subscriptionError,
    );

    notFound();
  }

  /*
   * Investor must have an approved subscription
   * before funding instructions become available.
   */
  if (
    subscription.status !==
    "approved"
  ) {
    redirect(
      `/dashboard/investments/${subscription.id}`,
    );
  }

  const opportunity =
    Array.isArray(
      subscription.opportunity,
    )
      ? subscription.opportunity[0] ??
        null
      : subscription.opportunity;

  if (!opportunity) {
    notFound();
  }

  /*
   * --------------------------------------------------
   * 3. LOAD FUNDING PAYMENT
   * --------------------------------------------------
   */
  const {
    data: payment,
    error: paymentError,
  } = await admin
    .from(
      "investment_payments",
    )
    .select(
      `
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

      rejection_reason,
      admin_notes,

      created_at,
      updated_at
      `,
    )
    .eq(
      "subscription_id",
      subscription.id,
    )
    .eq(
      "investor_id",
      user.id,
    )
    .maybeSingle();

  if (
    paymentError ||
    !payment
  ) {
    console.error(
      "Funding payment load error:",
      paymentError,
    );

    /*
     * An approved subscription should already have
     * an investment_payments row.
     */
    throw new Error(
      "Funding record could not be found for this approved subscription.",
    );
  }

  /*
   * --------------------------------------------------
   * 4. LOAD ACTIVE FUNDING INSTRUCTIONS
   * --------------------------------------------------
   */
  const {
    data: instructions,
    error: instructionsError,
  } = await admin
    .from(
      "investment_funding_instructions",
    )
    .select(
      `
      id,
      payment_method,

      bank_name,
      beneficiary_name,
      account_number,
      routing_number,
      swift_code,
      iban,
      bank_address,

      payment_reference_prefix,
      instructions,

      status
      `,
    )
    .eq(
      "opportunity_id",
      subscription.opportunity_id,
    )
    .eq(
      "status",
      "active",
    )
    .maybeSingle();

  if (instructionsError) {
    console.error(
      "Funding instructions load error:",
      instructionsError,
    );
  }

  /*
   * --------------------------------------------------
   * 5. GENERATE / PERSIST UNIQUE PAYMENT REFERENCE
   * --------------------------------------------------
   *
   * We do this server-side.
   */
  let paymentReference =
    payment.payment_reference;

  if (!paymentReference) {
    const prefix =
      instructions
        ?.payment_reference_prefix
        ?.trim()
        .toUpperCase() ||
      "TRINV";

    const reference =
      `${prefix}-${payment.id
        .replaceAll("-", "")
        .slice(0, 10)
        .toUpperCase()}`;

    const {
      error: referenceError,
    } = await admin
      .from(
        "investment_payments",
      )
      .update({
        payment_reference:
          reference,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        payment.id,
      );

    if (referenceError) {
      console.error(
        "Payment reference creation error:",
        referenceError,
      );
    } else {
      paymentReference =
        reference;
    }
  }

  /*
   * --------------------------------------------------
   * 6. PAYMENT STATUS
   * --------------------------------------------------
   */
  const waitingForVerification =
    payment.status ===
      "payment_reported" ||
    payment.status ===
      "pending_verification";

  const verified =
    payment.status ===
    "verified";

  const rejected =
    payment.status ===
    "rejected";

  const canSubmitPayment =
    payment.status ===
      "awaiting_payment" ||
    payment.status ===
      "rejected";

  /*
   * --------------------------------------------------
   * 7. RENDER
   * --------------------------------------------------
   */
  return (
    <div className="space-y-8">
      <Link
        href={`/dashboard/investments/${subscription.id}`}
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to subscription
      </Link>

      {/* HEADER */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Capital funding
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Fund your approved investment
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          {opportunity.title}
        </p>
      </div>

      {/* STATUS */}

      {waitingForVerification ? (
        <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <Clock3 className="size-6 text-amber-700" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Payment verification
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-amber-950">
            Your payment is awaiting verification.
          </h2>

          <p className="mt-4 text-sm leading-7 text-amber-900">
            Tevuah Reserve has received your payment
            submission details. Your investment
            position will not be created until the
            payment is verified.
          </p>
        </section>
      ) : null}

      {verified ? (
        <section className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
          <CheckCircle2 className="size-6 text-emerald-700" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Funding complete
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-emerald-950">
            Your payment has been verified.
          </h2>

          <p className="mt-4 text-sm leading-7 text-emerald-900">
            Your funded investment position has been
            created and is now part of your portfolio.
          </p>
        </section>
      ) : null}

      {rejected ? (
        <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 sm:p-8">
          <CircleAlert className="size-6 text-red-700" />

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
            Payment action required
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-red-950">
            Your payment submission requires attention.
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-red-900">
            {payment.rejection_reason ??
              "Please review your payment details and submit them again."}
          </p>
        </section>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* FUNDING INSTRUCTIONS */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <Banknote className="size-5 text-gold-600" />

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Funding instructions
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Bank transfer details
            </h2>

            {!instructions ? (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-semibold text-amber-900">
                  Funding instructions are not currently
                  available.
                </p>

                <p className="mt-2 text-sm leading-7 text-amber-800">
                  Contact Tevuah Reserve before sending
                  any funds.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <DataPoint
                    label="Bank"
                    value={
                      instructions.bank_name ??
                      "—"
                    }
                  />

                  <DataPoint
                    label="Beneficiary"
                    value={
                      instructions.beneficiary_name ??
                      "—"
                    }
                  />

                  <DataPoint
                    label="Account number"
                    value={
                      instructions.account_number ??
                      "—"
                    }
                  />

                  <DataPoint
                    label="Routing number"
                    value={
                      instructions.routing_number ??
                      "—"
                    }
                  />

                  <DataPoint
                    label="SWIFT / BIC"
                    value={
                      instructions.swift_code ??
                      "—"
                    }
                  />

                  <DataPoint
                    label="IBAN"
                    value={
                      instructions.iban ??
                      "—"
                    }
                  />
                </div>

                {instructions.bank_address ? (
                  <div className="mt-5">
                    <DataPoint
                      label="Bank address"
                      value={
                        instructions.bank_address
                      }
                    />
                  </div>
                ) : null}

                <div className="mt-6 rounded-xl border border-gold-200 bg-gold-50/40 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-700">
                    Required payment reference
                  </p>

                  <p className="mt-3 break-all font-mono text-lg font-semibold text-forest-950">
                    {paymentReference ??
                      "Reference unavailable"}
                  </p>

                  <p className="mt-3 text-xs leading-6 text-stone-600">
                    Include this exact reference with
                    your transfer so the payment can be
                    matched to your subscription.
                  </p>
                </div>

                {instructions.instructions ? (
                  <div className="mt-6 whitespace-pre-line rounded-xl bg-ivory-50 p-5 text-sm leading-7 text-stone-600">
                    {
                      instructions.instructions
                    }
                  </div>
                ) : null}
              </>
            )}
          </section>

          {/* SUBMISSION FORM */}

          {canSubmitPayment &&
          instructions ? (
            <FundingSubmissionForm
              paymentId={
                payment.id
              }
              expectedAmount={
                Number(
                  payment.expected_amount,
                ) / 100
              }
              paymentReference={
                paymentReference ??
                ""
              }
              initialInvestorReference={
                payment.investor_reference ??
                ""
              }
            />
          ) : null}
        </div>

        {/* SUMMARY */}

        <aside className="rounded-[1.75rem] bg-forest-950 p-7 text-white xl:sticky xl:top-28 xl:self-start">
          <ShieldCheck className="size-5 text-gold-400" />

          <h2 className="font-display mt-5 text-3xl font-semibold">
            Funding summary
          </h2>

          <div className="mt-7 space-y-5">
            <SideData
              label="Approved commitment"
              value={formatMoney(
                Number(
                  payment.expected_amount,
                ),
              )}
            />

            <SideData
              label="Currency"
              value={
                payment.currency
              }
            />

            <SideData
              label="Payment method"
              value={humanize(
                payment.payment_method,
              )}
            />

            <SideData
              label="Payment status"
              value={humanize(
                payment.status,
              )}
            />

            <SideData
              label="Reference"
              value={
                paymentReference ??
                "—"
              }
            />
          </div>

          <p className="mt-7 border-t border-white/10 pt-6 text-xs leading-6 text-white/45">
            Do not treat a submitted transfer as a
            funded investment until Tevuah Reserve has
            verified receipt of the funds.
          </p>
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
    <div className="border-b border-white/10 pb-4">
      <p className="text-xs text-white/40">
        {label}
      </p>

      <p className="mt-1 wrap-break-word text-sm font-semibold">
        {value}
      </p>
    </div>
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