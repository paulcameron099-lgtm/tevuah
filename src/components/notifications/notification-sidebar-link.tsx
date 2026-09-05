

import {
  Bell,
} from "lucide-react";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  useUnreadNotificationCount,
} from "@/src/hooks/use-unread-notification-count";

type Props = {
  initialCount?: number;
  collapsed?: boolean;
};

export function NotificationSidebarLink({
  initialCount = 0,
  collapsed = false,
}: Props) {
  const pathname =
    usePathname();

  const {
    count,
  } =
    useUnreadNotificationCount(
      initialCount,
    );

  const active =
    pathname ===
      "/dashboard/notifications" ||
    pathname.startsWith(
      "/dashboard/notifications/",
    );

  return (
    <Link
      href="/dashboard/notifications"
      title={
        collapsed
          ? "Notifications"
          : undefined
      }
      className={`focus-ring group flex min-h-11 cursor-pointer items-center rounded-xl px-3 text-sm font-semibold transition ${
        collapsed
          ? "justify-center"
          : "gap-3"
      } ${
        active
          ? "bg-forest-950 text-white"
          : "text-stone-600 hover:bg-ivory-50 hover:text-forest-950"
      }`}
    >
      <span className="relative shrink-0">
        <Bell className="size-4.5" />

        {collapsed &&
        count > 0 ? (
          <span
            className="absolute -right-2 -top-2 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[0.55rem] font-bold leading-none text-white ring-2 ring-white"
            aria-hidden="true"
          >
            {count > 9
              ? "9+"
              : count}
          </span>
        ) : null}
      </span>

      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">
            Notifications
          </span>

          {count > 0 ? (
            <span
              className={`inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[0.62rem] font-bold ${
                active
                  ? "bg-white text-forest-950"
                  : "bg-red-600 text-white"
              }`}
            >
              {count > 99
                ? "99+"
                : count}
            </span>
          ) : null}
        </>
      ) : null}
    </Link>
  );
}