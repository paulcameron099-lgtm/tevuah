import "server-only";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export async function getUnreadAdminNotificationCount(
  adminId: string,
) {
  const admin =
    createAdminClient();

  /*
   * Count all company notifications.
   */
  const {
    count: totalCount,
    error: totalError,
  } = await admin
    .from(
      "admin_notifications",
    )
    .select(
      "id",
      {
        count: "exact",
        head: true,
      },
    );

  if (totalError) {
    console.error(
      "Admin notification total count error:",
      totalError,
    );

    return 0;
  }

  /*
   * Count notifications THIS administrator has read.
   */
  const {
    count: readCount,
    error: readError,
  } = await admin
    .from(
      "admin_notification_reads",
    )
    .select(
      "notification_id",
      {
        count: "exact",
        head: true,
      },
    )
    .eq(
      "admin_id",
      adminId,
    );

  if (readError) {
    console.error(
      "Admin notification read count error:",
      readError,
    );

    return 0;
  }

  return Math.max(
    0,
    (totalCount ?? 0) -
      (readCount ?? 0),
  );
}