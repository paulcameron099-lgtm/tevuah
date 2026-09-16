import "server-only";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type CreateInvestorNotificationInput = {
  investorId: string;

  notificationType:
    | "subscription"
    | "payment"
    | "distribution"
    | "statement"
    | "compliance"
    | string;

  eventKey: string;

  title: string;
  message: string;

  actionLabel?: string | null;
  actionPath?: string | null;

  sourceType?: string | null;
  sourceId?: string | null;
};

/**
 * Creates an investor dashboard notification.
 *
 * eventKey should uniquely identify the lifecycle event so the same
 * business event does not create duplicate notifications.
 *
 * Notification failures are returned to the caller rather than thrown.
 * This lets the business transaction remain successful even if the
 * dashboard notification cannot be created.
 */
export async function createInvestorNotification({
  investorId,
  notificationType,
  eventKey,
  title,
  message,
  actionLabel = null,
  actionPath = null,
  sourceType = null,
  sourceId = null,
}: CreateInvestorNotificationInput) {
  const admin =
    createAdminClient();

  /*
   * Check first so this works even if your current database does not
   * yet have a UNIQUE constraint on event_key.
   */
  const {
    data: existing,
    error: existingError,
  } = await admin
    .from("investor_notifications")
    .select("id")
    .eq(
      "investor_id",
      investorId,
    )
    .eq(
      "event_key",
      eventKey,
    )
    .maybeSingle();

  if (existingError) {
    console.error(
      "Investor notification duplicate check error:",
      existingError,
    );

    return {
      created: false,
      notificationId: null,
      error: existingError,
    };
  }

  if (existing) {
    return {
      created: false,
      notificationId:
        existing.id,
      error: null,
    };
  }

  const now =
    new Date().toISOString();

  const {
    data: notification,
    error,
  } = await admin
    .from("investor_notifications")
    .insert({
      investor_id:
        investorId,

      notification_type:
        notificationType,

      event_key:
        eventKey,

      title,

      message,

      action_label:
        actionLabel,

      action_path:
        actionPath,

      source_type:
        sourceType,

      source_id:
        sourceId,

      is_read:
        false,

      read_at:
        null,

      created_at:
        now,
    })
    .select("id")
    .single();

  if (error) {
    console.error(
      "Investor notification create error:",
      error,
    );

    return {
      created: false,
      notificationId: null,
      error,
    };
  }

  return {
    created: true,
    notificationId:
      notification.id,
    error: null,
  };
}