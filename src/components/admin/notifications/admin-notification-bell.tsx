"use client";

import {
  Bell,
} from "lucide-react";

import Link from "next/link";

export function AdminNotificationBell({
  count = 0,
}: {
  count?: number;
}) {
  return (
    <Link
      href="/admin/notifications"
      aria-label={
        count > 0
          ? `${count} unread admin notifications`
          : "Admin notifications"
      }
      className="focus-ring relative inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-forest-900/10 bg-white text-forest-950 transition hover:bg-ivory-50"
    >
      <Bell className="size-4.5" />

      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[0.6rem] font-bold leading-none text-white">
          {count > 99
            ? "99+"
            : count}
        </span>
      ) : null}
    </Link>
  );
}