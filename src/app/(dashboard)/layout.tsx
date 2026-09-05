import type {
  ReactNode,
} from "react";

import {
  redirect,
} from "next/navigation";

import { DashboardShell } from "@/src/components/dashboard/dashboard-shell";
import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { getUnreadNotificationCount } from "@/src/lib/notifications/get-unread-notification-count";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  /*
   * 1. Load the authenticated user.
   */
  const user =
    await getCurrentUser();

  /*
   * 2. Not logged in.
   */
  if (!user) {
    redirect("/login");
  }

  /*
   * 3. Admins are allowed through without
   * investor account-status enforcement.
   *
   * account_status is currently intended
   * for investor accounts.
   */
  const isAdministrator =
    user.role === "admin" ||
    user.role === "super_admin";

  const unreadNotificationCount =
  user.role === "investor"
    ? await getUnreadNotificationCount(
        user.id,
      )
    : 0;

  /*
   * 4. Investors must have an active
   * account before entering the dashboard.
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
   * 5. Account is allowed.
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