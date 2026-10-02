import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export async function getUnreadNotificationCount(
  investorId: string,
) {
  const admin =
    createAdminClient();

  /*
   * Investor-facing unread count.
   *
   * Dismissed notifications must never contribute
   * to the bell/sidebar badge.
   */

  const {
    count,
    error,
  } = await admin
    .from(
      "investor_notifications",
    )
    .select(
      "id",
      {
        count:
          "exact",

        head:
          true,
      },
    )
    .eq(
      "investor_id",
      investorId,
    )
    .eq(
      "is_read",
      false,
    )
    .is(
      "dismissed_at",
      null,
    );

  if (error) {
    console.error(
      "Unread notification count error:",
      error,
    );

    return 0;
  }

  return (
    count ??
    0
  );
}