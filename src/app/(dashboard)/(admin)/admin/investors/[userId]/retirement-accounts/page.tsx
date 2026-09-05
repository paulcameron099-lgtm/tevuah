
  import { ArrowLeft,
  CircleAlert,
  CircleCheck,
  Landmark,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  AdminRetirementAccountControls,
} from "@/src/components/admin/investors/admin-retirement-account-controls";

import {
  requireAdmin,
} from "@/src/lib/auth/require-admin";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

type RetirementAccount = {
  id: string;
  investor_id: string;
  account_type: string;
  institution_name: string;
  plan_provider: string | null;
  plan_sponsor: string | null;
  account_holder_name: string;
  account_last_four: string | null;
  account_number_encrypted: string | null;
  participant_id_encrypted: string | null;
  custodian_account_identifier_encrypted: string | null;
  rollover_identifier_encrypted: string | null;
  approximate_balance_cents: number | string | null;
  current_balance_cents: number | string | null;
  currency: string;
  employment_status: string | null;
  rollover_eligibility: string;
  connection_method: string;
  provider_name: string | null;
  connection_status: string;
  verification_status: string;
  funding_eligibility_status: string;
  last_synced_at: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export default async function AdminInvestorRetirementAccountsPage({
  params,
}: PageProps) {
  await requireAdmin();

  const {
    userId,
  } =
    await params;

  const admin =
    createAdminClient();

  const [
    profileResult,
    authResult,
    accountsResult,
    accessLogsResult,
  ] =
    await Promise.all([
      admin
        .from(
          "profiles",
        )
        .select(
          "id, first_name, last_name, role",
        )
        .eq(
          "id",
          userId,
        )
        .maybeSingle(),

      admin.auth.admin.getUserById(
        userId,
      ),

      admin
        .from(
          "investor_retirement_accounts",
        )
        .select(
          `
          id,
          investor_id,
          account_type,
          institution_name,
          plan_provider,
          plan_sponsor,
          account_holder_name,
          account_last_four,
          account_number_encrypted,
          participant_id_encrypted,
          custodian_account_identifier_encrypted,
          rollover_identifier_encrypted,
          approximate_balance_cents,
          current_balance_cents,
          currency,
          employment_status,
          rollover_eligibility,
          connection_method,
          provider_name,
          connection_status,
          verification_status,
          funding_eligibility_status,
          last_synced_at,
          verified_at,
          rejection_reason,
          admin_notes,
          created_at,
          updated_at
          `,
        )
        .eq(
          "investor_id",
          userId,
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          },
        ),

      admin
        .from(
          "sensitive_data_access_logs",
        )
        .select(
          `
          id,
          admin_id,
          investor_id,
          resource_id,
          field_name,
          reason,
          accessed_at
          `,
        )
        .eq(
          "investor_id",
          userId,
        )
        .eq(
          "resource_type",
          "retirement_account",
        )
        .order(
          "accessed_at",
          {
            ascending:
              false,
          },
        )
        .limit(20),
    ]);

  const profile =
    profileResult.data;

  if (
    profileResult.error ||
    !profile ||
    profile.role !==
      "investor"
  ) {
    notFound();
  }

  if (
    accountsResult.error
  ) {
    console.error(
      "Admin retirement accounts load error:",
      accountsResult.error,
    );

    throw new Error(
      "Unable to load retirement accounts.",
    );
  }

  if (
    accessLogsResult.error
  ) {
    console.error(
      "Retirement sensitive access logs load error:",
      accessLogsResult.error,
    );
  }

  const accounts =
    (accountsResult.data ??
      []) as RetirementAccount[];

  const investorName =
    [
      profile.first_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Investor";

  const investorEmail =
    authResult.data.user
      ?.email ??
    "Email unavailable";

  const accessLogs =
    accessLogsResult.data ??
    [];

  return (
    <div className="space-y-8">
      <Link
        href={`/admin/investors/${userId}`}
        className="focus-ring inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to investor
      </Link>

      <header className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Retirement account administration
            </p>

            <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.035em] text-forest-950">
              {investorName}
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              {investorEmail}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-forest-900/10 bg-ivory-50 p-4">
            <ShieldCheck className="size-5 shrink-0 text-forest-950" />

            <p className="max-w-sm text-xs leading-6 text-stone-600">
              Sensitive identifiers remain hidden by default. Protected values may only be revealed one field at a time after an access reason is recorded.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Accounts"
          value={
            String(
              accounts.length,
            )
          }
        />

        <SummaryCard
          label="Verified"
          value={
            String(
              accounts.filter(
                (
                  account,
                ) =>
                  account.verification_status ===
                  "verified",
              ).length,
            )
          }
        />

        <SummaryCard
          label="Eligible funding sources"
          value={
            String(
              accounts.filter(
                (
                  account,
                ) =>
                  account.funding_eligibility_status ===
                  "eligible",
              ).length,
            )
          }
        />
      </section>

      {accounts.length ===
      0 ? (
        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white px-6 py-16 text-center">
          <PiggyBank className="mx-auto size-9 text-stone-300" />

          <h2 className="font-display mt-4 text-2xl font-semibold text-forest-950">
            No retirement accounts
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-500">
            This investor has not added a retirement account yet.
          </p>
        </section>
      ) : (
        <div className="space-y-8">
          {accounts.map(
            (
              account,
            ) => (
              <section
                key={
                  account.id
                }
                className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white"
              >
                <div className="border-b border-forest-900/10 p-6 sm:p-8">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ivory-100 text-forest-950">
                        <Landmark className="size-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge
                            status={
                              account.verification_status
                            }
                          />

                          <StatusBadge
                            status={
                              account.funding_eligibility_status
                            }
                          />
                        </div>

                        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
                          {account.institution_name}
                        </h2>

                        <p className="mt-1 text-sm text-stone-500">
                          {formatAccountType(
                            account.account_type,
                          )}

                          {account.account_last_four
                            ? ` •••• ${account.account_last_four}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-forest-950">
                      {formatMoney(
                        moneyNumber(
                          account.current_balance_cents ??
                            account.approximate_balance_cents,
                        ),
                        account.currency,
                      )}
                    </p>
                  </div>

                  <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <DataPoint
                      label="Account holder"
                      value={
                        account.account_holder_name
                      }
                    />

                    <DataPoint
                      label="Plan sponsor"
                      value={
                        account.plan_sponsor ??
                        "Not provided"
                      }
                    />

                    <DataPoint
                      label="Employment"
                      value={
                        humanize(
                          account.employment_status ??
                            "unknown",
                        )
                      }
                    />

                    <DataPoint
                      label="Rollover eligibility"
                      value={
                        humanize(
                          account.rollover_eligibility,
                        )
                      }
                    />

                    <DataPoint
                      label="Connection method"
                      value={
                        humanize(
                          account.connection_method,
                        )
                      }
                    />

                    <DataPoint
                      label="Connection status"
                      value={
                        humanize(
                          account.connection_status,
                        )
                      }
                    />

                    <DataPoint
                      label="Provider"
                      value={
                        account.provider_name ??
                        account.plan_provider ??
                        "Not provided"
                      }
                    />

                    <DataPoint
                      label="Added"
                      value={
                        formatDate(
                          account.created_at,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="bg-ivory-50/50 p-6 sm:p-8">
                  <AdminRetirementAccountControls
                    investorId={
                      userId
                    }
                    accountId={
                      account.id
                    }
                    initialVerificationStatus={
                      account.verification_status
                    }
                    initialFundingEligibilityStatus={
                      account.funding_eligibility_status
                    }
                    initialRejectionReason={
                      account.rejection_reason
                    }
                    initialAdminNotes={
                      account.admin_notes
                    }
                    availableProtectedFields={{
                      account_number:
                        Boolean(
                          account.account_number_encrypted,
                        ),

                      participant_id:
                        Boolean(
                          account.participant_id_encrypted,
                        ),

                      custodian_account_identifier:
                        Boolean(
                          account.custodian_account_identifier_encrypted,
                        ),

                      rollover_identifier:
                        Boolean(
                          account.rollover_identifier_encrypted,
                        ),
                    }}
                  />
                </div>
              </section>
            ),
          )}
        </div>
      )}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Security audit
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          Recent protected-field access
        </h2>

        {accessLogs.length ===
        0 ? (
          <p className="mt-5 text-sm text-stone-500">
            No protected retirement identifiers have been revealed for this investor.
          </p>
        ) : (
          <div className="mt-6 divide-y divide-forest-900/10">
            {accessLogs.map(
              (
                log,
              ) => (
                <div
                  key={
                    log.id
                  }
                  className="grid gap-2 py-4 sm:grid-cols-[1fr_1.5fr_auto]"
                >
                  <p className="text-sm font-semibold text-forest-950">
                    {humanize(
                      log.field_name,
                    )}
                  </p>

                  <p className="text-sm text-stone-600">
                    {log.reason}
                  </p>

                  <p className="text-xs text-stone-400">
                    {formatDateTime(
                      log.accessed_at,
                    )}
                  </p>
                </div>
              ),
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
  value: string;
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

      <p className="mt-1 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const positive =
    status ===
      "verified" ||
    status ===
      "eligible";

  const pending =
    status ===
      "pending_review" ||
    status ===
      "under_review";

  const Icon =
    positive
      ? CircleCheck
      : CircleAlert;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
        positive
          ? "bg-emerald-50 text-emerald-700"
          : pending
            ? "bg-amber-50 text-amber-700"
            : "bg-stone-100 text-stone-600"
      }`}
    >
      <Icon className="size-3" />

      {humanize(
        status,
      )}
    </span>
  );
}

function moneyNumber(
  value:
    | number
    | string
    | null,
) {
  if (
    value === null
  ) {
    return 0;
  }

  const number =
    Number(value);

  return Number.isFinite(
    number,
  )
    ? number
    : 0;
}

function formatMoney(
  cents: number,
  currency: string,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",
      currency:
        currency ||
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
      dateStyle:
        "medium",
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
      dateStyle:
        "medium",
      timeStyle:
        "short",
    },
  ).format(
    new Date(
      value,
    ),
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

function formatAccountType(
  type: string,
) {
  const labels:
    Record<
      string,
      string
    > = {
      "401k":
        "401(k)",
      "403b":
        "403(b)",
      "457b":
        "457(b)",
      traditional_ira:
        "Traditional IRA",
      roth_ira:
        "Roth IRA",
      sep_ira:
        "SEP IRA",
      simple_ira:
        "SIMPLE IRA",
      rollover_ira:
        "Rollover IRA",
      pension:
        "Pension",
      other:
        "Other",
    };

  return (
    labels[type] ??
    humanize(type)
  );
}