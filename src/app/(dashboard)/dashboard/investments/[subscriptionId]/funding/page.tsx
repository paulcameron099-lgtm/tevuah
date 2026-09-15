import {
  ArrowLeft,
  Clock3,
} from "lucide-react";
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  CashAccountInvestmentForm,
} from "@/src/components/investments/cash-account-investment-form";
import {
  InvestmentExternalFundingCard,
} from "@/src/components/investments/investment-external-funding-card";
import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";
import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    subscriptionId: string;
  }>;
};

function formatMoney(
  cents: number,
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",
      currency,
    },
  ).format(
    cents / 100,
  );
}

export default async function InvestmentFundingPage({
  params,
}: PageProps) {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  if (
    user.role !==
    "investor"
  ) {
    redirect(
      "/dashboard",
    );
  }

  const {
    subscriptionId,
  } = await params;

  const admin =
    createAdminClient();

  const {
    data: subscription,
    error:
      subscriptionError,
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
      opportunity:investment_opportunities (
        id,
        slug,
        title,
        asset_category
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
    notFound();
  }

  if (
    subscription.status !==
    "approved"
  ) {
    redirect(
      `/dashboard/investments/${subscription.id}`,
    );
  }

  const [
    paymentResult,
    cashResult,
  ] = await Promise.all([
    admin
      .from(
        "investment_payments",
      )
      .select(
        `
        id,
        investor_id,
        subscription_id,
        expected_amount,
        currency,
        payment_method,
        status,
        reported_amount,
        verified_amount
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
      .maybeSingle(),

    admin
      .from(
        "investor_cash_accounts",
      )
      .select(
        `
        available_balance_cents,
        currency,
        status
        `,
      )
      .eq(
        "investor_id",
        user.id,
      )
      .eq(
        "currency",
        "USD",
      )
      .maybeSingle(),
  ]);

  const payment =
    paymentResult.data;

  if (
    paymentResult.error ||
    !payment
  ) {
    throw new Error(
      "Approved subscription is missing its funding payment record.",
    );
  }

  const {
    data: instruction,
    error:
      instructionError,
  } = await admin
    .from(
      "investment_payment_instructions",
    )
    .select("*")
    .eq(
      "payment_id",
      payment.id,
    )
    .eq(
      "investor_id",
      user.id,
    )
    .eq(
      "status",
      "active",
    )
    .maybeSingle();

  if (
    instructionError
  ) {
    console.error(
      "Investment funding instruction load error:",
      instructionError,
    );
  }

  const opportunity =
    Array.isArray(
      subscription.opportunity,
    )
      ? subscription
          .opportunity[0] ??
        null
      : subscription.opportunity;

  const cashAccount =
    cashResult.data;

  const paymentIsFinal =
    payment.status ===
    "verified";

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/investments"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />
        My Investments
      </Link>

      <section className="rounded-4xl bg-forest-950 p-7 text-white sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
          Investment funding
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold">
          {opportunity?.title ??
            "Investment"}
        </h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/45">
              Approved commitment
            </p>
            <p className="mt-2 text-lg font-semibold">
              {formatMoney(
                Number(
                  subscription.commitment_amount,
                ),
              )}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-white/45">
              Payment stage
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-lg font-semibold">
              <Clock3 className="size-4 text-gold-400" />
              {payment.status ===
              "verified"
                ? "Funded"
                : payment.status ===
                      "payment_reported" ||
                    payment.status ===
                      "pending_verification"
                  ? "Verification pending"
                  : "Awaiting payment"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-white/45">
              Currency
            </p>
            <p className="mt-2 text-lg font-semibold">
              {payment.currency ??
                "USD"}
            </p>
          </div>
        </div>
      </section>

      {!paymentIsFinal &&
      cashAccount &&
      cashAccount.status ===
        "active" ? (
        <CashAccountInvestmentForm
          subscriptionId={
            subscription.id
          }
          commitmentAmountCents={
            Number(
              subscription.commitment_amount,
            )
          }
          availableBalanceCents={
            Number(
              cashAccount.available_balance_cents,
            )
          }
          currency={
            cashAccount.currency ??
            "USD"
          }
        />
      ) : null}

      <InvestmentExternalFundingCard
        paymentId={
          payment.id
        }
        paymentStatus={
          payment.status
        }
        expectedAmountCents={
          Number(
            payment.expected_amount,
          )
        }
        instruction={
          instruction
        }
      />

      <p className="rounded-xl border border-forest-900/10 bg-ivory-50 p-4 text-xs leading-6 text-stone-500">
        Never send Bitcoin to an address received outside your authenticated Tevuah Reserve dashboard.
        Tevuah Reserve will never ask you to provide a wallet private key, seed phrase, recovery phrase or signing key.
      </p>
    </div>
  );
}
