"use client";

import {
  Bell,
} from "lucide-react";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  useUnreadAdminNotificationCount,
} from "@/src/hooks/use-unread-admin-notification-count";

export function AdminNotificationSidebarLink({
  initialCount = 0,
}: {
  initialCount?: number;
}) {
  const pathname =
    usePathname();

  const {
    count,
  } =
    useUnreadAdminNotificationCount(
      initialCount,
    );

  const active =
    pathname ===
      "/admin/notifications" ||
    pathname.startsWith(
      "/admin/notifications/",
    );

  return (
    <Link
      href="/admin/notifications"
      className={`focus-ring flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
        active
          ? "bg-white/10 text-white"
          : "text-white/65 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Bell className="size-4.5 shrink-0" />

      <span className="flex-1">
        Notifications
      </span>

      {count > 0 ? (
        <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1.5 text-[0.62rem] font-bold text-forest-950">
          {count > 99
            ? "99+"
            : count}
        </span>
      ) : null}
    </Link>
  );
}