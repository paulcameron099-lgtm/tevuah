import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminPositionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !== "admin" &&
    user.role !== "super_admin"
  ) {
    redirect("/dashboard");
  }

  const admin = createAdminClient();

  const { data: positions, error } = await admin
    .from("investment_positions")
    .select(`
      id,
      principal_amount,
      currency,
      status,
      funded_at,
    investor:profiles!investment_positions_investor_id_fkey(
    id,
    first_name,
    last_name
    ),
      opportunity:investment_opportunities!investment_positions_opportunity_id_fkey(
        id,
        slug,
        title,
        asset_category
      )
    `)
    .order("funded_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);

    throw new Error(
      "Unable to load investment positions.",
    );
  }

  const records = positions ?? [];

  const recordsWithEmails =
  await Promise.all(
    records.map(
      async (
        position,
      ) => {
        const investor =
          Array.isArray(
            position.investor,
          )
            ? position.investor[0] ??
              null
            : position.investor;

        let investorEmail:
          | string
          | null =
          null;

        if (investor?.id) {
          const {
            data:
              authUserData,
            error:
              authUserError,
          } =
            await admin.auth.admin.getUserById(
              investor.id,
            );

          if (
            authUserError
          ) {
            console.error(
              "Position investor Auth lookup error:",
              authUserError,
            );
          }

          investorEmail =
            authUserData.user
              ?.email ??
            null;
        }

        return {
          ...position,

          investorEmail,
        };
      },
    ),
  );

 const totalCapital =
  recordsWithEmails.reduce(
    (sum, position) =>
      sum + Number(position.principal_amount),
    0,
  );

  const activePositions =
  recordsWithEmails.filter(
    (position) => position.status === "active",
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Administration
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Investment Positions
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Every verified funded investment across the Tevuah
          Reserve platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={CircleDollarSign}
          label="Total funded capital"
          value={formatMoney(totalCapital)}
        />

        <SummaryCard
          icon={BriefcaseBusiness}
          label="Investment positions"
          value={String(records.length)}
        />

        <SummaryCard
          icon={ShieldCheck}
          label="Active positions"
          value={String(activePositions)}
        />
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="flex items-center justify-between border-b border-forest-900/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Portfolio
            </p>

            <h2 className="font-display mt-2 text-2xl font-semibold text-forest-950">
              Funded Positions
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-forest-900/10 bg-ivory-50 px-4 py-2 text-xs font-semibold text-stone-500">
            <Search className="size-3.5" />
            Search & filters coming next
          </div>
        </div>

        {recordsWithEmails.length ===
        0 ? (
          <div className="px-6 py-16 text-center">
            <WalletCards className="mx-auto size-8 text-stone-300" />

            <h3 className="font-display mt-5 text-3xl font-semibold text-forest-950">
              No funded positions yet
            </h3>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-500">
              Positions appear only after payment verification.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {recordsWithEmails.map((position) => {
              const investor = Array.isArray(position.investor)
                ? position.investor[0]
                : position.investor;

              const opportunity = Array.isArray(position.opportunity)
                ? position.opportunity[0]
                : position.opportunity;

              return (
                <article
                  key={position.id}
                  className="p-6 sm:p-8"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={position.status} />

                        {opportunity?.asset_category ? (
                          <span className="rounded-full bg-ivory-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-stone-500">
                            {humanize(opportunity.asset_category)}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
                        {opportunity?.title ?? "Investment position"}
                      </h3>

                      <p className="mt-2 text-sm text-stone-500">
                        {investor?.first_name} {investor?.last_name}
                      </p>

                      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <DataPoint
                          label="Principal"
                          value={formatMoney(Number(position.principal_amount))}
                        />

                        <DataPoint
                          label="Funded"
                          value={
                            position.funded_at
                              ? formatDate(position.funded_at)
                              : "—"
                          }
                        />

                        <DataPoint
                          label="Currency"
                          value={position.currency}
                        />

                        <DataPoint
                          label="Status"
                          value={humanize(position.status)}
                        />
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-3">
                      <Link
                        href={`/admin/positions/${position.id}`}
                        className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
                      >
                        View Position
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof WalletCards;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <div className="flex size-10 items-center justify-center rounded-full bg-ivory-50">
        <Icon className="size-4.5 text-gold-600" />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="font-display mt-2 text-3xl font-semibold text-forest-950">
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
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-emerald-700">
      <CheckCircle2 className="size-3" />
      {humanize(status)}
    </span>
  );
}

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}