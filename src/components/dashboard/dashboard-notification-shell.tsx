"use client";

import type {
  ReactNode,
} from "react";

import {
  AdminNotificationBell,
} from "@/src/components/admin/notifications/admin-notification-bell";

import {
  NotificationBell,
} from "@/src/components/notifications/notification-bell";

import {
  useUnreadAdminNotificationCount,
} from "@/src/hooks/use-unread-admin-notification-count";

import {
  useUnreadNotificationCount,
} from "@/src/hooks/use-unread-notification-count";

type DashboardNotificationShellProps = {
  role: string;

  initialCount: number;

  children: (
    count: number,
  ) => ReactNode;
};

export function DashboardNotificationShell({
  role,
  initialCount,
  children,
}: DashboardNotificationShellProps) {
  const isAdmin =
    role ===
      "admin" ||
    role ===
      "super_admin";

  if (isAdmin) {
    return (
      <AdminNotificationState
        initialCount={
          initialCount
        }
      >
        {children}
      </AdminNotificationState>
    );
  }

  return (
    <InvestorNotificationState
      initialCount={
        initialCount
      }
    >
      {children}
    </InvestorNotificationState>
  );
}

function AdminNotificationState({
  initialCount,
  children,
}: {
  initialCount: number;

  children: (
    count: number,
  ) => ReactNode;
}) {
  const {
    count,
  } =
    useUnreadAdminNotificationCount(
      initialCount,
    );

  return (
    <>
      {children(
        count,
      )}
    </>
  );
}

function InvestorNotificationState({
  initialCount,
  children,
}: {
  initialCount: number;

  children: (
    count: number,
  ) => ReactNode;
}) {
  const {
    count,
  } =
    useUnreadNotificationCount(
      initialCount,
    );

  return (
    <>
      {children(
        count,
      )}
    </>
  );
}

export function DashboardHeaderNotificationBell({
  role,
  count,
}: {
  role: string;

  count: number;
}) {
  const isAdmin =
    role ===
      "admin" ||
    role ===
      "super_admin";

  if (isAdmin) {
    return (
      <AdminNotificationBell
  count={
    count
  }
/>
    );
  }

  return (
    <NotificationBell
      count={
        count
      }
    />
  );
}