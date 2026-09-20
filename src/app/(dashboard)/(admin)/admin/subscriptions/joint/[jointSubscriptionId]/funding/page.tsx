import {
  ArrowLeft,
  Bitcoin,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Landmark,
  UsersRound,
} from "lucide-react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";
import {
  JointFundingAdminActions,
} from "@/src/components/admin/subscriptions/joint-funding-admin-actions";
import {
  JointInvestmentFinalizeAction,
} from "@/src/components/admin/subscriptions/joint-investment-finalize-action";

type PageProps = {
  params: Promise<{
    jointSubscriptionId: string;
  }>;
};

type FundingObligation = {
  id: string;
  joint_subscription_id: string;
  member_id: string;
  investor_id: string;
  opportunity_id: string;
  obligation_amount: number;
  funded_amount: number;
  currency: string;
  status: string;
  funded_at: string | null;
};

type ExternalFunding = {
  id: string;
  joint_subscription_id: string;
  funding_obligation_id: string;
  member_id: string;
  investor_id: string;
  opportunity_id: string;

  payment_method:
    | "wire_transfer"
    | "bitcoin";

  principal_amount_cents: number;
  currency: string;

  wire_charge_rate_bps: number;
  wire_charge_amount_cents: number;
  total_amount_due_cents: number;

  status: string;

  requested_at: string;
  instructions_issued_at:
    | string
    | null;

  bank_name: string | null;
  beneficiary_name:
    | string
    | null;
  account_number:
    | string
    | null;
  routing_number:
    | string
    | null;
  swift_code: string | null;
  iban: string | null;
  bank_address:
    | string
    | null;
  payment_reference:
    | string
    | null;

  bitcoin_amount:
    | string
    | number
    | null;
  bitcoin_address:
    | string
    | null;
  bitcoin_payment_url:
    | string
    | null;
  bitcoin_network:
    | string
    | null;

  instructions:
    | string
    | null;

  reported_at:
    | string
    | null;
  reported_wire_reference:
    | string
    | null;
  reported_bitcoin_tx_hash:
    | string
    | null;
  payment_proof_storage_path:
    | string
    | null;
  investor_report_note:
    | string
    | null;

  verified_at:
    | string
    | null;
  verified_by:
    | string
    | null;
  verified_principal_amount_cents:
    | number
    | null;
  verification_note:
    | string
    | null;

  rejected_at:
    | string
    | null;
  rejected_by:
    | string
    | null;
  rejection_reason:
    | string
    | null;

  created_at: string;
  updated_at: string;
};

