import { notFound, redirect } from "next/navigation";

import AdminJointWithdrawalReviewClient from "@/src/components/admin/subscriptions/admin-joint-withdrawal-review";
import { createClient } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{
    jointSubscriptionId: string;
    withdrawalId: string;
  }>;
};

export default async function AdminJointWithdrawalReviewPage({
  params,
}: PageProps) {
  const {
    jointSubscriptionId,
    withdrawalId,
  } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase.rpc(
    "get_admin_joint_withdrawal_review",
    {
      p_withdrawal_id: withdrawalId,
    },
  );

  if (error) {
    const normalized =
      error.message?.toLowerCase() || "";

    if (
      normalized.includes("not found") ||
      normalized.includes("admin access")
    ) {
      notFound();
    }

    throw new Error(
      error.message ||
        "Unable to load joint withdrawal.",
    );
  }

  /*
   * get_admin_joint_withdrawal_review currently returns JSONB,
   * but normalize defensively in case Supabase exposes a
   * one-row result shape.
   */
  const review =
    Array.isArray(data)
      ? data[0] ?? null
      : data ?? null;

  if (!review) {
    notFound();
  }

  const reviewJointSubscriptionId =
    review?.withdrawal?.joint_subscription_id ??
    review?.joint_subscription_id ??
    null;

  if (
    reviewJointSubscriptionId !==
    jointSubscriptionId
  ) {
    notFound();
  }

  return (
    <AdminJointWithdrawalReviewClient
      initialReview={review}
    />
  );
}
