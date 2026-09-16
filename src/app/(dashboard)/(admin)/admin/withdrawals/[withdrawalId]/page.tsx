import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  Landmark,
  ShieldCheck,
  UserRound,
  WalletCards,
  XCircle,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  AdminWithdrawalReviewActions,
} from "@/src/components/admin/cash-account/admin-withdrawal-review-actions";

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

/*
 * ==========================================================
 * TYPES
 * ==========================================================
 */

type PageProps = {
  params: Promise<{
    withdrawalId: string;
  }>;
};

type WithdrawalStatus =
  | "submitted"
  | "under_review"
  | "processing"
  | "paid"
  | "rejected"
  | "cancelled";

/*
 * ==========================================================
 * FORMATTERS
 * ==========================================================
 */

function formatMoney(
  amountCents:
    | number
    | string
    | null
    | undefined,
  currency = "USD",
) {
  const amount =
    Number(
      amountCents ??
        0,
    );

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(
    amount / 100,
  );
}

function formatDateTime(
  value:
    | string
    | null
    | undefined,
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
      month: "long",
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

function statusDescription(
  status: WithdrawalStatus,
) {
  switch (status) {
    case "submitted":
      return "This request is awaiting administrative review. The investor's available Tevuah Cash balance has not been debited.";

    case "under_review":
      return "An administrator is reviewing this request. The investor's available Tevuah Cash balance has not yet been debited.";

    case "processing":
      return "This withdrawal has been approved. The Tevuah Cash debit has been posted and the external payout is awaiting completion.";

    case "paid":
      return "The external payout has been recorded as completed.";

    case "rejected":
      return "This withdrawal was not approved. No withdrawal debit should have been posted.";

    case "cancelled":
      return "The investor cancelled this request before financial approval.";

    default:
      return "";
  }
}

function statusIcon(
  status: WithdrawalStatus,
) {
  switch (status) {
    case "paid":
      return (
        <CheckCircle2 className="size-5" />
      );

    case "rejected":
    case "cancelled":
      return (
        <XCircle className="size-5" />
      );

    case "processing":
      return (
        <CircleDollarSign className="size-5" />
      );

    default:
      return (
        <Clock3 className="size-5" />
      );
  }
}

function displayValue(
  value:
    | string
    | null
    | undefined,
) {
  const normalized =
    value?.trim();

  return normalized ||
    "—";
}

/*
 * ==========================================================
 * PAGE
 * ==========================================================
 */

export default async function AdminWithdrawalDetailPage({
  params,
}: PageProps) {
  /*
   * --------------------------------------------------------
   * 1. ADMIN AUTHORIZATION
   * --------------------------------------------------------
   */
  await requireAdmin();

  const {
    withdrawalId,
  } =
    await params;

  if (!withdrawalId) {
    notFound();
  }

  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------------
   * 2. LOAD WITHDRAWAL
   * --------------------------------------------------------
   *
   * We deliberately do not use an embedded profiles
   * relationship here.
   */
  const {
    data:
      withdrawal,
    error:
      withdrawalError,
  } =
    await admin
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
        routing_number,
        swift_code,
        iban,
        bank_address,
        investor_note,
        status,
        reviewed_at,
        reviewed_by,
        rejection_reason,
        ledger_id,
        approved_at,
        approved_by,
        payment_reference,
        payment_note,
        paid_at,
        paid_by,
        cancelled_at,
        created_at,
        updated_at
        `,
      )
      .eq(
        "id",
        withdrawalId,
      )
      .maybeSingle();

  if (withdrawalError) {
    console.error(
      "Admin withdrawal detail load error:",
      withdrawalError,
    );

    throw new Error(
      `Unable to load withdrawal request: ${withdrawalError.message}`,
    );
  }

  if (!withdrawal) {
    notFound();
  }

  /*
   * --------------------------------------------------------
   * 3. LOAD INVESTOR PROFILE
   * --------------------------------------------------------
   */
  const {
    data:
      investor,
    error:
      investorError,
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
        phone,
        country,
        city,
        state,
        role,
        account_status,
        kyc_status
        `,
      )
      .eq(
        "id",
        withdrawal.investor_id,
      )
      .maybeSingle();

  if (investorError) {
    console.error(
      "Admin withdrawal investor load error:",
      investorError,
    );
  }

  /*
   * --------------------------------------------------------
   * 4. LOAD INVESTOR AUTH EMAIL
   * --------------------------------------------------------
   *
   * Email is not stored in profiles in this project.
   */
  const {
    data:
      authData,
    error:
      authError,
  } =
    await admin.auth.admin.getUserById(
      withdrawal.investor_id,
    );

  if (authError) {
    console.error(
      "Admin withdrawal investor auth load error:",
      authError,
    );
  }

  const investorEmail =
    authData.user?.email ??
    null;

  const investorName =
    [
      investor?.first_name,
      investor?.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Investor";

  /*
   * --------------------------------------------------------
   * 5. LOAD CASH ACCOUNT
   * --------------------------------------------------------
   */
  const {
    data:
      cashAccount,
    error:
      cashAccountError,
  } =
    await admin
      .from(
        "investor_cash_accounts",
      )
      .select(
        `
        id,
        investor_id,
        currency,
        available_balance_cents,
        pending_balance_cents,
        status,
        created_at,
        updated_at
        `,
      )
      .eq(
        "id",
        withdrawal.account_id,
      )
      .maybeSingle();

  if (cashAccountError) {
    console.error(
      "Admin withdrawal Cash Account load error:",
      cashAccountError,
    );
  }

  /*
   * --------------------------------------------------------
   * 6. LOAD WITHDRAWAL LEDGER ENTRY
   * --------------------------------------------------------
   *
   * Before approval withdrawal.ledger_id should be null.
   * After approval it points at the immutable debit entry.
   */
  let ledgerEntry:
    {
      id: string;
      direction: string;
      entry_type: string;
      amount_cents:
        | number
        | string;
      currency: string;
      balance_after_cents:
        | number
        | string;
      status: string;
      reference:
        | string
        | null;
      description:
        | string
        | null;
      idempotency_key:
        | string
        | null;
      created_at: string;
    } | null =
    null;

  if (
    withdrawal.ledger_id
  ) {
    const {
      data:
        ledgerData,
      error:
        ledgerError,
    } =
      await admin
        .from(
          "investor_cash_ledger",
        )
        .select(
          `
          id,
          direction,
          entry_type,
          amount_cents,
          currency,
          balance_after_cents,
          status,
          reference,
          description,
          idempotency_key,
          created_at
          `,
        )
        .eq(
          "id",
          withdrawal.ledger_id,
        )
        .maybeSingle();

    if (ledgerError) {
      console.error(
        "Admin withdrawal ledger load error:",
        ledgerError,
      );
    } else {
      ledgerEntry =
        ledgerData;
    }
  }

  const status =
    withdrawal.status as WithdrawalStatus;

  const balanceBeforeApproval =
    cashAccount
      ? Number(
          cashAccount.available_balance_cents,
        )
      : 0;

  const enoughBalance =
    balanceBeforeApproval >=
    Number(
      withdrawal.amount_cents,
    );

  return (
    <div className="space-y-8">
      {/* ====================================================
          BACK
      ==================================================== */}

      <Link
        href="/admin/withdrawals"
        className="focus-ring inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to withdrawals
      </Link>

      {/* ====================================================
          HERO
      ==================================================== */}

      <section className="overflow-hidden rounded-[1.75rem] bg-forest-950 text-white">
        <div className="p-7 sm:p-9">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
                Cash withdrawal review
              </p>

              <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                {formatMoney(
                  withdrawal.amount_cents,
                  withdrawal.currency,
                )}
              </h1>

              <p className="mt-3 text-sm text-white/55">
                {investorName}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${statusClass(
                    status,
                  )}`}
                >
                  {statusIcon(
                    status,
                  )}

                  {humanizeStatus(
                    status,
                  )}
                </span>

                <span className="text-xs text-white/40">
                  Request{" "}
                  {withdrawal.id}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-48 rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-white/40">
                  Current Cash balance
                </p>

                <p className="font-display mt-2 text-2xl font-semibold">
                  {cashAccount
                    ? formatMoney(
                        cashAccount.available_balance_cents,
                        cashAccount.currency,
                      )
                    : "—"}
                </p>
              </div>

              <div className="min-w-48 rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-white/40">
                  Cash Account
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {cashAccount?.status
                    ? humanizeStatus(
                        cashAccount.status,
                      )
                    : "Unavailable"}
                </p>

                <p className="mt-1 text-xs text-white/40">
                  {withdrawal.currency}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/5 px-7 py-5 sm:px-9">
          <p className="max-w-4xl text-xs leading-6 text-white/55">
            {statusDescription(
              status,
            )}
          </p>
        </div>
      </section>

      {/* ====================================================
          BALANCE WARNING
      ==================================================== */}

      {(status ===
        "submitted" ||
        status ===
          "under_review") &&
      cashAccount &&
      !enoughBalance ? (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <div className="flex gap-4">
            <XCircle className="mt-0.5 size-5 shrink-0 text-red-700" />

            <div>
              <h2 className="text-sm font-semibold text-red-900">
                Insufficient current Cash balance
              </h2>

              <p className="mt-2 text-xs leading-6 text-red-700">
                This investor currently has{" "}
                {formatMoney(
                  cashAccount.available_balance_cents,
                  cashAccount.currency,
                )}{" "}
                available, while this withdrawal
                requests{" "}
                {formatMoney(
                  withdrawal.amount_cents,
                  withdrawal.currency,
                )}.
                The approval RPC will perform the
                authoritative locked balance check
                and will reject approval if funds
                are insufficient.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* ====================================================
          MAIN GRID
      ==================================================== */}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-8">
          {/* ================================================
              INVESTOR
          ================================================ */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-ivory-100 text-forest-950">
                <UserRound className="size-5" />
              </span>

              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
                  Investor
                </p>

                <h2 className="font-display mt-1 text-2xl font-semibold text-forest-950">
                  Investor information
                </h2>
              </div>
            </div>

            <div className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Detail
                label="Legal name"
                value={
                  investorName
                }
              />

              <Detail
                label="Email"
                value={
                  investorEmail ??
                  "—"
                }
              />

              <Detail
                label="Phone"
                value={
                  investor?.phone ??
                  "—"
                }
              />

              <Detail
                label="Account status"
                value={
                  investor?.account_status
                    ? humanizeStatus(
                        investor.account_status,
                      )
                    : "—"
                }
              />

              <Detail
                label="KYC status"
                value={
                  investor?.kyc_status
                    ? humanizeStatus(
                        investor.kyc_status,
                      )
                    : "—"
                }
              />

              <Detail
                label="Location"
                value={
                  [
                    investor?.city,
                    investor?.state,
                    investor?.country,
                  ]
                    .filter(Boolean)
                    .join(", ") ||
                  "—"
                }
              />
            </div>
          </section>

          {/* ================================================
              BANK INFORMATION
          ================================================ */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                  <Landmark className="size-5" />
                </span>

                <div>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
                    Protected payout data
                  </p>

                  <h2 className="font-display mt-1 text-2xl font-semibold text-forest-950">
                    Bank information
                  </h2>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-wider text-emerald-700">
                <ShieldCheck className="size-3.5" />

                Admin only
              </span>
            </div>

            <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs leading-6 text-amber-900">
                Verify the payout destination carefully before
                approving this request. Bank information on this
                page is restricted to authorized administrators
                and must not be copied into notifications or
                email messages.
              </p>
            </div>

            <div className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Detail
                label="Withdrawal method"
                value={
                  withdrawal.withdrawal_method ===
                  "wire_transfer"
                    ? "Wire Transfer"
                    : humanizeStatus(
                        withdrawal.withdrawal_method,
                      )
                }
              />

              <Detail
                label="Bank name"
                value={displayValue(
                  withdrawal.bank_name,
                )}
              />

              <Detail
                label="Account holder"
                value={displayValue(
                  withdrawal.account_holder_name,
                )}
              />

              <SensitiveDetail
                label="Account number"
                value={displayValue(
                  withdrawal.account_number,
                )}
              />

              <SensitiveDetail
                label="Routing number"
                value={displayValue(
                  withdrawal.routing_number,
                )}
              />

              <SensitiveDetail
                label="SWIFT / BIC"
                value={displayValue(
                  withdrawal.swift_code,
                )}
              />

              <SensitiveDetail
                label="IBAN"
                value={displayValue(
                  withdrawal.iban,
                )}
              />

              <div className="sm:col-span-2">
                <Detail
                  label="Bank address"
                  value={displayValue(
                    withdrawal.bank_address,
                  )}
                />
              </div>
            </div>
          </section>

          {/* ================================================
              REQUEST
          ================================================ */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-ivory-100 text-forest-950">
                <FileText className="size-5" />
              </span>

              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
                  Request
                </p>

                <h2 className="font-display mt-1 text-2xl font-semibold text-forest-950">
                  Withdrawal details
                </h2>
              </div>
            </div>

            <div className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Detail
                label="Requested amount"
                value={formatMoney(
                  withdrawal.amount_cents,
                  withdrawal.currency,
                )}
              />

              <Detail
                label="Currency"
                value={
                  withdrawal.currency
                }
              />

              <Detail
                label="Submitted"
                value={formatDateTime(
                  withdrawal.created_at,
                )}
              />

              <Detail
                label="Last updated"
                value={formatDateTime(
                  withdrawal.updated_at,
                )}
              />

              <Detail
                label="Reviewed"
                value={formatDateTime(
                  withdrawal.reviewed_at,
                )}
              />

              <Detail
                label="Approved / processing"
                value={formatDateTime(
                  withdrawal.approved_at,
                )}
              />

              <Detail
                label="Paid"
                value={formatDateTime(
                  withdrawal.paid_at,
                )}
              />

              <Detail
                label="Cancelled"
                value={formatDateTime(
                  withdrawal.cancelled_at,
                )}
              />
            </div>

            <div className="mt-7 border-t border-forest-900/10 pt-7">
              <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
                Investor note
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-600">
                {withdrawal.investor_note?.trim() ||
                  "No investor note was provided."}
              </p>
            </div>

            {withdrawal.rejection_reason ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-red-500">
                  Rejection reason
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-red-800">
                  {
                    withdrawal.rejection_reason
                  }
                </p>
              </div>
            ) : null}
          </section>

          {/* ================================================
              FINANCIAL POSTING
          ================================================ */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-ivory-100 text-forest-950">
                <WalletCards className="size-5" />
              </span>

              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
                  Financial posting
                </p>

                <h2 className="font-display mt-1 text-2xl font-semibold text-forest-950">
                  Cash ledger
                </h2>
              </div>
            </div>

            {!withdrawal.ledger_id ? (
              <div className="mt-7 rounded-2xl border border-forest-900/10 bg-ivory-50 p-5">
                <p className="text-sm font-semibold text-forest-950">
                  No withdrawal debit posted
                </p>

                <p className="mt-2 text-xs leading-6 text-stone-500">
                  This is expected before approval. The investor&apos;s
                  available balance is only debited when the
                  withdrawal is approved.
                </p>
              </div>
            ) : ledgerEntry ? (
              <div className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <Detail
                  label="Ledger ID"
                  value={
                    ledgerEntry.id
                  }
                />

                <Detail
                  label="Entry type"
                  value={humanizeStatus(
                    ledgerEntry.entry_type,
                  )}
                />

                <Detail
                  label="Direction"
                  value={humanizeStatus(
                    ledgerEntry.direction,
                  )}
                />

                <Detail
                  label="Posted amount"
                  value={formatMoney(
                    ledgerEntry.amount_cents,
                    ledgerEntry.currency,
                  )}
                />

                <Detail
                  label="Balance after debit"
                  value={formatMoney(
                    ledgerEntry.balance_after_cents,
                    ledgerEntry.currency,
                  )}
                />

                <Detail
                  label="Ledger status"
                  value={humanizeStatus(
                    ledgerEntry.status,
                  )}
                />

                <Detail
                  label="Reference"
                  value={
                    ledgerEntry.reference ??
                    "—"
                  }
                />

                <Detail
                  label="Posted"
                  value={formatDateTime(
                    ledgerEntry.created_at,
                  )}
                />

                <div className="sm:col-span-2">
                  <Detail
                    label="Description"
                    value={
                      ledgerEntry.description ??
                      "—"
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-semibold text-amber-900">
                  Ledger reference exists but the entry could not
                  be loaded.
                </p>
              </div>
            )}
          </section>

          {/* ================================================
              PAYMENT COMPLETION
          ================================================ */}

          {(status ===
            "processing" ||
            status ===
              "paid") ? (
            <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Banknote className="size-5" />
                </span>

                <div>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
                    Outgoing payment
                  </p>

                  <h2 className="font-display mt-1 text-2xl font-semibold text-forest-950">
                    Payout information
                  </h2>
                </div>
              </div>

              <div className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <Detail
                  label="Payment reference"
                  value={
                    withdrawal.payment_reference ??
                    "Not recorded yet"
                  }
                />

                <Detail
                  label="Paid at"
                  value={formatDateTime(
                    withdrawal.paid_at,
                  )}
                />

                <div className="sm:col-span-2">
                  <Detail
                    label="Payment note"
                    value={
                      withdrawal.payment_note ??
                      "—"
                    }
                  />
                </div>
              </div>
            </section>
          ) : null}
        </div>

        {/* ==================================================
            ADMIN ACTION PANEL
        ================================================== */}

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
            <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
              Administrative action
            </p>

            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
              Review request
            </h2>

            <p className="mt-3 text-xs leading-6 text-stone-500">
              Financial state changes are executed through the
              protected Cash Account withdrawal functions.
            </p>

            <div className="mt-6">
              <AdminWithdrawalReviewActions
                withdrawalId={
                  withdrawal.id
                }
                status={
                  status
                }
              />
            </div>
          </section>

          {/* ================================================
              FINANCIAL SUMMARY
          ================================================ */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-ivory-50 p-6">
            <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
              Financial summary
            </p>

            <div className="mt-5 space-y-4">
              <SummaryRow
                label="Withdrawal"
                value={formatMoney(
                  withdrawal.amount_cents,
                  withdrawal.currency,
                )}
              />

              <SummaryRow
                label="Available Cash"
                value={
                  cashAccount
                    ? formatMoney(
                        cashAccount.available_balance_cents,
                        cashAccount.currency,
                      )
                    : "—"
                }
              />

              <SummaryRow
                label="Pending Cash"
                value={
                  cashAccount
                    ? formatMoney(
                        cashAccount.pending_balance_cents,
                        cashAccount.currency,
                      )
                    : "—"
                }
              />

              <div className="border-t border-forest-900/10 pt-4">
                <SummaryRow
                  label="Debit posted"
                  value={
                    withdrawal.ledger_id
                      ? "Yes"
                      : "No"
                  }
                />
              </div>
            </div>
          </section>

          {/* ================================================
              LIFECYCLE
          ================================================ */}

          <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-4 text-gold-700" />

              <p className="text-xs font-semibold text-forest-950">
                Request lifecycle
              </p>
            </div>

            <div className="mt-5 space-y-5">
              <TimelineItem
                label="Submitted"
                value={
                  withdrawal.created_at
                }
                active
              />

              <TimelineItem
                label="Under review"
                value={
                  withdrawal.reviewed_at
                }
                active={
                  Boolean(
                    withdrawal.reviewed_at,
                  )
                }
              />

              <TimelineItem
                label="Processing"
                value={
                  withdrawal.approved_at
                }
                active={
                  Boolean(
                    withdrawal.approved_at,
                  )
                }
              />

              <TimelineItem
                label="Paid"
                value={
                  withdrawal.paid_at
                }
                active={
                  Boolean(
                    withdrawal.paid_at,
                  )
                }
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/*
 * ==========================================================
 * DETAIL
 * ==========================================================
 */

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
        {label}
      </p>

      <p className="mt-2 wrap-break-word text-sm font-semibold leading-6 text-forest-950">
        {value}
      </p>
    </div>
  );
}

/*
 * ==========================================================
 * SENSITIVE DETAIL
 * ==========================================================
 */

function SensitiveDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
        {label}
      </p>

      <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-xl bg-ivory-100 px-3 py-2">
        <CreditCard className="size-3.5 shrink-0 text-stone-400" />

        <p className="break-all font-mono text-sm font-semibold text-forest-950">
          {value}
        </p>
      </div>
    </div>
  );
}

/*
 * ==========================================================
 * SUMMARY ROW
 * ==========================================================
 */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <span className="text-xs text-stone-500">
        {label}
      </span>

      <span className="text-right text-xs font-semibold text-forest-950">
        {value}
      </span>
    </div>
  );
}

/*
 * ==========================================================
 * TIMELINE
 * ==========================================================
 */

function TimelineItem({
  label,
  value,
  active,
}: {
  label: string;
  value:
    | string
    | null;
  active: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={`mt-1 size-2.5 rounded-full ${
            active
              ? "bg-emerald-600"
              : "bg-stone-200"
          }`}
        />

        <span className="mt-1 h-full w-px bg-forest-900/10" />
      </div>

      <div className="pb-2">
        <p
          className={`text-xs font-semibold ${
            active
              ? "text-forest-950"
              : "text-stone-400"
          }`}
        >
          {label}
        </p>

        <p className="mt-1 text-[0.68rem] leading-5 text-stone-400">
          {value
            ? formatDateTime(
                value,
              )
            : "Pending"}
        </p>
      </div>
    </div>
  );
}