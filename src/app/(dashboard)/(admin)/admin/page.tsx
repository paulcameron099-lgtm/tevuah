import {
  Activity,
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  Clock3,
  LucideIcon,
  FileText,
  HandCoins,
  Landmark,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export default async function AdminDashboardPage() {
  /*
   * ==================================================
   * 1. AUTH
   * ==================================================
   */
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !== "admin" &&
    user.role !== "super_admin"
  ) {
    redirect("/dashboard");
  }

  const admin =
    createAdminClient();

  /*
   * ==================================================
   * 2. LOAD COUNTS + OPERATIONAL TOTALS
   * ==================================================
   */
  const [
    investorsResult,
    opportunitiesResult,
    subscriptionsResult,
    paymentsResult,
    positionsResult,
    valuationsResult,
    distributionsResult,
    investorDistributionsResult,
    statementsResult,
  ] =
    await Promise.all([
      admin
        .from("profiles")
        .select(
          `
          id,
          role,
          account_status,
          created_at
          `,
        )
        .eq(
          "role",
          "investor",
        ),

      admin
        .from(
          "investment_opportunities",
        )
        .select(
          `
          id,
          status,
          funding_target,
          total_funded,
          created_at
          `,
        ),

      admin
        .from(
          "investment_subscriptions",
        )
        .select(
          `
          id,
          status,
          commitment_amount,
          created_at
          `,
        ),

      admin
        .from(
          "investment_payments",
        )
        .select(
          `
          id,
          status,
          expected_amount,
          verified_amount,
          created_at
          `,
        ),

      admin
        .from(
          "investment_positions",
        )
        .select(
          `
          id,
          status,
          principal_amount,
          created_at
          `,
        ),

      admin
        .from(
          "investment_valuations",
        )
        .select(
          `
          id,
          status,
          valuation_date,
          created_at
          `,
        ),

      admin
        .from(
          "investment_distributions",
        )
        .select(
          `
          id,
          status,
          created_at
          `,
        ),

      admin
        .from(
          "investor_distributions",
        )
        .select(
          `
          id,
          status,
          net_amount,
          paid_at,
          created_at
          `,
        ),

      admin
        .from(
          "investor_statements",
        )
        .select(
          `
          id,
          status,
          reconstructed_from_legacy,
          period_end,
          created_at
          `,
        ),
    ]);

  /*
   * ==================================================
   * 3. ERROR HANDLING
   * ==================================================
   */
  const dashboardErrors = [
    {
      source: "profiles",
      error: investorsResult.error,
    },
    {
      source: "investment_opportunities",
      error: opportunitiesResult.error,
    },
    {
      source: "investment_subscriptions",
      error: subscriptionsResult.error,
    },
    {
      source: "investment_payments",
      error: paymentsResult.error,
    },
    {
      source: "investment_positions",
      error: positionsResult.error,
    },
    {
      source: "investment_valuations",
      error: valuationsResult.error,
    },
    {
      source: "investment_distributions",
      error: distributionsResult.error,
    },
    {
      source: "investor_distributions",
      error: investorDistributionsResult.error,
    },
    {
      source: "investor_statements",
      error: statementsResult.error,
    },
  ].filter(
    (
      item,
    ) => Boolean(
      item.error,
    ),
  );

  for (
    const item of
      dashboardErrors
  ) {
    console.error(
      `Admin dashboard ${item.source} load error:`,
      item.error,
    );
  }

  const investors =
    investorsResult.data ??
    [];

  const opportunities =
    opportunitiesResult.data ??
    [];

  const subscriptions =
    subscriptionsResult.data ??
    [];

  const payments =
    paymentsResult.data ??
    [];

  const positions =
    positionsResult.data ??
    [];

  const valuations =
    valuationsResult.data ??
    [];

  const distributions =
    distributionsResult.data ??
    [];

  const investorDistributions =
    investorDistributionsResult.data ??
    [];

  const statements =
    statementsResult.data ??
    [];

  /*
   * ==================================================
   * 4. INVESTOR METRICS
   * ==================================================
   */
  const activeInvestors =
    investors.filter(
      (
        investor,
      ) =>
        investor.account_status ===
        "active",
    );

  const suspendedInvestors =
    investors.filter(
      (
        investor,
      ) =>
        [
          "suspended",
          "disabled",
        ].includes(
          investor.account_status,
        ),
    );

  /*
   * ==================================================
   * 5. OPPORTUNITY METRICS
   * ==================================================
   */
  const publishedOpportunities =
    opportunities.filter(
      (
        opportunity,
      ) =>
        opportunity.status ===
        "published",
    );

  const draftOpportunities =
    opportunities.filter(
      (
        opportunity,
      ) =>
        opportunity.status ===
        "draft",
    );

  const closedOpportunities =
    opportunities.filter(
      (
        opportunity,
      ) =>
        opportunity.status ===
        "closed",
    );

  /*
   * ==================================================
   * 6. SUBSCRIPTION + PAYMENT QUEUES
   * ==================================================
   */
  const subscriptionsAwaitingReview =
    subscriptions.filter(
      (
        subscription,
      ) =>
        [
          "submitted",
          "under_review",
          "action_required",
        ].includes(
          subscription.status,
        ),
    );

  const approvedSubscriptions =
    subscriptions.filter(
      (
        subscription,
      ) =>
        subscription.status ===
        "approved",
    );

  const paymentsAwaitingReview =
    payments.filter(
      (
        payment,
      ) =>
        [
          "payment_reported",
          "pending_verification",
          "submitted",
        ].includes(
          payment.status,
        ),
    );

  const rejectedPayments =
    payments.filter(
      (
        payment,
      ) =>
        payment.status ===
        "rejected",
    );

  /*
   * ==================================================
   * 7. POSITION / CAPITAL METRICS
   * ==================================================
   */
  const activePositions =
    positions.filter(
      (
        position,
      ) =>
        position.status ===
        "active",
    );

  const totalFundedCapital =
    positions
      .filter(
        (
          position,
        ) =>
          position.status !==
          "cancelled",
      )
      .reduce(
        (
          total,
          position,
        ) =>
          total +
          Number(
            position.principal_amount,
          ),
        0,
      );

  const verifiedPaymentsTotal =
    payments
      .filter(
        (
          payment,
        ) =>
          payment.status ===
          "verified",
      )
      .reduce(
        (
          total,
          payment,
        ) =>
          total +
          Number(
            payment.verified_amount ??
              0,
          ),
        0,
      );

  /*
   * ==================================================
   * 8. VALUATIONS / DISTRIBUTIONS / STATEMENTS
   * ==================================================
   */
  const draftValuations =
    valuations.filter(
      (
        valuation,
      ) =>
        valuation.status ===
        "draft",
    );

  const publishedValuations =
    valuations.filter(
      (
        valuation,
      ) =>
        valuation.status ===
        "published",
    );

  const distributionsInProgress =
    distributions.filter(
      (
        distribution,
      ) =>
        [
          "approved",
          "processing",
        ].includes(
          distribution.status,
        ),
    );

  const paidDistributions =
    distributions.filter(
      (
        distribution,
      ) =>
        distribution.status ===
        "paid",
    );

  /*
   * Cash actually paid to investors.
   *
   * Use investor_distributions.net_amount because this
   * is the proven allocation-level cash field used by
   * the investor portfolio and distribution pages.
   */
  const paidDistributionTotal =
    investorDistributions
      .filter(
        (
          allocation,
        ) =>
          allocation.status ===
          "paid",
      )
      .reduce(
        (
          total,
          allocation,
        ) =>
          total +
          Number(
            allocation.net_amount ??
              0,
          ),
        0,
      );

  const draftStatements =
    statements.filter(
      (
        statement,
      ) =>
        statement.status ===
        "draft",
    );

  const publishedStatements =
    statements.filter(
      (
        statement,
      ) =>
        statement.status ===
        "published",
    );

  const voidStatements =
    statements.filter(
      (
        statement,
      ) =>
        statement.status ===
        "void",
    );

  /*
   * ==================================================
   * 9. OPERATIONS QUEUE
   * ==================================================
   */
  const queueItems = [
    {
      label:
        "Subscriptions awaiting review",

      value:
        subscriptionsAwaitingReview.length,

      href:
        "/admin/subscriptions",

      icon:
        FileText,
    },

    {
      label:
        "Payments awaiting verification",

      value:
        paymentsAwaitingReview.length,

      href:
        "/admin/payments",

      icon:
        CircleDollarSign,
    },

    {
      label:
        "Draft valuations",

      value:
        draftValuations.length,

      href:
        "/admin/valuations",

      icon:
        BarChart3,
    },

    {
      label:
        "Distributions in progress",

      value:
        distributionsInProgress.length,

      href:
        "/admin/distributions",

      icon:
        HandCoins,
    },

    {
      label:
        "Draft statements",

      value:
        draftStatements.length,

      href:
        "/admin/statements",

      icon:
        FileText,
    },

    {
      label:
        "Restricted investor accounts",

      value:
        suspendedInvestors.length,

      href:
        "/admin/users",

      icon:
        ShieldCheck,
    },
  ];

  /*
   * ==================================================
   * 10. RENDER
   * ==================================================
   */
  return (
    <div className="space-y-8">
      {/* ============================================
          HERO
      ============================================ */}

      <section className="rounded-[1.75rem] bg-forest-950 p-7 text-white sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
          Tevuah Reserve operations
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Admin Dashboard
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          Monitor investor operations, subscriptions, funding,
          positions, valuations, distributions and reporting
          from one administrative control center.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/admin/opportunities"
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-gold-400 px-5 text-sm font-semibold text-forest-950 transition hover:bg-gold-300"
          >
            Manage opportunities

            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/admin/subscriptions"
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Review subscriptions

            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/admin/payments"
            className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Verify payments

            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ============================================
          TOP METRICS
      ============================================ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Investors"
          value={String(
            investors.length,
          )}
          description={`${activeInvestors.length} active · ${suspendedInvestors.length} restricted`}
          href="/admin/users"
        />

        <MetricCard
          icon={Landmark}
          label="Funded capital"
          value={formatMoney(
            totalFundedCapital,
          )}
          description={`${activePositions.length} active funded positions`}
          href="/admin/positions"
        />

        <MetricCard
          icon={CircleDollarSign}
          label="Verified payments"
          value={formatMoney(
            verifiedPaymentsTotal,
          )}
          description={`${paymentsAwaitingReview.length} awaiting verification`}
          href="/admin/payments"
        />

        <MetricCard
          icon={HandCoins}
          label="Paid distributions"
          value={formatMoney(
            paidDistributionTotal,
          )}
          description={`${paidDistributions.length} completed distributions`}
          href="/admin/distributions"
        />
      </div>

      {/* ============================================
          OPERATIONS QUEUE
      ============================================ */}

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="flex flex-col gap-4 border-b border-forest-900/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Action center
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Operations Queue
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Items that may require administrative review or action.
            </p>
          </div>

          <Clock3 className="size-5 text-gold-600" />
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3 sm:p-8">
          {queueItems.map(
            (
              item,
            ) => (
              <Link
                key={
                  item.label
                }
                href={
                  item.href
                }
                className="group cursor-pointer rounded-[1.25rem] border border-forest-900/10 bg-ivory-50 p-5 transition hover:border-forest-900/20 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-white">
                    <item.icon className="size-4 text-gold-600" />
                  </div>

                  <span className="font-display text-3xl font-semibold text-forest-950">
                    {
                      item.value
                    }
                  </span>
                </div>

                <p className="mt-5 text-sm font-semibold text-forest-950">
                  {
                    item.label
                  }
                </p>

                <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-stone-500 transition group-hover:text-forest-950">
                  Open queue

                  <ArrowRight className="size-3.5" />
                </div>
              </Link>
            ),
          )}
        </div>
      </section>

      {/* ============================================
          MANAGEMENT AREAS
      ============================================ */}

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSection
          title="Investment Operations"
          subtitle="Opportunity creation, subscriptions, funding and funded positions."
          items={[
            {
              label:
                "Opportunities",

              value:
                String(
                  opportunities.length,
                ),

              detail:
                `${publishedOpportunities.length} published · ${draftOpportunities.length} draft · ${closedOpportunities.length} closed`,

              href:
                "/admin/opportunities",

              icon:
                Landmark,
            },

            {
              label:
                "Subscriptions",

              value:
                String(
                  subscriptions.length,
                ),

              detail:
                `${subscriptionsAwaitingReview.length} awaiting review · ${approvedSubscriptions.length} approved`,

              href:
                "/admin/subscriptions",

              icon:
                FileText,
            },

            {
              label:
                "Payments",

              value:
                String(
                  payments.length,
                ),

              detail:
                `${paymentsAwaitingReview.length} awaiting review · ${rejectedPayments.length} rejected`,

              href:
                "/admin/payments",

              icon:
                CircleDollarSign,
            },

            {
              label:
                "Positions",

              value:
                String(
                  positions.length,
                ),

              detail:
                `${activePositions.length} active positions`,

              href:
                "/admin/positions",

              icon:
                WalletCards,
            },
          ]}
        />

        <AdminSection
          title="Reporting & Returns"
          subtitle="Valuations, distributions and investor reporting."
          items={[
            {
              label:
                "Valuations",

              value:
                String(
                  valuations.length,
                ),

              detail:
                `${publishedValuations.length} published · ${draftValuations.length} draft`,

              href:
                "/admin/valuations",

              icon:
                BarChart3,
            },

            {
              label:
                "Distributions",

              value:
                String(
                  distributions.length,
                ),

              detail:
                `${distributionsInProgress.length} in progress · ${paidDistributions.length} paid`,

              href:
                "/admin/distributions",

              icon:
                HandCoins,
            },

            {
              label:
                "Statements",

              value:
                String(
                  statements.length,
                ),

              detail:
                `${publishedStatements.length} published · ${draftStatements.length} draft · ${voidStatements.length} void`,

              href:
                "/admin/statements",

              icon:
                FileText,
            },

            {
              label:
                "Investors",

              value:
                String(
                  investors.length,
                ),

              detail:
                `${activeInvestors.length} active · ${suspendedInvestors.length} restricted`,

              href:
                "/admin/users",

              icon:
                UserRound,
            },
          ]}
        />
      </div>

      {/* ============================================
          SYSTEM SNAPSHOT
      ============================================ */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Activity className="mt-1 size-5 shrink-0 text-gold-600" />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
              Platform snapshot
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Administrative Overview
            </h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <MiniData
                label="Published opportunities"
                value={String(
                  publishedOpportunities.length,
                )}
              />

              <MiniData
                label="Published valuations"
                value={String(
                  publishedValuations.length,
                )}
              />

              <MiniData
                label="Published statements"
                value={String(
                  publishedStatements.length,
                )}
              />

              <MiniData
                label="Restricted investors"
                value={String(
                  suspendedInvestors.length,
                )}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/*
 * ==================================================
 * METRIC CARD
 * ==================================================
 */

function MetricCard({
  icon:
    Icon,

  label,

  value,

  description,

  href,
}: {
  icon:
    LucideIcon;

  label:
    string;

  value:
    string;

  description:
    string;

  href:
    string;
}) {
  return (
    <Link
      href={
        href
      }
      className="group cursor-pointer rounded-3xl border border-forest-900/10 bg-white p-5 transition hover:border-forest-900/20 hover:shadow-sm"
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-ivory-50">
        <Icon className="size-4.5 text-gold-600" />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {
          label
        }
      </p>

      <p className="font-display mt-2 wrap-break-word text-3xl font-semibold text-forest-950">
        {
          value
        }
      </p>

      <p className="mt-2 text-xs leading-5 text-stone-500">
        {
          description
        }
      </p>

      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-stone-400 transition group-hover:text-forest-950">
        View details

        <ArrowRight className="size-3.5" />
      </div>
    </Link>
  );
}

/*
 * ==================================================
 * ADMIN SECTION
 * ==================================================
 */

function AdminSection({
  title,

  subtitle,

  items,
}: {
  title:
    string;

  subtitle:
    string;

  items:
    Array<{
      label:
        string;

      value:
        string;

      detail:
        string;

      href:
        string;

      icon:
        LucideIcon;
    }>;
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
      <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Admin controls
        </p>

        <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
          {
            title
          }
        </h2>

        <p className="mt-2 text-sm leading-6 text-stone-500">
          {
            subtitle
          }
        </p>
      </div>

      <div className="divide-y divide-forest-900/10">
        {items.map(
          (
            item,
          ) => (
            <Link
              key={
                item.label
              }
              href={
                item.href
              }
              className="group flex cursor-pointer items-center justify-between gap-5 px-6 py-5 transition hover:bg-ivory-50 sm:px-8"
            >
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ivory-50 transition group-hover:bg-white">
                  <item.icon className="size-4 text-gold-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-forest-950">
                    {
                      item.label
                    }
                  </p>

                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    {
                      item.detail
                    }
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="font-display text-2xl font-semibold text-forest-950">
                  {
                    item.value
                  }
                </span>

                <ArrowRight className="size-4 text-stone-300 transition group-hover:text-forest-950" />
              </div>
            </Link>
          ),
        )}
      </div>
    </section>
  );
}

/*
 * ==================================================
 * MINI DATA
 * ==================================================
 */

function MiniData({
  label,

  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div>
      <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-stone-400">
        {
          label
        }
      </p>

      <p className="mt-1 text-sm font-semibold text-forest-950">
        {
          value
        }
      </p>
    </div>
  );
}

/*
 * ==================================================
 * FORMATTERS
 * ==================================================
 */

function formatMoney(
  cents:
    number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        "USD",

      maximumFractionDigits:
        2,
    },
  ).format(
    cents /
      100,
  );
}
