"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";

import {
  adminDashboardNavigation,
  investorDashboardNavigation,
  superAdminDashboardNavigation,
} from "@/src/config/dashboard-navigation";

// import { useUnreadNotificationCount } from "@/src/hooks/use-unread-notification-count";
import { cn } from "@/src/lib/utils";

type DashboardSidebarProps = {
  unreadNotificationCount?: number;

  user: {
    first_name: string;
    last_name: string;
    role: string;
    avatar_url: string | null;
  };
};

export function DashboardSidebar({
  user,
  unreadNotificationCount = 0,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  /*
   * Keep the notification count live.
   *
   * The initial value comes from the server,
   * then the hook refreshes it automatically.
   */

  const initials = [
    user.first_name?.[0],
    user.last_name?.[0],
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  /*
   * Choose navigation based on role.
   */
  const navigation =
    user.role === "super_admin"
      ? superAdminDashboardNavigation
      : user.role === "admin"
        ? adminDashboardNavigation
        : investorDashboardNavigation;

  /*
   * Sidebar section label.
   */
  const navigationLabel =
    user.role === "admin" ||
    user.role === "super_admin"
      ? "Administration"
      : "Portfolio";

  /*
   * Portal subtitle.
   */
  const portalLabel =
    user.role === "admin" ||
    user.role === "super_admin"
      ? "Administration Portal"
      : "Investor Portal";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72.5 flex-col border-r border-white/10 bg-forest-950 text-white lg:flex">
      <div className="border-b border-white/10 px-7 py-7">
        <Link
          href="/"
          className="focus-ring block cursor-pointer rounded-md"
        >
          <p className="font-display text-2xl font-semibold">
            Tevuah Reserve
          </p>

          <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold-400">
            {portalLabel}
          </p>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/30">
          {navigationLabel}
        </p>

        <div className="mt-3 space-y-1">
          {navigation.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                item.href ===
                "/dashboard"
                  ? pathname ===
                    "/dashboard"
                  : pathname.startsWith(
                      item.href,
                    );

              /*
               * Only the investor
               * Notifications navigation item
               * should display the unread badge.
               */
              const isNotificationItem =
                user.role !==
                  "admin" &&
                user.role !==
                  "super_admin" &&
                item.href ===
                  "/dashboard/notifications";

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className={cn(
                    "focus-ring flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition",
                    active
                      ? "bg-white text-forest-950"
                      : "text-white/60 hover:bg-white/6 hover:text-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4.5 shrink-0",
                      active
                        ? "text-gold-600"
                        : "text-white/40",
                    )}
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {
                      item.label
                    }
                  </span>

                  {isNotificationItem &&
                  unreadNotificationCount >
                    0 ? (
                    <span
                      aria-label={`${unreadNotificationCount} unread notifications`}
                      className={cn(
                        "inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[0.62rem] font-bold leading-none",
                        active
                          ? "bg-red-600 text-white"
                          : "bg-red-600 text-white",
                      )}
                    >
                      {unreadNotificationCount >
                      99
                        ? "99+"
                        : unreadNotificationCount}
                    </span>
                  ) : null}
                </Link>
              );
            },
          )}
        </div>

        {user.role !==
          "admin" &&
        user.role !==
          "super_admin" ? (
          <div className="mt-8 border-t border-white/10 pt-6">
            <Link
              href="/investments"
              className="group block cursor-pointer rounded-[1.25rem] border border-white/10 bg-white/5 p-4 transition hover:bg-white/8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-400">
                Marketplace
              </p>

              <p className="mt-2 text-sm leading-6 text-white/60">
                Explore new investment opportunities.
              </p>

              <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white">
                Browse opportunities

                <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </div>
        ) : null}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl p-3">
          {user.avatar_url ? (
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={
                  user.avatar_url
                }
                alt={`${user.first_name} ${user.last_name}`}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-forest-950">
              {initials ||
                "TR"}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {
                user.first_name
              }{" "}
              {
                user.last_name
              }
            </p>

            <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.12em] text-white/35">
              {user.role}
            </p>
          </div>
        </div>

        <form
          action="/auth/signout"
          method="post"
          className="mt-2"
        >
          <button
            type="submit"
            className="focus-ring flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/55 transition hover:bg-red-500/10 hover:text-red-200"
          >
            <LogOut className="size-4" />

            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}