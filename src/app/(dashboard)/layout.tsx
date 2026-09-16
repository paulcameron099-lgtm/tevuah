import type {
  ReactNode,
} from "react";

import {
  redirect,
} from "next/navigation";

import {
  DashboardShell,
} from "@/src/components/dashboard/dashboard-shell";

import {
  checkAccountAccess,
} from "@/src/lib/auth/account-status";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  getUnreadAdminNotificationCount,
} from "@/src/lib/notifications/get-unread-admin-notification-count";

import {
  getUnreadNotificationCount,
} from "@/src/lib/notifications/get-unread-notification-count";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  /*
   * ==================================================
   * 1. LOAD AUTHENTICATED USER
   * ==================================================
   */
  const user =
    await getCurrentUser();

  /*
   * ==================================================
   * 2. REQUIRE AUTHENTICATION
   * ==================================================
   */
  if (!user) {
    redirect(
      "/login",
    );
  }

  /*
   * ==================================================
   * 3. DETERMINE PORTAL TYPE
   * ==================================================
   *
   * Admin and Super Admin use the company/admin
   * notification system.
   *
   * Investors use the investor notification system.
   */
  const isAdministrator =
    user.role ===
      "admin" ||
    user.role ===
      "super_admin";

  /*
   * ==================================================
   * 4. INVESTOR ACCOUNT ACCESS
   * ==================================================
   *
   * account_status restrictions currently apply to
   * investor accounts only.
   *
   * Administrators must not be blocked by investor
   * account-status enforcement.
   */
  if (!isAdministrator) {
    const accountAccess =
      await checkAccountAccess(
        user.id,
      );

    if (
      !accountAccess.allowed
    ) {
      redirect(
        "/account-restricted",
      );
    }
  }

  /*
   * ==================================================
   * 5. LOAD CORRECT UNREAD NOTIFICATION COUNT
   * ==================================================
   *
   * Investor:
   * investor_notifications
   *
   * Admin / Super Admin:
   * admin_notifications
   * +
   * admin_notification_reads
   *
   * This value becomes the initial count used by the
   * client-side live notification hook.
   */
  const unreadNotificationCount =
    isAdministrator
      ? await getUnreadAdminNotificationCount(
          user.id,
        )
      : await getUnreadNotificationCount(
          user.id,
        );

  /*
   * ==================================================
   * 6. RENDER DASHBOARD
   * ==================================================
   *
   * DashboardShell determines which live notification
   * hook and bell should be used based on user.role.
   */
  return (
    <DashboardShell
      unreadNotificationCount={
        unreadNotificationCount
      }
      user={{
        first_name:
          user.first_name ??
          "",

        last_name:
          user.last_name ??
          "",

        role:
          user.role ??
          "investor",

        avatar_url:
          user.avatar_url ??
          null,
      }}
    >
      {children}
    </DashboardShell>
  );
}