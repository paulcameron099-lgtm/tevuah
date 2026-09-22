import {
  ArrowLeft,
  ArrowRight,
  Bitcoin,
  Building2,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Landmark,
  ShieldCheck,
  UserRound,
  UsersRound,
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

import {
  createClient,
} from "@/src/lib/supabase/server";

import {
  JointInvestmentFundingActions,
} from "@/src/components/investments/joint-investment-funding-actions";

import JointWithdrawalRequest from "@/src/components/investments/joint-withdrawal-request";

/* ============================================================
 * TYPES
 * ============================================================ */

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type JointStatus = {
  joint_subscription_id: string;

  opportunity_id: string;
  opportunity_title: string;
  opportunity_slug: string;
  opportunity_asset_category:
    | string
    | null;
  opportunity_location:
    | string
    | null;

  initiated_by: string;

  total_commitment_amount: number;
  currency: string;

  parent_status: string;

  submitted_at:
    | string
    | null;
  reviewed_at:
    | string
    | null;
  approved_at:
    | string
    | null;

  rejection_reason:
    | string
    | null;

  created_at: string;
  updated_at: string;

  current_user_member_id: string;
  current_user_member_slot: number;
  current_user_member_status: string;

  current_user_ownership_bps: number;
  current_user_funding_obligation_bps: number;
  current_user_obligation_amount: number;

  current_user_consent_status:
    | string
    | null;

  other_member_id: string;
  other_member_investor_id: string;

  other_member_first_name:
    | string
    | null;

  other_member_last_name:
    | string
    | null;

  other_member_slot: number;
  other_member_status: string;

  other_member_ownership_bps: number;
  other_member_funding_obligation_bps: number;
  other_member_obligation_amount: number;

  other_member_consent_status:
    | string
    | null;

  invitation_status:
    | string
    | null;

  invitation_expires_at:
    | string
    | null;

  both_members_accepted: boolean;
  both_consents_accepted: boolean;
  ready_for_review: boolean;
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

  funded_at:
    | string
    | null;
};

type ExternalFunding = {
  id: string;

  joint_subscription_id: string;
  funding_obligation_id: string;
  member_id: string;
  investor_id: string;
  opportunity_id: string;

  payment_method: string;

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

  instructions_issued_by:
    | string
    | null;

  bank_name:
    | string
    | null;

  beneficiary_name:
    | string
    | null;

  account_number:
    | string
    | null;

  routing_number:
    | string
    | null;

  swift_code:
    | string
    | null;

  iban:
    | string
    | null;

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

type Position = {
  id: string;

  investor_id: string;
  opportunity_id: string;

  principal_amount: number;
  currency: string;

  status: string;
  funded_at: string;

  joint_subscription_id: string;
  joint_member_id: string;
  joint_funding_obligation_id: string;
};

/* ============================================================
 * PAGE
 * ============================================================ */

export default async function JointInvestmentPage({
  params,
}: PageProps) {
  /* ----------------------------------------------------------
   * 1. AUTH
   * ---------------------------------------------------------- */

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

  const {
    id,
  } = await params;

  /* ----------------------------------------------------------
   * 2. AUTHORIZED JOINT STATUS
   *
   * IMPORTANT:
   * This uses the authenticated SSR client because the RPC
   * authorizes through auth.uid().
   * ---------------------------------------------------------- */

  const supabase =
    await createClient();

  const {
    data: statusData,
    error: statusError,
  } = await supabase.rpc(
    "get_joint_investment_status",
    {
      p_joint_subscription_id:
        id,
    },
  );

  if (statusError) {
    console.error(
      "Joint investment status error:",
      statusError,
    );

    notFound();
  }

  const joint =
    (
      statusData ??
      []
    )[0] as
      | JointStatus
      | undefined;

  if (!joint) {
    notFound();
  }

  /*
   * Defense in depth:
   * the RPC must return the current member identity.
   */
  if (
    !joint.current_user_member_id
  ) {
    notFound();
  }

  /* ----------------------------------------------------------
   * 3. LOAD FUNDING / POSITION DATA
   *
   * We can now use the server-only admin client because the
   * membership authorization above has already succeeded.
   * ---------------------------------------------------------- */

  const admin =
    createAdminClient();

  const [
    obligationsResult,
    externalFundingResult,
    positionsResult,
    cashAccountResult,
    currentProfileResult,
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
        id,
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
    instructions_issued_by,

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
    id,
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
        opportunity_id,
        principal_amount,
        currency,
        status,
        funded_at,
        joint_subscription_id,
        joint_member_id,
        joint_funding_obligation_id
        `,
      )
      .eq(
        "joint_subscription_id",
        id,
      ),

    admin
      .from(
        "investor_cash_accounts",
      )
      .select(
        `
        id,
        investor_id,
        currency,
        available_balance_cents,
        status
        `,
      )
      .eq(
        "investor_id",
        user.id,
      )
      .eq(
        "currency",
        joint.currency || "USD",
      )
      .maybeSingle(),

    admin
      .from(
        "profiles",
      )
      .select(
        `
        id,
        first_name,
        last_name,
        account_status
        `,
      )
      .eq(
        "id",
        user.id,
      )
      .maybeSingle(),
  ]);

  if (
    obligationsResult.error
  ) {
    console.error(
      "Joint funding obligations error:",
      obligationsResult.error,
    );
  }

  if (
    externalFundingResult.error
  ) {
    console.error(
      "Joint external funding error:",
      externalFundingResult.error,
    );
  }

  if (
    positionsResult.error
  ) {
    console.error(
      "Joint positions error:",
      positionsResult.error,
    );
  }

  if (
    cashAccountResult.error
  ) {
    console.error(
      "Joint Cash Account load error:",
      cashAccountResult.error,
    );
  }

  if (
    currentProfileResult.error
  ) {
    console.error(
      "Joint investor profile load error:",
      currentProfileResult.error,
    );
  }

  const currentProfile =
    currentProfileResult.data;

  const cashAccount =
    cashAccountResult.data;

  const cashAccountAvailableBalanceCents =
    cashAccount &&
    cashAccount.status ===
      "active"
      ? Number(
          cashAccount.available_balance_cents,
        )
      : null;

  const obligations =
    (
      obligationsResult.data ??
      []
    ) as FundingObligation[];

  const externalFunding =
    (
      externalFundingResult.data ??
      []
    ) as ExternalFunding[];

  const positions =
    (
      positionsResult.data ??
      []
    ) as Position[];

  /* ----------------------------------------------------------
   * 4. MEMBER-SPECIFIC STATE
   * ---------------------------------------------------------- */

  const myObligation =
    obligations.find(
      (
        obligation,
      ) =>
        obligation.investor_id ===
        user.id,
    ) ?? null;

  const otherObligation =
    obligations.find(
      (
        obligation,
      ) =>
        obligation.investor_id ===
        joint.other_member_investor_id,
    ) ?? null;

  /*
   * Latest external funding record for each obligation.
   *
   * Query is already newest-first.
   */
  const myExternalFunding =
    myObligation
      ? externalFunding.find(
          (
            funding,
          ) =>
            funding.funding_obligation_id ===
            myObligation.id,
        ) ?? null
      : null;

  const otherExternalFunding =
    otherObligation
      ? externalFunding.find(
          (
            funding,
          ) =>
            funding.funding_obligation_id ===
            otherObligation.id,
        ) ?? null
      : null;

  const myPosition =
    positions.find(
      (
        position,
      ) =>
        position.investor_id ===
        user.id,
    ) ?? null;

  const otherPosition =
    positions.find(
      (
        position,
      ) =>
        position.investor_id ===
        joint.other_member_investor_id,
    ) ?? null;

  const otherMemberName =
    fullName(
      joint.other_member_first_name,
      joint.other_member_last_name,
    );

  const currency =
    joint.currency ||
    "USD";

  const totalFunded =
    obligations.reduce(
      (
        total,
        obligation,
      ) =>
        total +
        Number(
          obligation.funded_amount ??
            0,
        ),
      0,
    );

  const fundingPercent =
    joint.total_commitment_amount >
    0
      ? Math.min(
          100,
          Math.round(
            (
              totalFunded /
              Number(
                joint.total_commitment_amount,
              )
            ) *
              100,
          ),
        )
      : 0;

  const withdrawalEligible =
    joint.parent_status ===
      "funded" &&
    Boolean(
      myPosition &&
        myPosition.status ===
          "active",
    ) &&
    Boolean(
      otherPosition &&
        otherPosition.status ===
          "active",
    );

  /* ----------------------------------------------------------
   * 5. RENDER
   * ---------------------------------------------------------- */

  return (
    <div className="space-y-8 pb-10">
      {/* ======================================================
          BACK
      ====================================================== */}

      <Link
        href="/dashboard/investments"
        className="focus-ring inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-forest-950"
      >
        <ArrowLeft className="size-4" />

        My Investments
      </Link>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="overflow-hidden rounded-4xl bg-forest-950 text-white">
        <div className="relative p-7 sm:p-9 lg:p-11">
          <div className="absolute right-0 top-0 size-72 translate-x-1/3 -translate-y-1/3 rounded-full border border-white/10" />

          <div className="absolute right-16 top-12 size-40 rounded-full border border-gold-500/20" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white">
                <UsersRound className="size-3.5" />

                Joint Investment
              </span>

              <JointStatusBadge
                status={
                  joint.parent_status
                }
              />
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
                  {joint.opportunity_asset_category
                    ? humanize(
                        joint.opportunity_asset_category,
                      )
                    : "Private Markets"}
                </p>

                <h1 className="font-display mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                  {
                    joint.opportunity_title
                  }
                </h1>

                {joint.opportunity_location ? (
                  <p className="mt-4 text-sm text-white/60">
                    {
                      joint.opportunity_location
                    }
                  </p>
                ) : null}
              </div>

              <div className="min-w-57.5 rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/50">
                  Total joint commitment
                </p>

                <p className="font-display mt-2 text-3xl font-semibold text-white">
                  {formatMoney(
                    Number(
                      joint.total_commitment_amount,
                    ),
                    currency,
                  )}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs text-white/50">
                    Ownership
                  </span>

                  <span className="text-sm font-semibold text-gold-400">
                    50 / 50
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FUNDING PROGRESS
      ====================================================== */}

      {(joint.parent_status ===
        "approved" ||
        joint.parent_status ===
          "funding" ||
        joint.parent_status ===
          "funded") && (
        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                Funding Progress
              </p>

              <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
                {formatMoney(
                  totalFunded,
                  currency,
                )}{" "}
                of{" "}
                {formatMoney(
                  Number(
                    joint.total_commitment_amount,
                  ),
                  currency,
                )}
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Combined verified
                investment principal
                across both members.
              </p>
            </div>

            <p className="font-display text-3xl font-semibold text-forest-950">
              {fundingPercent}%
            </p>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-forest-950 transition-all"
              style={{
                width: `${fundingPercent}%`,
              }}
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs text-stone-500">
            <span>
              Your funding:{" "}
              <strong className="text-forest-950">
                {formatMoney(
                  Number(
                    myObligation?.funded_amount ??
                      0,
                  ),
                  currency,
                )}
              </strong>
            </span>

            <span>
              {otherMemberName}:{" "}
              <strong className="text-forest-950">
                {formatMoney(
                  Number(
                    otherObligation?.funded_amount ??
                      0,
                  ),
                  currency,
                )}
              </strong>
            </span>
          </div>
        </section>
      )}

      {/* ======================================================
          LIFECYCLE
      ====================================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            Investment Journey
          </p>

          <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
            Joint investment lifecycle
          </h2>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-4">
          <LifecycleStep
            label="Agreement"
            description="Both members accept and sign."
            complete={
              joint.both_members_accepted &&
              joint.both_consents_accepted
            }
            active={
              joint.parent_status ===
                "awaiting_member_acceptance" ||
              joint.parent_status ===
                "draft"
            }
          />

          <LifecycleStep
            label="Review"
            description="Administrative investment review."
            complete={
              [
                "approved",
                "funding",
                "funded",
              ].includes(
                joint.parent_status,
              )
            }
            active={
              [
                "submitted",
                "under_review",
              ].includes(
                joint.parent_status,
              )
            }
          />

          <LifecycleStep
            label="Funding"
            description="Each member funds their obligation."
            complete={
              joint.parent_status ===
              "funded"
            }
            active={
              [
                "approved",
                "funding",
              ].includes(
                joint.parent_status,
              )
            }
          />

          <LifecycleStep
            label="Active"
            description="Positions created and investment active."
            complete={
              joint.parent_status ===
                "funded" &&
              positions.length ===
                2
            }
            active={
              joint.parent_status ===
                "funded" &&
              positions.length <
                2
            }
          />
        </div>
      </section>

      {/* ======================================================
          OWNERSHIP
      ====================================================== */}

      <section>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            Ownership
          </p>

          <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
            Your 50/50 investment
            structure
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <MemberCard
            eyebrow="You"
            name="Your investment"
            icon={
              <UserRound className="size-5" />
            }
            ownershipBps={
              joint.current_user_ownership_bps
            }
            obligationAmount={
              joint.current_user_obligation_amount
            }
            currency={
              currency
            }
            memberStatus={
              joint.current_user_member_status
            }
            consentStatus={
              joint.current_user_consent_status
            }
            fundingStatus={
              myObligation?.status ??
              null
            }
            fundedAmount={
              Number(
                myObligation?.funded_amount ??
                  0,
              )
            }
            position={
              myPosition
            }
          />

          <MemberCard
            eyebrow="Joint investor"
            name={
              otherMemberName
            }
            icon={
              <UsersRound className="size-5" />
            }
            ownershipBps={
              joint.other_member_ownership_bps
            }
            obligationAmount={
              joint.other_member_obligation_amount
            }
            currency={
              currency
            }
            memberStatus={
              joint.other_member_status
            }
            consentStatus={
              joint.other_member_consent_status
            }
            fundingStatus={
              otherObligation?.status ??
              null
            }
            fundedAmount={
              Number(
                otherObligation?.funded_amount ??
                  0,
              )
            }
            position={
              otherPosition
            }
          />
        </div>
      </section>

      {/* ======================================================
          YOUR FUNDING
      ====================================================== */}

      {myObligation ? (
        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white">
          <div className="border-b border-forest-900/10 px-6 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-ivory-100 text-forest-950">
                <CircleDollarSign className="size-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                  Your Funding
                </p>

                <h2 className="font-display mt-1 text-xl font-semibold text-forest-950">
                  Funding obligation
                </h2>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <DataPoint
                label="Investment principal"
                value={formatMoney(
                  Number(
                    myObligation.obligation_amount,
                  ),
                  currency,
                )}
              />

              <DataPoint
                label="Funded principal"
                value={formatMoney(
                  Number(
                    myObligation.funded_amount,
                  ),
                  currency,
                )}
              />

              <DataPoint
                label="Funding status"
                value={humanize(
                  myObligation.status,
                )}
              />

              <DataPoint
                label="Funded"
                value={
                  myObligation.funded_at
                    ? formatDate(
                        myObligation.funded_at,
                      )
                    : "Pending"
                }
              />
            </div>

 {myExternalFunding ? (
  <div className="mt-7 border-t border-forest-900/10 pt-7">
    <ExternalFundingPanel
      funding={
        myExternalFunding
      }
      currency={
        currency
      }
    />
  </div>
) : null}

<JointInvestmentFundingActions
  fundingObligationId={
    myObligation.id
  }
  obligationAmountCents={
    Number(
      myObligation.obligation_amount,
    )
  }
  currency={
    currency
  }
  jointStatus={
    joint.parent_status
  }
  cashAccountAvailableBalanceCents={
    cashAccountAvailableBalanceCents
  }
  funding={
    myExternalFunding
      ? {
          id:
            myExternalFunding.id,

          payment_method:
            myExternalFunding.payment_method,

          status:
            myExternalFunding.status,

          payment_reference:
            myExternalFunding.payment_reference,

          instructions_issued_at:
            myExternalFunding.instructions_issued_at,

          bank_name:
            myExternalFunding.bank_name,

          beneficiary_name:
            myExternalFunding.beneficiary_name,

          account_number:
            myExternalFunding.account_number,

          routing_number:
            myExternalFunding.routing_number,

          swift_code:
            myExternalFunding.swift_code,

          iban:
            myExternalFunding.iban,

          bank_address:
            myExternalFunding.bank_address,

          bitcoin_amount:
            myExternalFunding.bitcoin_amount,

          bitcoin_address:
            myExternalFunding.bitcoin_address,

          bitcoin_network:
            myExternalFunding.bitcoin_network,

          instructions:
            myExternalFunding.instructions,

          reported_at:
            myExternalFunding.reported_at,

          reported_wire_reference:
            myExternalFunding.reported_wire_reference,

          reported_bitcoin_tx_hash:
            myExternalFunding.reported_bitcoin_tx_hash,

          investor_report_note:
            myExternalFunding.investor_report_note,

          verified_at:
            myExternalFunding.verified_at,
        }
      : null
  }
/>
          </div>
        </section>
      ) : null}

      {/* ======================================================
          YOUR POSITION
      ====================================================== */}

      {myPosition ? (
        <section className="overflow-hidden rounded-[1.75rem] border border-emerald-900/10 bg-emerald-50/50">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="size-6" />
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  Your Position
                </p>

                <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
                  Investment position
                  active
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
                  Your joint funding
                  obligation has been
                  finalized into your
                  individual beneficial
                  investment position.
                </p>
              </div>

              <div className="grid min-w-0 gap-5 rounded-3xl border border-emerald-900/10 bg-white p-5 sm:grid-cols-3 lg:min-w-135">
                <DataPoint
                  label="Principal"
                  value={formatMoney(
                    Number(
                      myPosition.principal_amount,
                    ),
                    myPosition.currency,
                  )}
                />

                <DataPoint
                  label="Ownership"
                  value={formatBasisPoints(
                    joint.current_user_ownership_bps,
                  )}
                />

                <DataPoint
                  label="Position status"
                  value={humanize(
                    myPosition.status,
                  )}
                />

                <DataPoint
                  label="Funded"
                  value={formatDate(
                    myPosition.funded_at,
                  )}
                />

                <DataPoint
                  label="Structure"
                  value="Joint · 50/50"
                />

                <DataPoint
                  label="Currency"
                  value={
                    myPosition.currency
                  }
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ======================================================
          JOINT WITHDRAWAL
      ====================================================== */}

      {withdrawalEligible ? (
        <JointWithdrawalRequest
          jointSubscriptionId={
            joint.joint_subscription_id
          }
          opportunityTitle={
            joint.opportunity_title
          }
          totalCommitmentAmountCents={
            Number(
              joint.total_commitment_amount,
            )
          }
          currency={
            currency
          }
          actorMemberSlot={
            Number(
              joint.current_user_member_slot,
            )
          }
          actorFirstName={
            currentProfile?.first_name ??
            null
          }
          actorLastName={
            currentProfile?.last_name ??
            null
          }
          actorAccountStatus={
            currentProfile?.account_status ??
            null
          }
          otherInvestorFirstName={
            joint.other_member_first_name
          }
          otherInvestorLastName={
            joint.other_member_last_name
          }
        />
      ) : null}

      {/* ======================================================
          PARTNER FUNDING — READ ONLY
      ====================================================== */}

      {otherObligation ? (
        <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ivory-100 text-forest-950">
              <UsersRound className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                Joint Investor
              </p>

              <h2 className="font-display mt-1 text-xl font-semibold text-forest-950">
                {otherMemberName}
              </h2>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                Funding information
                below is read-only.
                Each investor manages
                only their own funding
                obligation.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <DataPoint
              label="Obligation"
              value={formatMoney(
                Number(
                  otherObligation.obligation_amount,
                ),
                currency,
              )}
            />

            <DataPoint
              label="Funded principal"
              value={formatMoney(
                Number(
                  otherObligation.funded_amount,
                ),
                currency,
              )}
            />

            <DataPoint
              label="Funding status"
              value={humanize(
                otherObligation.status,
              )}
            />

            <DataPoint
              label="Method"
              value={
                otherExternalFunding
                  ? paymentMethodLabel(
                      otherExternalFunding.payment_method,
                    )
                  : "Not selected"
              }
            />
          </div>
        </section>
      ) : null}

      {/* ======================================================
          REJECTION
      ====================================================== */}

      {joint.parent_status ===
        "rejected" &&
      joint.rejection_reason ? (
        <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
            Investment not approved
          </p>

          <p className="mt-3 text-sm leading-7 text-red-900">
            {
              joint.rejection_reason
            }
          </p>
        </section>
      ) : null}

      {/* ======================================================
          OPPORTUNITY
      ====================================================== */}

      {joint.opportunity_slug ? (
        <div className="flex justify-end">
          <Link
            href={`/investments/${joint.opportunity_slug}`}
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-5 text-sm font-semibold text-forest-950 transition hover:bg-ivory-50"
          >
            View opportunity

            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
 * LIFECYCLE
 * ============================================================ */

function LifecycleStep({
  label,
  description,
  complete,
  active,
}: {
  label: string;
  description: string;
  complete: boolean;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        complete
          ? "border-emerald-200 bg-emerald-50"
          : active
            ? "border-gold-300 bg-ivory-50"
            : "border-forest-900/10 bg-stone-50"
      }`}
    >
      <div
        className={`flex size-8 items-center justify-center rounded-full ${
          complete
            ? "bg-emerald-600 text-white"
            : active
              ? "bg-gold-600 text-white"
              : "bg-stone-200 text-stone-500"
        }`}
      >
        {complete ? (
          <Check className="size-4" />
        ) : (
          <Clock3 className="size-4" />
        )}
      </div>

      <p className="mt-4 text-sm font-semibold text-forest-950">
        {label}
      </p>

      <p className="mt-1 text-xs leading-5 text-stone-500">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
 * MEMBER CARD
 * ============================================================ */

function MemberCard({
  eyebrow,
  name,
  icon,
  ownershipBps,
  obligationAmount,
  currency,
  memberStatus,
  consentStatus,
  fundingStatus,
  fundedAmount,
  position,
}: {
  eyebrow: string;
  name: string;
  icon: React.ReactNode;
  ownershipBps: number;
  obligationAmount: number;
  currency: string;
  memberStatus: string;
  consentStatus:
    | string
    | null;
  fundingStatus:
    | string
    | null;
  fundedAmount: number;
  position:
    | Position
    | null;
}) {
  const accepted =
    memberStatus ===
      "accepted" &&
    consentStatus ===
      "accepted";

  const funded =
    fundingStatus ===
      "funded" ||
    Boolean(
      position,
    );

  return (
    <article className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-ivory-100 text-forest-950">
            {icon}
          </div>

          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold-600">
              {eyebrow}
            </p>

            <h3 className="font-display mt-1 text-xl font-semibold text-forest-950">
              {name}
            </h3>
          </div>
        </div>

        <span className="rounded-full bg-forest-950 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white">
          {formatBasisPoints(
            ownershipBps,
          )}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5 border-t border-forest-900/10 pt-5">
        <DataPoint
          label="Funding obligation"
          value={formatMoney(
            Number(
              obligationAmount,
            ),
            currency,
          )}
        />

        <DataPoint
          label="Funded principal"
          value={formatMoney(
            fundedAmount,
            currency,
          )}
        />
      </div>

      <div className="mt-6 space-y-3">
        <StateRow
          label="Agreement"
          complete={
            accepted
          }
          value={
            accepted
              ? "Accepted & signed"
              : humanize(
                  memberStatus,
                )
          }
        />

        <StateRow
          label="Funding"
          complete={
            funded
          }
          value={
            funded
              ? "Funded"
              : fundingStatus
                ? humanize(
                    fundingStatus,
                  )
                : "Not started"
          }
        />

        <StateRow
          label="Position"
          complete={
            Boolean(
              position,
            )
          }
          value={
            position
              ? humanize(
                  position.status,
                )
              : "Not created"
          }
        />
      </div>
    </article>
  );
}

function StateRow({
  label,
  value,
  complete,
}: {
  label: string;
  value: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-stone-50 px-4 py-3">
      <span className="text-xs text-stone-500">
        {label}
      </span>

      <span className="flex items-center gap-2 text-xs font-semibold text-forest-950">
        {complete ? (
          <CheckCircle2 className="size-3.5 text-emerald-600" />
        ) : (
          <Clock3 className="size-3.5 text-amber-600" />
        )}

        {value}
      </span>
    </div>
  );
}

/* ============================================================
 * EXTERNAL FUNDING
 * ============================================================ */

function ExternalFundingPanel({
  funding,
  currency,
}: {
  funding: ExternalFunding;
  currency: string;
}) {
  const wire =
    funding.payment_method ===
    "wire_transfer";

  const bitcoin =
    funding.payment_method ===
    "bitcoin";

  const verified =
    funding.status ===
    "verified";

  const reported =
    funding.status ===
      "payment_reported" ||
    funding.status ===
      "pending_verification" ||
    Boolean(
      funding.reported_at,
    );

  return (
    <div>
      {/* ====================================================
          METHOD + STATUS
      ==================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-forest-950 text-white">
            {wire ? (
              <Landmark className="size-4" />
            ) : bitcoin ? (
              <Bitcoin className="size-4" />
            ) : (
              <WalletCards className="size-4" />
            )}
          </div>

          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-stone-400">
              Funding method
            </p>

            <p className="mt-1 text-sm font-semibold text-forest-950">
              {paymentMethodLabel(
                funding.payment_method,
              )}
            </p>
          </div>
        </div>

        <FundingStatusBadge
          status={
            funding.status
          }
        />
      </div>

      {/* ====================================================
          FINANCIAL SUMMARY
      ==================================================== */}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DataPoint
          label="Investment principal"
          value={formatMoney(
            Number(
              funding.principal_amount_cents,
            ),
            currency,
          )}
        />

        <DataPoint
          label={
            wire
              ? "Wire charge"
              : "Platform charge"
          }
          value={formatMoney(
            Number(
              funding.wire_charge_amount_cents,
            ),
            currency,
          )}
        />

        <DataPoint
          label="Total amount due"
          value={formatMoney(
            Number(
              funding.total_amount_due_cents,
            ),
            currency,
          )}
        />

        <DataPoint
          label="Payment reference"
          value={
            funding.payment_reference ??
            "Pending"
          }
        />
      </div>

      {/* ====================================================
          IMPORTANT PRINCIPAL / FEE SEPARATION
      ==================================================== */}

      {wire &&
      funding.wire_charge_amount_cents >
        0 ? (
        <div className="mt-6 rounded-2xl border border-gold-200 bg-ivory-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">
            Payment breakdown
          </p>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Your{" "}
            <strong className="text-forest-950">
              {formatMoney(
                Number(
                  funding.principal_amount_cents,
                ),
                currency,
              )}
            </strong>{" "}
            investment principal
            becomes part of your
            investment position. The{" "}
            <strong className="text-forest-950">
              {formatMoney(
                Number(
                  funding.wire_charge_amount_cents,
                ),
                currency,
              )}
            </strong>{" "}
            wire charge is separate
            and is not included in
            your investment principal
            or position value.
          </p>
        </div>
      ) : null}

      {/* ====================================================
          WIRE INSTRUCTIONS
      ==================================================== */}

      {wire &&
      funding.instructions_issued_at ? (
        <div className="mt-6 rounded-3xl bg-ivory-50 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-gold-700" />

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">
              Wire Instructions
            </p>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {funding.bank_name ? (
              <DataPoint
                label="Bank"
                value={
                  funding.bank_name
                }
              />
            ) : null}

            {funding.beneficiary_name ? (
              <DataPoint
                label="Beneficiary"
                value={
                  funding.beneficiary_name
                }
              />
            ) : null}

            {funding.account_number ? (
              <DataPoint
                label="Account number"
                value={
                  funding.account_number
                }
              />
            ) : null}

            {funding.routing_number ? (
              <DataPoint
                label="Routing number"
                value={
                  funding.routing_number
                }
              />
            ) : null}

            {funding.swift_code ? (
              <DataPoint
                label="SWIFT"
                value={
                  funding.swift_code
                }
              />
            ) : null}

            {funding.iban ? (
              <DataPoint
                label="IBAN"
                value={
                  funding.iban
                }
              />
            ) : null}

            {funding.bank_address ? (
              <DataPoint
                label="Bank address"
                value={
                  funding.bank_address
                }
              />
            ) : null}

            {funding.payment_reference ? (
              <DataPoint
                label="Payment reference"
                value={
                  funding.payment_reference
                }
              />
            ) : null}
          </div>

          {funding.instructions ? (
            <div className="mt-5 border-t border-forest-900/10 pt-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
                Additional instructions
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-600">
                {
                  funding.instructions
                }
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ====================================================
          BITCOIN INSTRUCTIONS
      ==================================================== */}

      {bitcoin &&
      funding.instructions_issued_at ? (
        <div className="mt-6 rounded-3xl bg-ivory-50 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Bitcoin className="size-4 text-gold-700" />

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700">
              Bitcoin Instructions
            </p>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {funding.bitcoin_amount !=
            null ? (
              <DataPoint
                label="Bitcoin amount"
                value={`${funding.bitcoin_amount} BTC`}
              />
            ) : null}

            {funding.bitcoin_network ? (
              <DataPoint
                label="Network"
                value={
                  funding.bitcoin_network
                }
              />
            ) : null}

            {funding.bitcoin_address ? (
              <DataPoint
                label="Bitcoin address"
                value={
                  funding.bitcoin_address
                }
              />
            ) : null}

            {funding.payment_reference ? (
              <DataPoint
                label="Payment reference"
                value={
                  funding.payment_reference
                }
              />
            ) : null}
          </div>

          {funding.bitcoin_payment_url ? (
            <div className="mt-5">
              <a
                href={
                  funding.bitcoin_payment_url
                }
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-stone-50"
              >
                Open Bitcoin payment

                <ArrowRight className="size-3.5" />
              </a>
            </div>
          ) : null}

          {funding.instructions ? (
            <div className="mt-5 border-t border-forest-900/10 pt-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
                Additional instructions
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-600">
                {
                  funding.instructions
                }
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ====================================================
          REPORTED PAYMENT
      ==================================================== */}

      {reported ? (
        <div className="mt-6 rounded-3xl border border-forest-900/10 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
            Payment Report
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {wire &&
            funding.reported_wire_reference ? (
              <DataPoint
                label="Wire reference"
                value={
                  funding.reported_wire_reference
                }
              />
            ) : null}

            {bitcoin &&
            funding.reported_bitcoin_tx_hash ? (
              <DataPoint
                label="Transaction hash"
                value={
                  funding.reported_bitcoin_tx_hash
                }
              />
            ) : null}

            {funding.reported_at ? (
              <DataPoint
                label="Reported"
                value={formatDate(
                  funding.reported_at,
                )}
              />
            ) : null}
          </div>

          {funding.investor_report_note ? (
            <div className="mt-5 border-t border-forest-900/10 pt-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
                Your note
              </p>

              <p className="mt-2 text-sm leading-7 text-stone-600">
                {
                  funding.investor_report_note
                }
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ====================================================
          VERIFIED
      ==================================================== */}

      {verified ? (
        <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-900">
                Funding verified
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-800">
                Tevuah Reserve has
                verified your
                investment funding.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <DataPoint
                  label="Verified principal"
                  value={formatMoney(
                    Number(
                      funding.verified_principal_amount_cents ??
                        funding.principal_amount_cents,
                    ),
                    currency,
                  )}
                />

                <DataPoint
                  label="Verified"
                  value={
                    funding.verified_at
                      ? formatDate(
                          funding.verified_at,
                        )
                      : "Verified"
                  }
                />
              </div>

              {funding.verification_note ? (
                <p className="mt-4 text-sm leading-6 text-emerald-800">
                  {
                    funding.verification_note
                  }
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* ====================================================
          REJECTED
      ==================================================== */}

      {funding.status ===
        "rejected" ? (
        <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-900">
            Payment report rejected
          </p>

          <p className="mt-2 text-sm leading-6 text-red-800">
            {funding.rejection_reason ??
              "The reported payment could not be verified."}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function FundingNextStep({
  jointStatus,
}: {
  jointStatus: string;
}) {
  if (
    jointStatus ===
      "approved" ||
    jointStatus ===
      "funding"
  ) {
    return (
      <div className="mt-7 rounded-2xl border border-gold-200 bg-ivory-50 p-5">
        <p className="text-sm font-semibold text-forest-950">
          Funding method required
        </p>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          Choose your funding
          method and request
          payment instructions to
          complete your obligation.
        </p>
      </div>
    );
  }

  return null;
}

/* ============================================================
 * BADGES
 * ============================================================ */

function JointStatusBadge({
  status,
}: {
  status: string;
}) {
  const funded =
    status ===
    "funded";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] ${
        funded
          ? "bg-emerald-400/15 text-emerald-300"
          : "bg-gold-400/15 text-gold-300"
      }`}
    >
      {funded ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <Clock3 className="size-3.5" />
      )}

      {humanizeJointStatus(
        status,
      )}
    </span>
  );
}

function FundingStatusBadge({
  status,
}: {
  status: string;
}) {
  const verified =
    status ===
    "verified";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest ${
        verified
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {verified ? (
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

/* ============================================================
 * BASIC UI
 * ============================================================ */

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

/* ============================================================
 * FORMATTERS
 * ============================================================ */

function fullName(
  firstName:
    | string
    | null,
  lastName:
    | string
    | null,
) {
  const name = [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    name ||
    "Joint investor"
  );
}

function paymentMethodLabel(
  method: string,
) {
  switch (method) {
    case "wire_transfer":
      return "Wire Transfer";

    case "bitcoin":
      return "Bitcoin";

    case "cash_account":
      return "Tevuah Cash Account";

    default:
      return humanize(
        method,
      );
  }
}

function humanizeJointStatus(
  status: string,
) {
  switch (status) {
    case "awaiting_member_acceptance":
      return "Awaiting Acceptance";

    case "under_review":
      return "Under Review";

    case "funding":
      return "Funding";

    case "funded":
      return "Funded";

    case "rejected":
      return "Not Approved";

    default:
      return humanize(
        status,
      );
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
      (
        letter,
      ) =>
        letter.toUpperCase(),
    );
}

function formatBasisPoints(
  basisPoints: number,
) {
  return `${(
    Number(
      basisPoints,
    ) /
    100
  ).toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 2,
    },
  )}%`;
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
      maximumFractionDigits: 0,
    },
  ).format(
    Number(
      cents,
    ) /
      100,
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
    new Date(
      value,
    ),
  );
}