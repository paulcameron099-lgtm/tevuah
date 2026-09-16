"use client";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  notifyAdminNotificationsChanged,
} from "@/src/hooks/use-unread-admin-notification-count";

export function MarkAdminNotificationReadButton({
  notificationId,
}: {
  notificationId: string;
}) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function markRead() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/notifications/read",
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

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Unable to update notification.",
        );
      }

      notifyAdminNotificationsChanged();

      router.refresh();
    } catch (error) {
      console.error(
        "Mark admin notification read error:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={
        markRead
      }
      disabled={
        loading
      }
      className="focus-ring inline-flex min-h-9 cursor-pointer items-center rounded-full border border-forest-900/10 px-4 text-[0.68rem] font-semibold text-forest-950 transition hover:bg-ivory-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading
        ? "Updating..."
        : "Mark as read"}
    </button>
  );
}

export function MarkAllAdminNotificationsReadButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function markAllRead() {
    if (
      loading ||
      disabled
    ) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/notifications/read",
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

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Unable to update notifications.",
        );
      }

      notifyAdminNotificationsChanged();

      router.refresh();
    } catch (error) {
      console.error(
        "Mark all admin notifications read error:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={
        markAllRead
      }
      disabled={
        loading ||
        disabled
      }
      className="focus-ring inline-flex min-h-10 cursor-pointer items-center rounded-full border border-forest-900/10 px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading
        ? "Updating..."
        : "Mark all as read"}
    </button>
  );
}