export default async function AdminJointFundingPage({
  params,
}: PageProps) {
  await requireAdmin();

  const {
    jointSubscriptionId,
  } = await params;

  const admin =
    createAdminClient();

  /* ==========================================================
   * 1. LOAD JOINT
   * ========================================================== */

  const {
    data: joint,
    error: jointError,
  } = await admin
    .from(
      "joint_investment_subscriptions",
    )
    .select(
      `
      id,
      opportunity_id,
      initiated_by,
      total_commitment_amount,
      currency,
      status,
      submitted_at,
      reviewed_at,
      finalized_at,
      created_at,

      opportunity:investment_opportunities!joint_investment_subscriptions_opportunity_id_fkey (
        id,
        slug,
        title,
        asset_category,
        status
      ),

      members:joint_investment_members (
        id,
        investor_id,
        member_slot,
        ownership_bps,
        funding_obligation_bps,
        obligation_amount,
        member_status,

        investor:profiles!joint_investment_members_investor_id_fkey (
          id,
          first_name,
          last_name,
          account_status,
          onboarding_status
        )
      )
      `,
    )
    .eq(
      "id",
      jointSubscriptionId,
    )
    .maybeSingle();

  if (
    jointError ||
    !joint
  ) {
    console.error(
      "Admin joint funding load error:",
      jointError,
    );

    notFound();
  }

  const opportunity =
    firstRelation(
      joint.opportunity,
    );

  if (!opportunity) {
    notFound();
  }

  /* ==========================================================
   * 2. LOAD FUNDING STATE
   * ========================================================== */

  const [
    obligationsResult,
    externalFundingResult,
    positionsResult,
  ] = await Promise.all([
    admin
      .from(
        "joint_investment_funding_obligations",
      )
      .select(
        `
        id,
        joint_subscription_id,
        member_id,
        investor_id,
        opportunity_id,
        obligation_amount,
        funded_amount,
        currency,
        status,
        funded_at
        `,
      )
      .eq(
        "joint_subscription_id",
        joint.id,
      ),

    admin
      .from(
        "joint_investment_external_funding",
      )
      .select(
        `
        id,
        joint_subscription_id,
        funding_obligation_id,
        member_id,
        investor_id,
        opportunity_id,

        payment_method,
        principal_amount_cents,
        currency,

        wire_charge_rate_bps,
        wire_charge_amount_cents,
        total_amount_due_cents,

        status,
        requested_at,
        instructions_issued_at,

        bank_name,
        beneficiary_name,
        account_number,
        routing_number,
        swift_code,
        iban,
        bank_address,
        payment_reference,

        bitcoin_amount,
        bitcoin_address,
        bitcoin_payment_url,
        bitcoin_network,

        instructions,

        reported_at,
        reported_wire_reference,
        reported_bitcoin_tx_hash,
        payment_proof_storage_path,
        investor_report_note,

        verified_at,
        verified_by,
        verified_principal_amount_cents,
        verification_note,

        rejected_at,
        rejected_by,
        rejection_reason,

        created_at,
        updated_at
        `,
      )
      .eq(
        "joint_subscription_id",
        joint.id,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      ),

    admin
      .from(
        "investment_positions",
      )
      .select(
        `
        id,
        investor_id,
        principal_amount,
        currency,
        status,
        funded_at,
        joint_member_id,
        joint_funding_obligation_id
        `,
      )
      .eq(
        "joint_subscription_id",
        joint.id,
      ),
  ]);

  if (
    obligationsResult.error
  ) {
    console.error(
      "Admin joint obligations load error:",
      obligationsResult.error,
    );
  }

  if (
    externalFundingResult.error
  ) {
    console.error(
      "Admin joint external funding load error:",
      externalFundingResult.error,
    );
  }

  if (
    positionsResult.error
  ) {
    console.error(
      "Admin joint positions load error:",
      positionsResult.error,
    );
  }

  const obligations =
    (obligationsResult.data ??
      []) as FundingObligation[];

  const externalFunding =
    (externalFundingResult.data ??
      []) as ExternalFunding[];

  const positions =
    positionsResult.data ??
    [];

  /* ==========================================================
   * 3. MEMBER STATE
   * ========================================================== */

  const members =
    [...(
      joint.members ??
      []
    )].sort(
      (
        first,
        second,
      ) =>
        Number(
          first.member_slot,
        ) -
        Number(
          second.member_slot,
        ),
    );

  const totalObligation =
    obligations.reduce(
      (
        total,
        obligation,
      ) =>
        total +
        Number(
          obligation.obligation_amount,
        ),
      0,
    );

  const totalFunded =
    obligations.reduce(
      (
        total,
        obligation,
      ) =>
        total +
        Number(
          obligation.funded_amount,
        ),
      0,
    );

  const fundingPercent =
    totalObligation > 0
      ? Math.min(
          100,
          Math.round(
            (
              totalFunded /
              totalObligation
            ) * 100,
          ),
        )
      : 0;

  const verifiedCount =
    obligations.filter(
      (obligation) =>
        obligation.status ===
        "funded",
    ).length;

  const canonicalObligationsReady =
    obligations.length === 2 &&
    obligations.every(
      (obligation) =>
        obligation.status === "funded" &&
        Number(obligation.funded_amount) ===
          Number(obligation.obligation_amount) &&
        Boolean(obligation.funded_at),
    );

  const canFinalize =
    joint.status === "funding" &&
    canonicalObligationsReady &&
    totalObligation ===
      Number(joint.total_commitment_amount) &&
    totalFunded ===
      Number(joint.total_commitment_amount) &&
    positions.length === 0 &&
    !joint.finalized_at;

  return (
    <div className="space-y-8">
      <Link
        href={`/admin/subscriptions/joint/${joint.id}`}
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to joint review
      </Link>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="overflow-hidden rounded-[1.75rem] bg-forest-950">
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
           <span className="rounded-full bg-gold-400 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-forest-950">
            Joint 50/50
            </span>

            <span className="rounded-full bg-white/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-widest text-white/70">
              {humanize(
                joint.status,
              )}
            </span>
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
            Joint investment funding
          </p>

          <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
            {opportunity.title}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
            Review each investor&apos;s
            independent 50% funding
            obligation, payment
            instructions, reported
            payment evidence and
            verification status.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <HeroValue
              label="Joint commitment"
              value={formatMoney(
                Number(
                  joint.total_commitment_amount,
                ),
                joint.currency,
              )}
            />

            <HeroValue
              label="Required principal"
              value={formatMoney(
                totalObligation,
                joint.currency,
              )}
            />

            <HeroValue
              label="Verified principal"
              value={formatMoney(
                totalFunded,
                joint.currency,
              )}
            />

            <HeroValue
              label="Members funded"
              value={`${verifiedCount} / 2`}
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          PROGRESS
      ====================================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
              Funding progress
            </p>

            <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
              {fundingPercent}% funded
            </h2>
          </div>

          <p className="text-sm font-semibold text-stone-600">
            {formatMoney(
              totalFunded,
              joint.currency,
            )}{" "}
            of{" "}
            {formatMoney(
              totalObligation,
              joint.currency,
            )}
          </p>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-gold-500 transition-all"
            style={{
              width: `${fundingPercent}%`,
            }}
          />
        </div>

        {joint.status ===
        "funded" ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />

            <div>
              <p className="text-sm font-semibold text-emerald-950">
                Joint investment
                finalized
              </p>

              <p className="mt-1 text-xs leading-6 text-emerald-800">
                Both funding
                obligations were
                verified and the final
                joint investment
                positions have been
                created.
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {/* ======================================================
          MEMBER FUNDING
      ====================================================== */}

      <section>
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <UsersRound className="size-4 text-gold-600" />

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
              Member funding
            </p>
          </div>

          <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
            Funding obligations
          </h2>
        </div>

        <div className="space-y-6">
          {members.map(
            (
              member,
              index,
            ) => {
              const investor =
                firstRelation(
                  member.investor,
                );

              const investorName =
                profileName(
                  investor,
                );

              const obligation =
                obligations.find(
                  (item) =>
                    item.member_id ===
                    member.id,
                ) ?? null;

              const fundingRecord =
                obligation
                  ? externalFunding.find(
                      (item) =>
                        item.funding_obligation_id ===
                        obligation.id,
                    ) ?? null
                  : null;

              const position =
                positions.find(
                  (item) =>
                    item.joint_member_id ===
                    member.id,
                ) ?? null;

              return (
                <MemberFundingCard
                  key={
                    member.id
                  }
                  memberNumber={
                    index + 1
                  }
                  investorName={
                    investorName
                  }
                  investorId={
                    member.investor_id
                  }
                  obligation={
                    obligation
                  }
                  funding={
                    fundingRecord
                  }
                  position={
                    position
                  }
                  currency={
                    joint.currency
                  }
                />
              );
            },
          )}
        </div>
      </section>

      {canFinalize ? (
        <JointInvestmentFinalizeAction
          jointSubscriptionId={joint.id}
          commitmentAmountCents={Number(
            joint.total_commitment_amount,
          )}
          currency={joint.currency}
        />
      ) : null}

      {/* ======================================================
          ACCOUNTING NOTICE
      ====================================================== */}

      <section className="rounded-[1.75rem] border border-gold-500/20 bg-gold-50/40 p-6">
        <div className="flex items-start gap-3">
          <CircleDollarSign className="mt-0.5 size-5 shrink-0 text-gold-700" />

          <div>
            <p className="text-sm font-semibold text-forest-950">
              Principal accounting
            </p>

            <p className="mt-2 max-w-3xl text-xs leading-6 text-stone-600">
              Only each investor&apos;s
              principal obligation
              counts toward the joint
              investment. Wire Transfer
              charges are separate
              platform charges and must
              never be included in
              funded principal,
              positions or opportunity
              funding totals.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
 * MEMBER FUNDING CARD
 * ============================================================ */

function MemberFundingCard({
  memberNumber,
  investorName,
  investorId,
  obligation,
  funding,
  position,
  currency,
}: {
  memberNumber: number;
  investorName: string;
  investorId: string;

  obligation:
    | FundingObligation
    | null;

  funding:
    | ExternalFunding
    | null;

  position:
    | {
        id: string;
        principal_amount:
          | number
          | null;
        status: string;
        funded_at:
          | string
          | null;
      }
    | null;

  currency: string;
}) {
  const isWire =
    funding?.payment_method ===
    "wire_transfer";

  const isBitcoin =
    funding?.payment_method ===
    "bitcoin";

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
      <div className="border-b border-forest-900/10 p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
              Investor {memberNumber}
            </p>

            <h3 className="font-display mt-2 text-3xl font-semibold text-forest-950">
              {investorName}
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              50% ownership · 50%
              funding obligation
            </p>
          </div>

          <FundingStatus
            status={
              obligation?.status ??
              "awaiting_funding"
            }
          />
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <DataPoint
            label="Required principal"
            value={
              obligation
                ? formatMoney(
                    Number(
                      obligation.obligation_amount,
                    ),
                    obligation.currency,
                  )
                : "Not initialized"
            }
          />

          <DataPoint
            label="Funded principal"
            value={
              obligation
                ? formatMoney(
                    Number(
                      obligation.funded_amount,
                    ),
                    obligation.currency,
                  )
                : "—"
            }
          />

          <DataPoint
            label="Payment method"
            value={
              funding
                ? paymentMethodLabel(
                    funding.payment_method,
                  )
                : "Not requested"
            }
          />

          <DataPoint
            label="Payment status"
            value={
              funding
                ? humanize(
                    funding.status,
                  )
                : "Awaiting request"
            }
          />
        </div>

        {funding ? (
          <div className="mt-7 rounded-2xl bg-ivory-50 p-5">
            <div className="flex items-center gap-2">
              {isBitcoin ? (
                <Bitcoin className="size-4 text-gold-700" />
              ) : (
                <Landmark className="size-4 text-gold-700" />
              )}

              <p className="text-sm font-semibold text-forest-950">
                {paymentMethodLabel(
                  funding.payment_method,
                )}
              </p>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <DataPoint
                label="Principal"
                value={formatMoney(
                  Number(
                    funding.principal_amount_cents,
                  ),
                  funding.currency,
                )}
              />

              {isWire ? (
                <>
                  <DataPoint
                    label="Wire charge"
                    value={formatMoney(
                      Number(
                        funding.wire_charge_amount_cents,
                      ),
                      funding.currency,
                    )}
                  />

                  <DataPoint
                    label="Charge rate"
                    value={`${Number(
                      funding.wire_charge_rate_bps,
                    ) / 100}%`}
                  />

                  <DataPoint
                    label="Total amount due"
                    value={formatMoney(
                      Number(
                        funding.total_amount_due_cents,
                      ),
                      funding.currency,
                    )}
                  />
                </>
              ) : null}

              {isBitcoin ? (
                <>
                  <DataPoint
                    label="BTC amount"
                    value={
                      funding.bitcoin_amount !=
                      null
                        ? String(
                            funding.bitcoin_amount,
                          )
                        : "Pending"
                    }
                  />

                  <DataPoint
                    label="Network"
                    value={
                      funding.bitcoin_network ??
                      "Bitcoin"
                    }
                  />
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* INSTRUCTIONS */}

        {funding?.instructions_issued_at ? (
          <div className="mt-6 rounded-2xl border border-forest-900/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
              Instructions issued
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {isWire ? (
                <>
                  <DataPoint
                    label="Bank"
                    value={
                      funding.bank_name ??
                      "—"
                    }
                  />

                  <DataPoint
                    label="Beneficiary"
                    value={
                      funding.beneficiary_name ??
                      "—"
                    }
                  />

                  <DataPoint
                    label="Payment reference"
                    value={
                      funding.payment_reference ??
                      "—"
                    }
                  />
                </>
              ) : null}

              {isBitcoin ? (
                <>
                  <DataPoint
                    label="Receiving address"
                    value={
                      funding.bitcoin_address ??
                      "—"
                    }
                  />

                  <DataPoint
                    label="Payment reference"
                    value={
                      funding.payment_reference ??
                      "—"
                    }
                  />
                </>
              ) : null}

              <DataPoint
                label="Issued"
                value={formatDate(
                  funding.instructions_issued_at,
                )}
              />
            </div>
          </div>
        ) : null}

        {/* INVESTOR REPORT */}

        {funding?.reported_at ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 size-5 shrink-0 text-amber-700" />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-950">
                  Investor reported
                  payment
                </p>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <DataPoint
                    label={
                      isBitcoin
                        ? "Transaction hash"
                        : "Wire reference"
                    }
                    value={
                      isBitcoin
                        ? funding.reported_bitcoin_tx_hash ??
                          "—"
                        : funding.reported_wire_reference ??
                          "—"
                    }
                  />

                  <DataPoint
                    label="Reported"
                    value={formatDate(
                      funding.reported_at,
                    )}
                  />
                </div>

                {funding.investor_report_note ? (
                  <p className="mt-4 text-xs leading-6 text-amber-900">
                    {
                      funding.investor_report_note
                    }
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {/* ADMIN FUNDING ACTION */}

        {funding ? (
          <JointFundingAdminActions
            externalFundingId={
              funding.id
            }
            paymentMethod={
              funding.payment_method
            }
            status={
              funding.status
            }
            principalAmountCents={
              Number(
                funding.principal_amount_cents,
              )
            }
            currency={
              funding.currency
            }
            reportedWireReference={
              funding.reported_wire_reference
            }
            reportedBitcoinTxHash={
              funding.reported_bitcoin_tx_hash
            }
            investorReportNote={
              funding.investor_report_note
            }
          />
        ) : null}

        {/* VERIFIED */}

        {funding?.status ===
        "verified" ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />

              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  Payment verified
                </p>

                <p className="mt-2 text-xs leading-6 text-emerald-800">
                  Verified principal:{" "}
                  {formatMoney(
                    Number(
                      funding.verified_principal_amount_cents ??
                        funding.principal_amount_cents,
                    ),
                    funding.currency,
                  )}
                  .
                </p>

                {funding.verified_at ? (
                  <p className="mt-1 text-xs text-emerald-700">
                    Verified{" "}
                    {formatDate(
                      funding.verified_at,
                    )}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {position ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-forest-950 p-5 text-white">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold-400" />

            <div>
              <p className="text-sm font-semibold">
                Investment position
                created
              </p>

              <p className="mt-1 text-xs leading-6 text-white/60">
                Principal{" "}
                {formatMoney(
                  Number(
                    position.principal_amount ??
                      0,
                  ),
                  currency,
                )}{" "}
                ·{" "}
                {humanize(
                  position.status,
                )}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <Link
            href={`/admin/investors/${investorId}`}
            className="focus-ring inline-flex min-h-10 cursor-pointer items-center rounded-full border border-forest-900/10 px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
          >
            View investor profile
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
 * HELPERS
 * ============================================================ */

function HeroValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/40">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-white">
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
    <div className="min-w-0">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-1 wrap-break-word text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function FundingStatus({
  status,
}: {
  status: string;
}) {
  const funded =
    status === "funded";

  return (
    <span
      className={`inline-flex self-start rounded-full px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-widest ${
        funded
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {humanize(
        status,
      )}
    </span>
  );
}

function firstRelation<T>(
  value:
    | T
    | T[]
    | null
    | undefined,
): T | null {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function profileName(
  profile:
    | {
        first_name:
          | string
          | null;
        last_name:
          | string
          | null;
      }
    | null
    | undefined,
) {
  if (!profile) {
    return "Investor";
  }

  return (
    [
      profile.first_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Investor"
  );
}

function paymentMethodLabel(
  method: string,
) {
  if (
    method ===
    "wire_transfer"
  ) {
    return "Wire Transfer";
  }

  if (
    method ===
    "bitcoin"
  ) {
    return "Bitcoin";
  }

  return humanize(
    method,
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
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
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
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}