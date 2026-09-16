import {
  ArrowRight,
  BanknoteArrowUp,
  Search,
} from "lucide-react";

import Link from "next/link";

import {
  requireAdmin,
} from "@/src/lib/auth/require-admin";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

type PageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

type WithdrawalStatus =
  | "submitted"
  | "under_review"
  | "processing"
  | "paid"
  | "rejected"
  | "cancelled";

const allowedStatuses: WithdrawalStatus[] =
  [
    "submitted",
    "under_review",
    "processing",
    "paid",
    "rejected",
    "cancelled",
  ];

function formatMoney(
  amountCents: number,
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(
    amountCents / 100,
  );
}

function formatDate(
  value:
    | string
    | null,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

function humanizeStatus(
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

function statusClass(
  status: string,
) {
  switch (status) {
    case "submitted":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "under_review":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "processing":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";

    case "cancelled":
      return "border-stone-200 bg-stone-100 text-stone-600";

    default:
      return "border-stone-200 bg-stone-100 text-stone-600";
  }
}

function maskAccountNumber(
  value:
    | string
    | null,
) {
  const normalized =
    value?.trim() ??
    "";

  if (!normalized) {
    return "—";
  }

  if (
    normalized.length <=
    4
  ) {
    return "••••";
  }

  return `••••${normalized.slice(
    -4,
  )}`;
}

export default async function AdminWithdrawalsPage({
  searchParams,
}: PageProps) {
  /*
   * ----------------------------------------------------------
   * 1. ADMIN AUTHORIZATION
   * ----------------------------------------------------------
   */
  await requireAdmin();

  const params =
    await searchParams;

  const requestedStatus =
    params.status?.trim() ??
    "";

  const activeStatus =
    allowedStatuses.includes(
      requestedStatus as WithdrawalStatus,
    )
      ? (requestedStatus as WithdrawalStatus)
      : null;

  const admin =
    createAdminClient();

  /*
   * ----------------------------------------------------------
   * 2. LOAD WITHDRAWALS DIRECTLY
   * ----------------------------------------------------------
   *
   * Do not use an embedded profiles relationship here.
   * We load the requests first and profiles separately.
   */
  let withdrawalQuery =
    admin
      .from(
        "cash_account_withdrawal_requests",
      )
      .select(
        `
        id,
        investor_id,
        account_id,
        amount_cents,
        currency,
        withdrawal_method,
        bank_name,
        account_holder_name,
        account_number,
        status,
        rejection_reason,
        ledger_id,
        reviewed_at,
        approved_at,
        payment_reference,
        paid_at,
        cancelled_at,
        created_at,
        updated_at
        `,
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      )
      .limit(200);

  if (activeStatus) {
    withdrawalQuery =
      withdrawalQuery.eq(
        "status",
        activeStatus,
      );
  }

  const {
    data:
      withdrawalData,
    error:
      withdrawalError,
  } =
    await withdrawalQuery;

  if (withdrawalError) {
    console.error(
      "Admin withdrawal queue load error:",
      withdrawalError,
    );

    throw new Error(
      `Unable to load Cash Account withdrawals: ${withdrawalError.message}`,
    );
  }

  const withdrawals =
    withdrawalData ??
    [];

  /*
   * ----------------------------------------------------------
   * 3. LOAD INVESTOR PROFILES
   * ----------------------------------------------------------
   */
  const investorIds =
    Array.from(
      new Set(
        withdrawals
          .map(
            (
              withdrawal,
            ) =>
              withdrawal.investor_id,
          )
          .filter(Boolean),
      ),
    );

  let profiles:
    Array<{
      id: string;
      first_name:
        | string
        | null;
      last_name:
        | string
        | null;
      role:
        | string
        | null;
    }> = [];

  if (
    investorIds.length >
    0
  ) {
    const {
      data:
        profileData,
      error:
        profileError,
    } =
      await admin
        .from(
          "profiles",
        )
        .select(
          `
          id,
          first_name,
          last_name,
          role
          `,
        )
        .in(
          "id",
          investorIds,
        );

    if (profileError) {
      console.error(
        "Admin withdrawal investor profile load error:",
        profileError,
      );
    } else {
      profiles =
        profileData ??
        [];
    }
  }

  const profileMap =
    new Map(
      profiles.map(
        (profile) => [
          profile.id,
          profile,
        ],
      ),
    );

  /*
   * ----------------------------------------------------------
   * 4. QUEUE COUNTS
   * ----------------------------------------------------------
   */
  const submittedCount =
    withdrawals.filter(
      (withdrawal) =>
        withdrawal.status ===
        "submitted",
    ).length;

  const reviewCount =
    withdrawals.filter(
      (withdrawal) =>
        withdrawal.status ===
        "under_review",
    ).length;

  const processingCount =
    withdrawals.filter(
      (withdrawal) =>
        withdrawal.status ===
        "processing",
    ).length;

  return (
    <div className="space-y-8">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="rounded-[1.75rem] bg-forest-950 p-7 text-white sm:p-9">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              Cash operations
            </p>

            <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Withdrawal Review Center
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
              Review Tevuah Cash withdrawal
              requests, authorize outgoing
              funds and record completed
              payments.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="min-w-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/40">
                Submitted
              </p>

              <p className="font-display mt-2 text-2xl font-semibold">
                {
                  submittedCount
                }
              </p>
            </div>

            <div className="min-w-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/40">
                Review
              </p>

              <p className="font-display mt-2 text-2xl font-semibold">
                {
                  reviewCount
                }
              </p>
            </div>

            <div className="min-w-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/40">
                Processing
              </p>

              <p className="font-display mt-2 text-2xl font-semibold">
                {
                  processingCount
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/withdrawals"
            className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
              !activeStatus
                ? "bg-forest-950 text-white"
                : "bg-ivory-100 text-stone-600 hover:bg-ivory-200"
            }`}
          >
            All
          </Link>

          {allowedStatuses.map(
            (status) => (
              <Link
                key={
                  status
                }
                href={`/admin/withdrawals?status=${status}`}
                className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
                  activeStatus ===
                  status
                    ? "bg-forest-950 text-white"
                    : "bg-ivory-100 text-stone-600 hover:bg-ivory-200"
                }`}
              >
                {humanizeStatus(
                  status,
                )}
              </Link>
            ),
          )}
        </div>
      </section>

      {/* =====================================================
          QUEUE
      ===================================================== */}

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="flex items-center justify-between border-b border-forest-900/10 px-6 py-6 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-gold-100 text-gold-700">
              <BanknoteArrowUp className="size-5" />
            </span>

            <div>
              <h2 className="font-display text-2xl font-semibold text-forest-950">
                Withdrawal requests
              </h2>

              <p className="mt-1 text-xs text-stone-500">
                {
                  withdrawals.length
                }{" "}
                request
                {withdrawals.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>
          </div>
        </div>

        {withdrawals.length ===
        0 ? (
          <div className="px-6 py-20 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ivory-100 text-stone-400">
              <Search className="size-6" />
            </span>

            <p className="mt-5 text-sm font-semibold text-forest-950">
              No withdrawal requests found
            </p>

            <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-stone-500">
              There are no withdrawal requests
              matching the selected status.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {withdrawals.map(
              (
                withdrawal,
              ) => {
                const profile =
                  profileMap.get(
                    withdrawal.investor_id,
                  );

                const investorName =
                  [
                    profile?.first_name,
                    profile?.last_name,
                  ]
                    .filter(Boolean)
                    .join(" ")
                    .trim() ||
                  "Investor";

                return (
                  <article
                    key={
                      withdrawal.id
                    }
                    className="px-6 py-6 transition hover:bg-ivory-50 sm:px-8"
                  >
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="grid flex-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Investor */}

                        <div>
                          <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
                            Investor
                          </p>

                          <p className="mt-2 text-sm font-semibold text-forest-950">
                            {
                              investorName
                            }
                          </p>

                          <p className="mt-1 text-xs text-stone-400">
                            {
                              profile?.role ??
                              "investor"
                            }
                          </p>
                        </div>

                        {/* Amount */}

                        <div>
                          <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
                            Amount
                          </p>

                          <p className="font-display mt-2 text-lg font-semibold text-forest-950">
                            {formatMoney(
                              Number(
                                withdrawal.amount_cents,
                              ),
                              withdrawal.currency,
                            )}
                          </p>
                        </div>

                        {/* Destination */}

                        <div>
                          <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
                            Destination
                          </p>

                          <p className="mt-2 text-sm font-semibold text-forest-950">
                            {withdrawal.bank_name ??
                              "Bank transfer"}
                          </p>

                          <p className="mt-1 text-xs text-stone-400">
                            {
                              maskAccountNumber(
                                withdrawal.account_number,
                              )
                            }
                          </p>
                        </div>

                        {/* Status */}

                        <div>
                          <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
                            Status
                          </p>

                          <span
                            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] ${statusClass(
                              withdrawal.status,
                            )}`}
                          >
                            {humanizeStatus(
                              withdrawal.status,
                            )}
                          </span>
                        </div>

                        {/* Created */}

                        <div>
                          <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
                            Requested
                          </p>

                          <p className="mt-2 text-xs font-medium leading-5 text-stone-600">
                            {formatDate(
                              withdrawal.created_at,
                            )}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/admin/withdrawals/${withdrawal.id}`}
                        className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-xs font-semibold text-white transition hover:bg-forest-800"
                      >
                        Review request

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