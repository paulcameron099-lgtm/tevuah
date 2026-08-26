import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Landmark,
} from "lucide-react";

import Link from "next/link";

import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const admin =
    createAdminClient();

  const {
    data: payments,
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

      status,

      investor_reported_at,
      verified_at,

      created_at,
      updated_at,

      investor:profiles!investment_payments_investor_id_fkey (
        id,
        first_name,
        last_name,
        account_status,
        onboarding_status
      ),

      opportunity:investment_opportunities!investment_payments_opportunity_id_fkey (
        id,
        slug,
        title,
        asset_category,
        status
      )
      `,
    )
    .order(
      "updated_at",
      {
        ascending:
          false,
      },
    );

  if (error) {
    console.error(
      "Admin payment queue load error:",
      error,
    );

    throw new Error(
      "Unable to load investment payments.",
    );
  }

  const records =
    payments ?? [];

  const awaitingCount =
    records.filter(
      (payment) =>
        payment.status ===
        "awaiting_payment",
    ).length;

  const verificationCount =
    records.filter(
      (payment) =>
        payment.status ===
          "pending_verification" ||
        payment.status ===
          "payment_reported",
    ).length;

  const verifiedCount =
    records.filter(
      (payment) =>
        payment.status ===
        "verified",
    ).length;

  const rejectedCount =
    records.filter(
      (payment) =>
        payment.status ===
        "rejected",
    ).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investment administration
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Payment Verification
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Review reported investor transfers, inspect
          payment evidence and verify received capital
          before investment positions are created.
        </p>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Awaiting payment"
          value={awaitingCount}
        />

        <SummaryCard
          label="Needs verification"
          value={verificationCount}
        />

        <SummaryCard
          label="Verified"
          value={verifiedCount}
        />

        <SummaryCard
          label="Rejected"
          value={rejectedCount}
        />
      </div>

      {/* QUEUE */}

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        {records.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Landmark className="mx-auto size-7 text-stone-300" />

            <h2 className="font-display mt-4 text-3xl font-semibold text-forest-950">
              No payment records yet.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-500">
              Approved subscriptions and investor
              payment submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {records.map(
              (payment) => {
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

                const investorName =
                  investor
                    ? [
                        investor.first_name,
                        investor.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ")
                        .trim() ||
                      "Investor"
                    : "Investor";

                return (
                  <article
                    key={payment.id}
                    className="p-6"
                  >
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <PaymentStatusBadge
                            status={
                              payment.status
                            }
                          />

                          {opportunity?.asset_category ? (
                            <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                              {humanize(
                                opportunity.asset_category,
                              )}
                            </span>
                          ) : null}
                        </div>

                        <h2 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                          {opportunity?.title ??
                            "Investment opportunity"}
                        </h2>

                        <p className="mt-2 text-sm font-semibold text-stone-600">
                          {investorName}
                        </p>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                          <DataPoint
                            label="Expected"
                            value={formatMoney(
                              Number(
                                payment.expected_amount,
                              ),
                            )}
                          />

                          <DataPoint
                            label="Reported"
                            value={
                              payment.reported_amount !=
                              null
                                ? formatMoney(
                                    Number(
                                      payment.reported_amount,
                                    ),
                                  )
                                : "Not reported"
                            }
                          />

                          <DataPoint
                            label="Payment reference"
                            value={
                              payment.payment_reference ??
                              "—"
                            }
                          />

                          <DataPoint
                            label="Reported at"
                            value={
                              payment.investor_reported_at
                                ? formatDate(
                                    payment.investor_reported_at,
                                  )
                                : "—"
                            }
                          />
                        </div>
                      </div>

                      <Link
                        href={`/admin/payments/${payment.id}`}
                        className="focus-ring inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
                      >
                        Review payment

                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
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

function PaymentStatusBadge({
  status,
}: {
  status: string;
}) {
  const verified =
    status ===
    "verified";

  const pending =
    status ===
      "pending_verification" ||
    status ===
      "payment_reported";

  const rejected =
    status ===
    "rejected";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
        verified
          ? "bg-emerald-50 text-emerald-700"
          : pending
            ? "bg-amber-50 text-amber-700"
            : rejected
              ? "bg-red-50 text-red-700"
              : "bg-stone-100 text-stone-600"
      }`}
    >
      {verified ? (
        <CheckCircle2 className="size-3" />
      ) : pending ? (
        <Clock3 className="size-3" />
      ) : (
        <CircleAlert className="size-3" />
      )}

      {humanize(status)}
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