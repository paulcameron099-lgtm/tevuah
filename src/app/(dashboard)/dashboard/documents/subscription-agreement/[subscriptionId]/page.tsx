import { ArrowLeft, Download, FileCheck2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    subscriptionId: string;
  }>;
};

export default async function SubscriptionAgreementDetailPage({
  params,
}: PageProps) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "investor") redirect("/dashboard");

  const access = await checkAccountAccess(user.id);
  if (!access.allowed) redirect("/account-restricted");

  const { subscriptionId } = await params;
  const admin = createAdminClient();

  const { data: subscription, error } = await admin
    .from("investment_subscriptions")
    .select(
      `
      id,
      investor_id,
      opportunity_id,
      commitment_amount,
      status,
      submitted_at,
      reviewed_at,
      created_at,
      opportunity:investment_opportunities!investment_subscriptions_opportunity_id_fkey (
        id,
        title,
        asset_category,
        location
      )
      `,
    )
    .eq("id", subscriptionId)
    .eq("investor_id", user.id)
    .not("submitted_at", "is", null)
    .maybeSingle();

  if (error || !subscription) {
    console.error("Subscription agreement detail load error:", error);
    notFound();
  }

  const opportunity = normalizeRelation(subscription.opportunity);

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
          href={`/api/documents/subscription-agreement/${subscription.id}/pdf`}
          className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
        >
          Download PDF
          <Download className="size-3.5" />
        </Link>
      </div>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-stone-600">
            <FileCheck2 className="size-3" />
            Subscription agreement
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-emerald-700">
            <ShieldCheck className="size-3" />
            Investor record
          </span>
        </div>

        <h1 className="font-display mt-5 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Signed Subscription Agreement
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Investment subscription record submitted for{" "}
          {opportunity?.title ?? "this investment opportunity"}.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DataCard label="Opportunity" value={opportunity?.title ?? "Not available"} />
          <DataCard label="Commitment" value={formatMoney(subscription.commitment_amount)} />
          <DataCard label="Status" value={humanize(subscription.status)} />
          <DataCard label="Asset category" value={humanize(opportunity?.asset_category)} />
          <DataCard label="Location" value={opportunity?.location ?? "Not specified"} />
          <DataCard label="Submitted" value={formatDate(subscription.submitted_at)} />
          <DataCard label="Reviewed" value={formatDate(subscription.reviewed_at)} />
          <DataCard label="Reference" value={subscription.id} />
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white sm:p-8">
        <ShieldCheck className="size-6 text-gold-400" />
        <h2 className="font-display mt-5 text-3xl font-semibold">
          Record status
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          This page represents the investment subscription record stored for your
          account. Funding confirmation is issued separately only after Tevuah
          Reserve verifies the investment payment.
        </p>
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

function formatMoney(cents: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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