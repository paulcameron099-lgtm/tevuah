"use client";

import Link from "next/link";

import {
  LogOut,
  X,
} from "lucide-react";

import { usePathname } from "next/navigation";

import {
  adminDashboardNavigation,
  investorDashboardNavigation,
  superAdminDashboardNavigation,
} from "@/src/config/dashboard-navigation";

// import { useUnreadNotificationCount } from "@/src/hooks/use-unread-notification-count";
import { cn } from "@/src/lib/utils";

type MobileDashboardSidebarProps = {
  open: boolean;

  onClose: () => void;

  unreadNotificationCount?: number;

  user: {
    first_name: string;
    last_name: string;
    role: string;
  };
};

export function MobileDashboardSidebar({
  open,
  onClose,
  user,
  unreadNotificationCount = 0,
}: MobileDashboardSidebarProps) {
  const pathname =
    usePathname();


  /*
   * Choose navigation according
   * to the logged-in user's role.
   */
  const navigation =
    user.role ===
    "super_admin"
      ? superAdminDashboardNavigation
      : user.role ===
          "admin"
        ? adminDashboardNavigation
        : investorDashboardNavigation;

  /*
   * Mobile portal label.
   */
  const portalLabel =
    user.role ===
      "admin" ||
    user.role ===
      "super_admin"
      ? "Administration Portal"
      : "Investor Portal";

  /*
   * Navigation section title.
   */
  const navigationLabel =
    user.role ===
      "admin" ||
    user.role ===
      "super_admin"
      ? "Administration"
      : "Portfolio";

  return (
    <>
      <button
        type="button"
        onClick={
          onClose
        }
        aria-hidden={
          !open
        }
        tabIndex={
          open
            ? 0
            : -1
        }
        className={cn(
          "fixed inset-0 z-80 cursor-pointer bg-forest-950/60 backdrop-blur-sm transition-opacity lg:hidden",

          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-90 flex w-[min(88%,320px)] flex-col bg-forest-950 text-white shadow-2xl transition-transform duration-300 lg:hidden",

          open
            ? "translate-x-0"
            : "-translate-x-full",
        )}
      >
        <div className="flex min-h-19 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/"
            onClick={
              onClose
            }
            className="cursor-pointer"
          >
            <p className="font-display text-xl font-semibold">
              Tevuah Reserve
            </p>

            <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-gold-400">
              {
                portalLabel
              }
            </p>
          </Link>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Close navigation"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/10 text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <p className="px-3 pb-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/30">
            {
              navigationLabel
            }
          </p>

          <div className="space-y-1">
            {navigation.map(
              (
                item,
              ) => {
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
                    onClick={
                      onClose
                    }
                    className={cn(
                      "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition",

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
                        className="inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1.5 text-[0.62rem] font-bold leading-none text-white"
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
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl p-3">
            <p className="text-sm font-semibold text-white">
              {
                user.first_name
              }{" "}
              {
                user.last_name
              }
            </p>

            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.12em] text-white/40">
              {
                user.role
              }
            </p>
          </div>

          <form
            action="/auth/signout"
            method="post"
            className="mt-2"
          >
            <button
              type="submit"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm text-white/60 transition hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut className="size-4" />

              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}