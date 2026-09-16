import type {
  LucideIcon,
} from "lucide-react";

import {
  Bell,
  CircleDollarSign,
  FileCheck2,
  HandCoins,
  Landmark,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  MarkAdminNotificationReadButton,
  MarkAllAdminNotificationsReadButton,
} from "@/src/components/admin/notifications/admin-notification-actions";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export default async function AdminNotificationsPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  if (
    user.role !== "admin" &&
    user.role !==
      "super_admin"
  ) {
    redirect(
      "/dashboard",
    );
  }

  const admin =
    createAdminClient();

  /*
   * ==================================================
   * LOAD COMPANY NOTIFICATIONS
   * ==================================================
   */
  const {
    data: notifications,
    error:
      notificationsError,
  } = await admin
    .from(
      "admin_notifications",
    )
    .select(
      `
      id,
      notification_type,
      event_key,
      title,
      message,
      action_label,
      action_path,
      source_type,
      source_id,
      created_at
      `,
    )
    .order(
      "created_at",
      {
        ascending:
          false,
      },
    )
    .limit(100);

  if (
    notificationsError
  ) {
    console.error(
      "Admin notifications load error:",
      notificationsError,
    );

    throw new Error(
      "Unable to load admin notifications.",
    );
  }

  const rows =
    notifications ??
    [];

  /*
   * ==================================================
   * LOAD THIS ADMIN'S READ STATE
   * ==================================================
   */
  const notificationIds =
    rows.map(
      (notification) =>
        notification.id,
    );

  let readIds =
    new Set<string>();

  if (
    notificationIds.length >
    0
  ) {
    const {
      data: reads,
      error:
        readsError,
    } = await admin
      .from(
        "admin_notification_reads",
      )
      .select(
        "notification_id",
      )
      .eq(
        "admin_id",
        user.id,
      )
      .in(
        "notification_id",
        notificationIds,
      );

    if (readsError) {
      console.error(
        "Admin notification read-state load error:",
        readsError,
      );

      throw new Error(
        "Unable to load notification read state.",
      );
    }

    readIds =
      new Set(
        (
          reads ??
          []
        ).map(
          (read) =>
            read.notification_id,
        ),
      );
  }

  const unreadCount =
    rows.filter(
      (notification) =>
        !readIds.has(
          notification.id,
        ),
    ).length;

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] bg-forest-950 p-7 text-white sm:p-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              Company operations
            </p>

            <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Notifications
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
              Review investor activity,
              funding events,
              withdrawal requests,
              compliance updates and
              other operational events
              requiring attention.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-white/40">
              Unread
            </p>

            <p className="font-display mt-1 text-3xl font-semibold text-white">
              {unreadCount}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="flex flex-col gap-4 border-b border-forest-900/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Operations center
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Recent notifications
            </h2>
          </div>

          <MarkAllAdminNotificationsReadButton
            disabled={
              unreadCount ===
              0
            }
          />
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center sm:px-8">
            <Bell className="mx-auto size-8 text-stone-300" />

            <h3 className="font-display mt-5 text-2xl font-semibold text-forest-950">
              No company notifications yet.
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-500">
              Investor submissions,
              payments, withdrawals and
              other operational updates
              will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {rows.map(
              (
                notification,
              ) => {
                const isRead =
                  readIds.has(
                    notification.id,
                  );

                const Icon =
                  getAdminNotificationIcon(
                    notification.notification_type,
                  );

                return (
                  <article
                    key={
                      notification.id
                    }
                    className={`p-6 sm:px-8 ${
                      isRead
                        ? "bg-white"
                        : "bg-ivory-50/70"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                        <Icon className="size-4.5 text-gold-600" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-stone-500">
                            {humanize(
                              notification.notification_type,
                            )}
                          </span>

                          {!isRead ? (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-emerald-700">
                              New
                            </span>
                          ) : null}
                        </div>

                        <h3 className="font-display mt-4 text-xl font-semibold text-forest-950">
                          {
                            notification.title
                          }
                        </h3>

                        <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
                          {
                            notification.message
                          }
                        </p>

                        <p className="mt-3 text-xs text-stone-400">
                          {formatDateTime(
                            notification.created_at,
                          )}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                          {notification.action_path ? (
                            <Link
                              href={
                                notification.action_path
                              }
                              className="focus-ring inline-flex min-h-9 cursor-pointer items-center rounded-full bg-forest-950 px-4 text-[0.68rem] font-semibold text-white transition hover:bg-forest-800"
                            >
                              {notification.action_label ??
                                "View"}
                            </Link>
                          ) : null}

                          {!isRead ? (
                            <MarkAdminNotificationReadButton
                              notificationId={
                                notification.id
                              }
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function getAdminNotificationIcon(
  type: string,
): LucideIcon {
  switch (type) {
    case "subscription":
      return WalletCards;

    case "payment":
      return CircleDollarSign;

    case "withdrawal":
      return Landmark;

    case "distribution":
      return HandCoins;

    case "compliance":
      return ShieldCheck;

    case "investor":
      return UserRound;

    case "document":
      return FileCheck2;

    default:
      return Bell;
  }
}

function humanize(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "Update";
  }

  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatDateTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    },
  ).format(
    new Date(value),
  );
}