import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export async function getUnreadNotificationCount(
  investorId: string,
) {
  const admin =
    createAdminClient();

  const { count, error } = await admin
    .from("investor_notifications")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      },
    )
    .eq(
      "investor_id",
      investorId,
    )
    .eq(
      "is_read",
      false,
    );

  if (error) {
    console.error(
      "Unread notification count error:",
      error,
    );

    return 0;
  }

  return count ?? 0;
}
