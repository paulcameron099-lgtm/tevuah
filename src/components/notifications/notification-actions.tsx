"use client";

import {
  CheckCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

function notifyBadgeChanged() {
  window.dispatchEvent(
    new Event(
      "tevuah:notifications-changed",
    ),
  );
}

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

      if (response.ok) {
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

      if (response.ok) {
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