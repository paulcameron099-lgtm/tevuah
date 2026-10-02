import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import { AdminNotificationHistoricalTimestamp } from "@/src/components/admin/investors/admin-notification-historical-timestamp";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { createAdminClient } from "@/src/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

type InvestorNotification = {
  id: string;
  investor_id: string;
  notification_type: string;
  event_key: string;
  title: string;
  message: string;
  action_label:
    | string
    | null;
  action_path:
    | string
    | null;
  source_type:
    | string
    | null;
  source_id:
    | string
    | null;
  is_read: boolean;
  read_at:
    | string
    | null;
  created_at: string;
  historical_created_at:
    | string
    | null;
  dismissed_at:
    | string
    | null;
};

export const dynamic =
  "force-dynamic";

export default async function AdminInvestorNotificationsPage({
  params,
}: PageProps) {
  /*
   * --------------------------------------------------
   * 1. ADMIN AUTHORIZATION
   * --------------------------------------------------
   */

  await requireAdmin();

  const {
    userId,
  } = await params;

  const admin =
    createAdminClient();

  /*
   * --------------------------------------------------
   * 2. LOAD INVESTOR
   * --------------------------------------------------
   */

  const {
    data: profile,
    error: profileError,
  } = await admin
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      role,
      account_status
      `,
    )
    .eq(
      "id",
      userId,
    )
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    profile.role !==
      "investor"
  ) {
    if (profileError) {
      console.error(
        "Investor notification profile load error:",
        profileError,
      );
    }

    notFound();
  }

  const {
    data: authData,
    error: authError,
  } =
    await admin.auth.admin.getUserById(
      userId,
    );

  if (authError) {
    console.error(
      "Investor notification auth-user load error:",
      authError,
    );
  }

  const investorName =
    [
      profile.first_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Investor";

  const investorEmail =
    authData.user?.email ??
    "Email unavailable";

  /*
   * --------------------------------------------------
   * 3. LOAD ALL RETAINED INVESTOR NOTIFICATIONS
   *
   * IMPORTANT:
   * Admin sees dismissed notifications too.
   * We intentionally DO NOT filter dismissed_at.
   *
   * Admin ordering stays on actual system created_at.
   * Historical time changes investor presentation,
   * not audit chronology.
   * --------------------------------------------------
   */

  const {
    data:
      notificationData,
    error:
      notificationError,
  } = await admin
    .from(
      "investor_notifications",
    )
    .select(
      `
      id,
      investor_id,
      notification_type,
      event_key,
      title,
      message,
      action_label,
      action_path,
      source_type,
      source_id,
      is_read,
      read_at,
      created_at,
      historical_created_at,
      dismissed_at
      `,
    )
    .eq(
      "investor_id",
      userId,
    )
    .order(
      "created_at",
      {
        ascending:
          false,
      },
    )
    .limit(250);

  if (notificationError) {
    console.error(
      "Investor notifications admin load error:",
      notificationError,
    );

    throw new Error(
      "Unable to load investor notifications.",
    );
  }

  const notifications =
    (notificationData ??
      []) as InvestorNotification[];

  /*
   * --------------------------------------------------
   * 4. SUMMARY
   * --------------------------------------------------
   */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read &&
        !notification.dismissed_at,
    ).length;

  const visibleCount =
    notifications.filter(
      (notification) =>
        !notification.dismissed_at,
    ).length;

  const dismissedCount =
    notifications.filter(
      (notification) =>
        Boolean(
          notification.dismissed_at,
        ),
    ).length;

  const historicalCount =
    notifications.filter(
      (notification) =>
        Boolean(
          notification.historical_created_at,
        ),
    ).length;

  /*
   * --------------------------------------------------
   * 5. RENDER
   * --------------------------------------------------
   */

  return (
    <div className="space-y-8">
      {/* ==========================================
          BACK
      ========================================== */}

      <Link
        href={`/admin/investors/${userId}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to investor
      </Link>

      {/* ==========================================
          HEADER
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-forest-950 text-white">
                <Bell className="size-5" />
              </span>

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
                Investor notifications
              </p>
            </div>

            <h1 className="font-display mt-5 text-4xl font-semibold tracking-[-0.035em] text-forest-950">
              {investorName}
            </h1>

            <p className="mt-3 text-sm text-stone-500">
              {investorEmail}
            </p>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600">
              Review notifications delivered to this investor
              and manage the historical date and time shown on
              the investor dashboard. The original system
              timestamp remains preserved for administrative
              and audit purposes.
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-forest-900/10 bg-ivory-50 px-5 py-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
              Account status
            </p>

            <p className="mt-1 text-sm font-semibold text-forest-950">
              {humanize(
                profile.account_status ??
                  "active",
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          SUMMARY
      ========================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={
            Bell
          }
          label="Retained"
          value={
            notifications.length
          }
          detail="All stored notifications"
        />

        <SummaryCard
          icon={
            Eye
          }
          label="Visible"
          value={
            visibleCount
          }
          detail="Available to investor"
        />

        <SummaryCard
          icon={
            Clock3
          }
          label="Unread"
          value={
            unreadCount
          }
          detail="Visible and unread"
        />

        <SummaryCard
          icon={
            BellOff
          }
          label="Cleared"
          value={
            dismissedCount
          }
          detail={`${historicalCount} with historical time`}
        />
      </section>

      {/* ==========================================
          AUDIT NOTE
      ========================================== */}

      <section className="rounded-3xl border border-gold-600/20 bg-gold-50/40 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Clock3 className="mt-0.5 size-5 shrink-0 text-gold-700" />

          <div>
            <p className="text-sm font-semibold text-forest-950">
              Historical notification chronology
            </p>

            <p className="mt-2 max-w-4xl text-sm leading-7 text-stone-600">
              Editing the investor-facing timestamp does not
              alter the notification&apos;s actual system
              creation time. Clearing a historical override
              returns the investor-facing timestamp to the
              original system timestamp.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          NOTIFICATION LIST
      ========================================== */}

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="border-b border-forest-900/10 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Notification history
          </p>

          <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
            Investor notification records
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
            This administrative history includes notifications
            the investor has cleared. Records remain available
            here for operational and audit review.
          </p>
        </div>

        {notifications.length ===
        0 ? (
          <div className="p-8 sm:p-10">
            <div className="rounded-[1.25rem] border border-dashed border-forest-900/15 bg-ivory-50 p-8 text-center">
              <Bell className="mx-auto size-6 text-stone-400" />

              <p className="mt-4 text-sm font-semibold text-forest-950">
                No investor notifications
              </p>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                This investor has not received any stored
                notifications yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {notifications.map(
              (
                notification,
              ) => (
                <article
                  key={
                    notification.id
                  }
                  className="p-6 sm:p-8"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      {/* STATUS */}

                      <div className="flex flex-wrap items-center gap-2">
                        <NotificationTypeBadge
                          value={
                            notification.notification_type
                          }
                        />

                        {notification.is_read ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                            <CheckCircle2 className="size-3.5" />

                            Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-amber-700">
                            <Clock3 className="size-3.5" />

                            Unread
                          </span>
                        )}

                        {notification.dismissed_at ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-stone-600">
                            <EyeOff className="size-3.5" />

                            Cleared
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-blue-700">
                            <Eye className="size-3.5" />

                            Visible
                          </span>
                        )}
                      </div>

                      {/* CONTENT */}

                      <h3 className="mt-4 text-lg font-semibold text-forest-950">
                        {
                          notification.title
                        }
                      </h3>

                      <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
                        {
                          notification.message
                        }
                      </p>

                      {/* SYSTEM INFORMATION */}

                      <div className="mt-6 grid gap-5 rounded-[1.25rem] border border-forest-900/10 bg-ivory-50 p-5 sm:grid-cols-2 xl:grid-cols-4">
                        <AuditValue
                          label="Actual system time"
                          value={
                            formatDateTime(
                              notification.created_at,
                            )
                          }
                        />

                        <AuditValue
                          label="Read time"
                          value={
                            notification.read_at
                              ? formatDateTime(
                                  notification.read_at,
                                )
                              : "Not read"
                          }
                        />

                        <AuditValue
                          label="Dashboard visibility"
                          value={
                            notification.dismissed_at
                              ? `Cleared ${formatDateTime(
                                  notification.dismissed_at,
                                )}`
                              : "Visible"
                          }
                        />

                        <AuditValue
                          label="Source"
                          value={
                            notification.source_type
                              ? humanize(
                                  notification.source_type,
                                )
                              : "System"
                          }
                        />
                      </div>

                      {/* TECHNICAL REFERENCE */}

                      <div className="mt-5 grid gap-2 text-xs text-stone-400 sm:grid-cols-2">
                        <p className="wrap-break-word">
                          <span className="font-semibold text-stone-500">
                            Event:
                          </span>{" "}
                          {
                            notification.event_key
                          }
                        </p>

                        <p className="wrap-break-word">
                          <span className="font-semibold text-stone-500">
                            Notification ID:
                          </span>{" "}
                          {
                            notification.id
                          }
                        </p>
                      </div>
                    </div>

                    {/* HISTORICAL EDITOR */}

                    <div className="w-full shrink-0 xl:w-90">
                      <AdminNotificationHistoricalTimestamp
                        investorId={
                          userId
                        }
                        notificationId={
                          notification.id
                        }
                        actualCreatedAt={
                          notification.created_at
                        }
                        historicalCreatedAt={
                          notification.historical_created_at
                        }
                      />
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/*
 * ==================================================
 * SUMMARY CARD
 * ==================================================
 */

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Bell;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-ivory-50 text-gold-700">
          <Icon className="size-4" />
        </span>

        <span className="font-display text-3xl font-semibold text-forest-950">
          {value}
        </span>
      </div>

      <p className="mt-5 text-sm font-semibold text-forest-950">
        {label}
      </p>

      <p className="mt-1 text-xs leading-5 text-stone-500">
        {detail}
      </p>
    </div>
  );
}

/*
 * ==================================================
 * AUDIT VALUE
 * ==================================================
 */

function AuditValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-stone-400">
        {label}
      </p>

      <p className="mt-1 wrap-break-word text-sm font-medium text-forest-950">
        {value}
      </p>
    </div>
  );
}

/*
 * ==================================================
 * NOTIFICATION TYPE BADGE
 * ==================================================
 */

function NotificationTypeBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="inline-flex rounded-full bg-forest-950 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-white">
      {humanize(
        value,
      )}
    </span>
  );
}

/*
 * ==================================================
 * HELPERS
 * ==================================================
 */

function humanize(
  value: string,
) {
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
    new Date(
      value,
    ),
  );
}