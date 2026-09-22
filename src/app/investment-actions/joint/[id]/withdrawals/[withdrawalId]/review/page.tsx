import { notFound, redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import JointWithdrawalReview from "@/src/components/investments/joint-withdrawal-review";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function JointWithdrawalReviewPage({
  params,
}: {
  params: Promise<{
    id: string;
    withdrawalId: string;
  }>;
}) {
  const { id, withdrawalId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/auth/login?next=${encodeURIComponent(
        `/investment-actions/joint/${id}/withdrawals/${withdrawalId}/review`,
      )}`,
    );
  }

  /*
   * Do not redirect restricted investors away from this page.
   * The RPC itself is the authorization boundary and only exposes
   * this withdrawal to an authenticated member of this exact joint.
   */
  const { data, error } = await supabase.rpc(
    "get_joint_investment_withdrawal_review",
    {
      p_withdrawal_id: withdrawalId,
    },
  );

  if (error) {
    const normalized = error.message?.toLowerCase() || "";

    if (
      normalized.includes("not found") ||
      normalized.includes("only a joint member")
    ) {
      notFound();
    }

    throw new Error(error.message || "Unable to load withdrawal review.");
  }

  const review = Array.isArray(data) ? data[0] ?? null : data;

  if (!review || review.joint_subscription_id !== id) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-ivory-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
            Tevuah Reserve
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Secure joint-investment withdrawal authorization
          </p>
        </div>
        <JointWithdrawalReview initialReview={review} />
      </div>
    </main>
  );
}
