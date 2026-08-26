import {
  ArrowLeft,
} from "lucide-react";

import Link from "next/link";

import { OpportunityForm } from "@/src/components/admin/opportunities/opportunity-form";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function CreateOpportunityPage() {
  await requireAdmin();

  const admin =
    createAdminClient();

  const {
    data: estates,
    error,
  } = await admin
    .from(
      "investment_estates",
    )
    .select(
      `
      id,
      name
      `,
    )
    .eq(
      "status",
      "active",
    )
    .order(
      "name",
    );

  if (error) {
    console.error(
      "Estate options load error:",
      error,
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/admin/opportunities"
        className="inline-flex items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to opportunities
      </Link>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investment administration
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Create Investment Opportunity
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Build a new private-market opportunity.
          New opportunities begin as drafts and are
          not visible to investors until published.
        </p>
      </div>

      <OpportunityForm
        estates={
          estates ?? []
        }
      />
    </div>
  );
}