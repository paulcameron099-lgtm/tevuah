import { ArrowLeft, CheckCircle2, Download, Landmark } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    paymentId: string;
  }>;
};

export default async function FundingConfirmationDetailPage({
  params,
}: PageProps) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "investor") redirect("/dashboard");

  const access = await checkAccountAccess(user.id);
  if (!access.allowed) redirect("/account-restricted");

  const { paymentId } = await params;
  const admin = createAdminClient();

  const { data: payment, error: paymentError } = await admin
    .from("investment_payments")
    .select(
      `
      id,
      investor_id,
      opportunity_id,
      subscription_id,
      expected_amount,
      reported_amount,
      verified_amount,
      status,
      investor_reported_at,
      verified_at,
      created_at,
      opportunity:investment_opportunities!investment_payments_opportunity_id_fkey (
        id,
        title,
        asset_category,
        location
      )
      `,
    )
    .eq("id", paymentId)
    .eq("investor_id", user.id)
    .eq("status", "verified")
    .maybeSingle();

  if (paymentError || !payment) {
    console.error("Funding confirmation detail load error:", paymentError);
    notFound();
  }

  const { data: position, error: positionError } = await admin
    .from("investment_positions")
    .select(
      `
      id,
      principal_amount,
      currency,
      status,
      funded_at
      `,
    )
    .eq("payment_id", payment.id)
    .eq("investor_id", user.id)
    .maybeSingle();

  if (positionError) {
    console.error("Funding confirmation position load error:", positionError);
  }

  const opportunity = normalizeRelation(payment.opportunity);
  const currency = position?.currency ?? "USD";

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
          href={`/api/documents/funding-confirmation/${payment.id}/pdf`}
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
            Funding confirmation
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-emerald-700">
            <CheckCircle2 className="size-3" />
            Verified
          </span>
        </div>

        <h1 className="font-display mt-5 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Funding Confirmation
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Confirmed receipt and verification of capital for{" "}
          {opportunity?.title ?? "your investment"}.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DataCard label="Opportunity" value={opportunity?.title ?? "Not available"} />
          <DataCard label="Verified amount" value={formatMoney(payment.verified_amount, currency)} />
          <DataCard label="Expected amount" value={formatMoney(payment.expected_amount, currency)} />
          <DataCard label="Reported amount" value={formatMoney(payment.reported_amount, currency)} />
          <DataCard label="Verified date" value={formatDate(payment.verified_at)} />
          <DataCard label="Position" value={position?.id ?? "Not available"} />
          <DataCard label="Position status" value={humanize(position?.status)} />
          <DataCard label="Funded date" value={formatDate(position?.funded_at ?? payment.verified_at)} />
          <DataCard label="Reference" value={payment.id} />
        </div>

        {position?.id ? (
          <div className="mt-8">
            <Link
              href={`/dashboard/portfolio/${position.id}`}
              className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
            >
              View funded position
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function DataCard({ label, value }: { label: string; value: string }) {
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

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function formatMoney(
  cents: number | null | undefined,
  currency: string,
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(cents ?? 0) / 100);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function humanize(value: string | null | undefined) {
  if (!value) return "Not specified";
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}