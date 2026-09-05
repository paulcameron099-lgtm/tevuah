"use client";

import {
  Bell,
} from "lucide-react";

import Link from "next/link";

type Props = {
  count?: number;
  className?: string;
};

export function NotificationBell({
  count = 0,
  className = "",
}: Props) {
  return (
    <Link
      href="/dashboard/notifications"
      aria-label={
        count > 0
          ? `${count} unread notification${
              count === 1
                ? ""
                : "s"
            }`
          : "Notifications"
      }
      title="Notifications"
      className={`focus-ring relative inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-forest-900/10 bg-white text-forest-950 transition hover:bg-ivory-50 ${className}`}
    >
      <Bell className="size-4.5" />

      {count > 0 ? (
        <span
          className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[0.62rem] font-bold leading-none text-white ring-2 ring-white"
          aria-hidden="true"
        >
          {count > 99
            ? "99+"
            : count}
        </span>
      ) : null}
    </Link>
  );
}