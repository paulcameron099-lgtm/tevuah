"use client";

import type {
  ReactNode,
} from "react";

import {
  useState,
} from "react";

import {
  Menu,
} from "lucide-react";

import {
  AdminNotificationBell,
} from "@/src/components/admin/notifications/admin-notification-bell";

import {
  DashboardSidebar,
} from "@/src/components/dashboard/dashboard-sidebar";

import {
  MobileDashboardSidebar,
} from "@/src/components/dashboard/mobile-dashboard-sidebar";

import {
  NotificationBell,
} from "@/src/components/notifications/notification-bell";

import {
  useUnreadAdminNotificationCount,
} from "@/src/hooks/use-unread-admin-notification-count";

import {
  useUnreadNotificationCount,
} from "@/src/hooks/use-unread-notification-count";

type DashboardShellProps = {
  children: ReactNode;

  unreadNotificationCount:
    number;

  user: {
    first_name: string;
    last_name: string;
    role: string;
    avatar_url: string | null;
  };
};

export function DashboardShell({
  children,
  user,
  unreadNotificationCount,
}: DashboardShellProps) {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const isAdmin =
    user.role ===
      "admin" ||
    user.role ===
      "super_admin";

  /*
   * We split the role-specific hook into child
   * components so only the correct notification
   * endpoint is polled.
   */
  if (isAdmin) {
    return (
      <AdminDashboardShell
        user={
          user
        }
        unreadNotificationCount={
          unreadNotificationCount
        }
        mobileMenuOpen={
          mobileMenuOpen
        }
        setMobileMenuOpen={
          setMobileMenuOpen
        }
      >
        {children}
      </AdminDashboardShell>
    );
  }

  return (
    <InvestorDashboardShell
      user={
        user
      }
      unreadNotificationCount={
        unreadNotificationCount
      }
      mobileMenuOpen={
        mobileMenuOpen
      }
      setMobileMenuOpen={
        setMobileMenuOpen
      }
    >
      {children}
    </InvestorDashboardShell>
  );
}

type RoleDashboardShellProps = {
  children:
    ReactNode;

  unreadNotificationCount:
    number;

  mobileMenuOpen:
    boolean;

  setMobileMenuOpen:
    (
      value: boolean,
    ) => void;

  user: {
    first_name:
      string;

    last_name:
      string;

    role:
      string;

    avatar_url:
      string | null;
  };
};

function AdminDashboardShell({
  children,
  user,
  unreadNotificationCount,
  mobileMenuOpen,
  setMobileMenuOpen,
}: RoleDashboardShellProps) {
  const {
    count,
  } =
    useUnreadAdminNotificationCount(
      unreadNotificationCount,
    );

  return (
    <DashboardShellView
      user={
        user
      }
      count={
        count
      }
      mobileMenuOpen={
        mobileMenuOpen
      }
      setMobileMenuOpen={
        setMobileMenuOpen
      }
      bell={
        <AdminNotificationBell
          count={
            count
          }
        />
      }
      portalLabel="Administration portal"
    >
      {children}
    </DashboardShellView>
  );
}

function InvestorDashboardShell({
  children,
  user,
  unreadNotificationCount,
  mobileMenuOpen,
  setMobileMenuOpen,
}: RoleDashboardShellProps) {
  const {
    count,
  } =
    useUnreadNotificationCount(
      unreadNotificationCount,
    );

  return (
    <DashboardShellView
      user={
        user
      }
      count={
        count
      }
      mobileMenuOpen={
        mobileMenuOpen
      }
      setMobileMenuOpen={
        setMobileMenuOpen
      }
      bell={
        <NotificationBell
          count={
            count
          }
        />
      }
      portalLabel="Investor portal"
    >
      {children}
    </DashboardShellView>
  );
}

function DashboardShellView({
  children,
  user,
  count,
  mobileMenuOpen,
  setMobileMenuOpen,
  bell,
  portalLabel,
}: {
  children:
    ReactNode;

  count:
    number;

  mobileMenuOpen:
    boolean;

  setMobileMenuOpen:
    (
      value: boolean,
    ) => void;

  bell:
    ReactNode;

  portalLabel:
    string;

  user: {
    first_name:
      string;

    last_name:
      string;

    role:
      string;

    avatar_url:
      string | null;
  };
}) {
  return (
    <div className="min-h-screen bg-ivory-100">
      <DashboardSidebar
        user={
          user
        }
        unreadNotificationCount={
          count
        }
      />

      <MobileDashboardSidebar
        open={
          mobileMenuOpen
        }
        onClose={() =>
          setMobileMenuOpen(
            false,
          )
        }
        user={
          user
        }
        unreadNotificationCount={
          count
        }
      />

      <div className="min-h-screen lg:pl-72.5">
        <header className="sticky top-0 z-30 border-b border-forest-900/10 bg-ivory-100/90 backdrop-blur-xl">
          <div className="flex min-h-19 items-center justify-between gap-5 px-5 sm:px-7 lg:min-h-22 lg:px-10 xl:px-12">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(
                    true,
                  )
                }
                aria-label="Open navigation"
                className="focus-ring flex size-11 cursor-pointer items-center justify-center rounded-full border border-forest-900/10 bg-white text-forest-950 lg:hidden"
              >
                <Menu className="size-5" />
              </button>

              <div>
                <p className="text-xs text-stone-500">
                  {portalLabel}
                </p>

                <p className="mt-0.5 text-sm font-semibold text-forest-950">
                  Welcome back
                  {user.first_name
                    ? `, ${user.first_name}`
                    : ""}
                  .
                </p>
              </div>
            </div>

            {bell}
          </div>
        </header>

        <main className="px-5 py-8 sm:px-7 sm:py-10 lg:px-10 lg:py-12 xl:px-12">
          <div className="mx-auto w-full max-w-360">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}