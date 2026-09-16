import "server-only";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type CreateAdminNotificationInput = {
  notificationType: string;

  eventKey: string;

  title: string;

  message: string;

  actionLabel?:
    | string
    | null;

  actionPath?:
    | string
    | null;

  sourceType?:
    | string
    | null;

  sourceId?:
    | string
    | null;
};

export async function createAdminNotification({
  notificationType,
  eventKey,
  title,
  message,
  actionLabel = null,
  actionPath = null,
  sourceType = null,
  sourceId = null,
}: CreateAdminNotificationInput) {
  const admin =
    createAdminClient();

  /*
   * ==================================================
   * IDEMPOTENCY CHECK
   * ==================================================
   *
   * event_key uniquely represents a business event.
   *
   * Retrying the same API request must not create
   * duplicate company notifications.
   */
  const {
    data: existing,
    error: existingError,
  } = await admin
    .from(
      "admin_notifications",
    )
    .select("id")
    .eq(
      "event_key",
      eventKey,
    )
    .maybeSingle();

  if (existingError) {
    console.error(
      "Admin notification duplicate check error:",
      existingError,
    );

    return {
      created: false,
      notificationId: null,
      error:
        existingError,
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

  /*
   * ==================================================
   * CREATE COMPANY NOTIFICATION
   * ==================================================
   */
  const {
    data: notification,
    error,
  } = await admin
    .from(
      "admin_notifications",
    )
    .insert({
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
    })
    .select("id")
    .single();

  if (error) {
    /*
     * A concurrent request may have created the same
     * unique event between our check and insert.
     *
     * Re-read the event before treating it as a failure.
     */
    const {
      data: concurrentExisting,
    } = await admin
      .from(
        "admin_notifications",
      )
      .select("id")
      .eq(
        "event_key",
        eventKey,
      )
      .maybeSingle();

    if (concurrentExisting) {
      return {
        created: false,
        notificationId:
          concurrentExisting.id,
        error: null,
      };
    }

    console.error(
      "Admin notification create error:",
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