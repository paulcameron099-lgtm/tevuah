"use client";

import {
  CheckCheck,
  CheckCircle2,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

/*
 * ==================================================
 * GLOBAL NOTIFICATION BADGE REFRESH
 * ==================================================
 *
 * The notification bell and sidebar badge already
 * listen for this event.
 *
 * We dispatch it after:
 *
 * - mark read
 * - mark all read
 * - clear one
 * - clear all
 *
 * This keeps all investor notification counters
 * synchronized immediately.
 */

function notifyBadgeChanged() {
  window.dispatchEvent(
    new Event(
      "tevuah:notifications-changed",
    ),
  );
}

/*
 * ==================================================
 * MARK ALL READ
 * ==================================================
 */

export function MarkAllNotificationsReadButton({
  disabled,
}: {
  disabled: boolean;
}) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  async function markAllRead() {
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/notifications/read",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                all: true,
              }),
          },
        );

      if (
        response.ok
      ) {
        notifyBadgeChanged();

        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={
        disabled ||
        loading
      }
      onClick={
        markAllRead
      }
      className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <CheckCheck className="size-3.5" />
      )}

      Mark all read
    </button>
  );
}

/*
 * ==================================================
 * MARK ONE READ
 * ==================================================
 */

export function MarkNotificationReadButton({
  notificationId,
}: {
  notificationId: string;
}) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  async function markRead() {
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/notifications/read",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                notificationId,
              }),
          },
        );

      if (
        response.ok
      ) {
        notifyBadgeChanged();

        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={
        loading
      }
      onClick={
        markRead
      }
      className="focus-ring inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-3 text-[0.68rem] font-semibold text-forest-950 transition hover:bg-ivory-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <CheckCircle2 className="size-3" />
      )}

      Mark read
    </button>
  );
}

/*
 * ==================================================
 * CLEAR ONE NOTIFICATION
 * ==================================================
 *
 * "Clear" is intentionally used instead of "Delete"
 * because the investor-facing record disappears while
 * the underlying notification remains preserved for
 * administrative/audit purposes.
 */

export function ClearNotificationButton({
  notificationId,
}: {
  notificationId: string;
}) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  async function clearNotification() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/notifications/dismiss",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                notificationId,
              }),
          },
        );

      if (
        response.ok
      ) {
        notifyBadgeChanged();

        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={
        loading
      }
      onClick={
        clearNotification
      }
      aria-label="Clear notification"
      className="focus-ring inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-3 text-[0.68rem] font-semibold text-stone-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <Trash2 className="size-3" />
      )}

      Clear
    </button>
  );
}

/*
 * ==================================================
 * CLEAR ALL NOTIFICATIONS
 * ==================================================
 */

export function ClearAllNotificationsButton({
  disabled,
}: {
  disabled: boolean;
}) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  async function clearAll() {
    if (
      disabled ||
      loading
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Clear all notifications from your notification history?",
      );

    if (
      !confirmed
    ) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/notifications/dismiss",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                all: true,
              }),
          },
        );

      if (
        response.ok
      ) {
        notifyBadgeChanged();

        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={
        disabled ||
        loading
      }
      onClick={
        clearAll
      }
      className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-forest-900/10 bg-white px-4 text-xs font-semibold text-stone-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5" />
      )}

      Clear all
    </button>
  );
}