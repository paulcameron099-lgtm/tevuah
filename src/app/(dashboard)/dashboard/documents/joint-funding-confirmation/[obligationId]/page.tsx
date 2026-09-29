import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Landmark,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    obligationId: string;
  }>;
};

export default async function JointFundingConfirmationDetailPage({
  params,
}: PageProps) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "investor") redirect("/dashboard");

  const access = await checkAccountAccess(user.id);

  if (!access.allowed) {
    redirect("/account-restricted");
  }

  const { obligationId } = await params;

  const admin = createAdminClient();

  /*
   * Load only this authenticated investor's funded obligation.
   */
  const {
    data: obligation,
    error: obligationError,
  } = await admin
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

      funded_at,
      effective_funded_at,
      historical_funded_at,

      member:joint_investment_members!joint_investment_funding_obligations_member_id_fkey (
        id,
        joint_subscription_id,
        investor_id,
        member_slot,
        ownership_bps,
        funding_obligation_bps,
        obligation_amount,
        member_status
      ),

      joint_subscription:joint_investment_subscriptions!joint_investment_funding_obligations_joint_subscription_id_fkey (
        id,
        opportunity_id,
        total_commitment_amount,
        currency,
        status
      ),

      opportunity:investment_opportunities!joint_investment_funding_obligations_opportunity_id_fkey (
        id,
        title,
        asset_category,
        location
      )
      `,
    )
    .eq(
      "id",
      obligationId,
    )
    .eq(
      "investor_id",
      user.id,
    )
    .eq(
      "status",
      "funded",
    )
    .maybeSingle();

  if (
    obligationError ||
    !obligation
  ) {
    console.error(
      "Joint funding confirmation detail load error:",
      obligationError,
    );

    notFound();
  }

  /*
   * A funding confirmation represents a fully satisfied
   * obligation only.
   */
  if (
    obligation.funded_amount !==
      obligation.obligation_amount ||
    !obligation.funded_at
  ) {
    notFound();
  }

  const member =
    normalizeRelation(
      obligation.member,
    );

  const jointSubscription =
    normalizeRelation(
      obligation.joint_subscription,
    );

  const opportunity =
    normalizeRelation(
      obligation.opportunity,
    );

  /*
   * Defensive provenance validation.
   */
  if (
    !member ||
    !jointSubscription ||
    !opportunity ||
    member.id !==
      obligation.member_id ||
    member.investor_id !==
      obligation.investor_id ||
    member.joint_subscription_id !==
      obligation.joint_subscription_id ||
    member.obligation_amount !==
      obligation.obligation_amount ||
    jointSubscription.id !==
      obligation.joint_subscription_id ||
    jointSubscription.opportunity_id !==
      obligation.opportunity_id ||
    opportunity.id !==
      obligation.opportunity_id
  ) {
    console.error(
      "Joint funding confirmation relationship mismatch:",
      {
        obligationId:
          obligation.id,
      },
    );

    notFound();
  }

  /*
   * Determine whether this obligation was funded externally.
   */
  const {
    data: externalFunding,
    error: externalFundingError,
  } = await admin
    .from(
      "joint_investment_external_funding",
    )
    .select(
      `
      id,
      funding_obligation_id,
      member_id,
      investor_id,
      joint_subscription_id,

      payment_method,
      principal_amount_cents,
      currency,

      wire_charge_amount_cents,
      total_amount_due_cents,

      reported_wire_reference,
      reported_bitcoin_tx_hash,

      status,
      reported_at,
      verified_at
      `,
    )
    .eq(
      "funding_obligation_id",
      obligation.id,
    )
    .eq(
      "investor_id",
      user.id,
    )
    .eq(
      "member_id",
      obligation.member_id,
    )
    .eq(
      "joint_subscription_id",
      obligation.joint_subscription_id,
    )
    .eq(
      "status",
      "verified",
    )
    .order(
      "verified_at",
      {
        ascending: false,
      },
    )
    .limit(1)
    .maybeSingle();

  if (externalFundingError) {
    console.error(
      "Joint funding confirmation external funding load error:",
      externalFundingError,
    );
  }

  /*
   * If there is no verified external funding row, check for
   * the canonical Cash Account investment debit.
   */
  let cashFunding:
    | {
        id: string;
        amount_cents: number;
        currency: string;
        reference: string | null;
        created_at: string;
      }
    | null = null;

  if (!externalFunding) {
    const {
      data,
      error,
    } = await admin
      .from(
        "investor_cash_ledger",
      )
      .select(
        `
        id,
        amount_cents,
        currency,
        reference,
        created_at
        `,
      )
      .eq(
        "joint_funding_obligation_id",
        obligation.id,
      )
      .eq(
        "investor_id",
        user.id,
      )
      .eq(
        "entry_type",
        "investment",
      )
      .eq(
        "direction",
        "debit",
      )
      .eq(
        "status",
        "posted",
      )
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Joint funding confirmation Cash Account lookup error:",
        error,
      );
    }

    cashFunding = data;
  }

  const fundingMethod =
    externalFunding
      ? externalFunding.payment_method ===
        "wire_transfer"
        ? "Wire Transfer"
        : externalFunding.payment_method ===
            "bitcoin"
          ? "Bitcoin"
          : humanize(
              externalFunding.payment_method,
            )
      : cashFunding
        ? "Tevuah Cash Account"
        : "Not available";

  const fundingReference =
    externalFunding
      ? externalFunding.payment_method ===
        "wire_transfer"
        ? externalFunding.reported_wire_reference ??
          externalFunding.id
        : externalFunding.payment_method ===
            "bitcoin"
          ? externalFunding.reported_bitcoin_tx_hash ??
            externalFunding.id
          : externalFunding.id
      : cashFunding?.reference ??
        cashFunding?.id ??
        "Not available";

  const effectiveFundingDate =
    obligation.effective_funded_at ??
    obligation.funded_at;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard/documents"
          className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
        >
          <ArrowLeft className="size-3.5" />
          Back to documents
        </Link>

        <Link
          href={`/api/documents/joint-funding-confirmation/${obligation.id}/pdf`}
          className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
        >
          Download PDF
          <Download className="size-3.5" />
        </Link>
      </div>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-stone-600">
            <Landmark className="size-3" />
            Joint funding confirmation
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-emerald-700">
            <CheckCircle2 className="size-3" />
            Funded
          </span>
        </div>

        <h1 className="font-display mt-5 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Joint Funding Confirmation
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Confirmation that your funding obligation for{" "}
          {opportunity.title} has been fully satisfied.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DataCard
            label="Opportunity"
            value={opportunity.title}
          />

          <DataCard
            label="Joint member"
            value={`Member ${member.member_slot}`}
          />

          <DataCard
            label="Funded principal"
            value={formatMoney(
              obligation.funded_amount,
              obligation.currency,
            )}
          />

          <DataCard
            label="Funding obligation"
            value={formatMoney(
              obligation.obligation_amount,
              obligation.currency,
            )}
          />

          <DataCard
            label="Total joint commitment"
            value={formatMoney(
              jointSubscription.total_commitment_amount,
              jointSubscription.currency ??
                obligation.currency,
            )}
          />

          <DataCard
            label="Funding method"
            value={fundingMethod}
          />

          <DataCard
            label="Funding reference"
            value={fundingReference}
          />

          <DataCard
            label="Funding date"
            value={formatDate(
              effectiveFundingDate,
            )}
          />

          <DataCard
            label="Ownership share"
            value={formatBasisPoints(
              member.ownership_bps,
            )}
          />

          <DataCard
            label="Funding share"
            value={formatBasisPoints(
              member.funding_obligation_bps,
            )}
          />

          <DataCard
            label="Asset category"
            value={humanize(
              opportunity.asset_category,
            )}
          />

          <DataCard
            label="Location"
            value={
              opportunity.location ??
              "Not specified"
            }
          />

          <DataCard
            label="Obligation status"
            value={humanize(
              obligation.status,
            )}
          />

          <DataCard
            label="Joint investment status"
            value={humanize(
              jointSubscription.status,
            )}
          />

          <DataCard
            label="Reference"
            value={obligation.id}
          />
        </div>

        {externalFunding?.payment_method ===
        "wire_transfer" ? (
          <div className="mt-8 rounded-2xl border border-forest-900/10 bg-ivory-50 p-5 sm:p-6">
            <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
              Wire payment details
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InlineValue
                label="Wire charge"
                value={formatMoney(
                  externalFunding.wire_charge_amount_cents,
                  externalFunding.currency,
                )}
              />

              <InlineValue
                label="Total amount paid"
                value={formatMoney(
                  externalFunding.total_amount_due_cents,
                  externalFunding.currency,
                )}
              />
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-8">
        <Users className="size-6 text-gold-400" />

        <h2 className="font-display mt-5 text-3xl font-semibold">
          Your funding record
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          This confirmation applies only to your individual
          funding obligation within the joint investment. The
          other joint member receives a separate funding
          confirmation associated with their own account.
        </p>
      </section>
    </div>
  );
}

function DataCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-ivory-50 p-5">
      <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
        {label}
      </p>

      <p className="mt-2 wrap-break-word text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function InlineValue({
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

      <p className="mt-1 text-sm font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function normalizeRelation<T>(
  value:
    | T
    | T[]
    | null
    | undefined,
) {
  return Array.isArray(value)
    ? value[0] ?? null
    : value ?? null;
}

function formatMoney(
  cents:
    | number
    | null
    | undefined,
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
    },
  ).format(
    Number(cents ?? 0) /
      100,
  );
}

function formatBasisPoints(
  basisPoints:
    | number
    | null
    | undefined,
) {
  return `${(
    Number(
      basisPoints ?? 0,
    ) / 100
  ).toFixed(2)}%`;
}

function formatDate(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(
    new Date(value),
  );
}

function humanize(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "Not specified";
  }

  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}