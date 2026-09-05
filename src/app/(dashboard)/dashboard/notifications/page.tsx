import type { LucideIcon } from "lucide-react";
import { Bell, CircleDollarSign, FileText, HandCoins, ShieldCheck, WalletCards } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  MarkAllNotificationsReadButton,
  MarkNotificationReadButton,
} from "@/src/components/notifications/notification-actions";

import { checkAccountAccess } from "@/src/lib/auth/account-status";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

export default async function InvestorNotificationsPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "investor") redirect("/dashboard");

  const accountAccess = await checkAccountAccess(user.id);
  if (!accountAccess.allowed) redirect("/account-restricted");

  const admin = createAdminClient();

  const { data: notifications, error } = await admin
    .from("investor_notifications")
    .select(`
      id,
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
      created_at
    `)
    .eq("investor_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Investor notifications load error:", error);
    throw new Error("Unable to load notifications.");
  }

  const rows = notifications ?? [];
  const unreadCount = rows.filter((notification) => !notification.is_read).length;

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] bg-forest-950 p-7 text-white sm:p-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              Investor updates
            </p>

            <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Notifications
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
              Review investment, funding, distribution, statement and compliance updates for your account.
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
              Account activity
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Recent notifications
            </h2>
          </div>

          <MarkAllNotificationsReadButton disabled={unreadCount === 0} />
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center sm:px-8">
            <Bell className="mx-auto size-8 text-stone-300" />
            <h3 className="font-display mt-5 text-2xl font-semibold text-forest-950">
              No notifications yet.
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-500">
              Important investment and account updates will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {rows.map((notification) => {
              const Icon = getNotificationIcon(notification.notification_type);

              return (
                <article
                  key={notification.id}
                  className={`p-6 sm:px-8 ${notification.is_read ? "bg-white" : "bg-ivory-50/70"}`}
                >
                  <div className="flex gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                      <Icon className="size-4.5 text-gold-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-stone-500">
                          {humanize(notification.notification_type)}
                        </span>

                        {!notification.is_read ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-emerald-700">
                            New
                          </span>
                        ) : null}
                      </div>

                      <h3 className="font-display mt-4 text-xl font-semibold text-forest-950">
                        {notification.title}
                      </h3>

                      <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
                        {notification.message}
                      </p>

                      <p className="mt-3 text-xs text-stone-400">
                        {formatDateTime(notification.created_at)}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        {notification.action_path ? (
                          <Link
                            href={notification.action_path}
                            className="focus-ring inline-flex min-h-9 cursor-pointer items-center rounded-full bg-forest-950 px-4 text-[0.68rem] font-semibold text-white transition hover:bg-forest-800"
                          >
                            {notification.action_label ?? "View"}
                          </Link>
                        ) : null}

                        {!notification.is_read ? (
                          <MarkNotificationReadButton notificationId={notification.id} />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-forest-950">
          Notification preferences
        </h2>
        <p className="mt-3 text-sm leading-7 text-stone-500">
          Email communication preferences can be managed from your Account & Settings page.
        </p>
        <Link
          href="/dashboard/account"
          className="focus-ring mt-5 inline-flex min-h-10 cursor-pointer items-center rounded-full border border-forest-900/10 px-4 text-xs font-semibold text-forest-950 transition hover:bg-ivory-50"
        >
          Manage preferences
        </Link>
      </section>
    </div>
  );
}

function getNotificationIcon(type: string): LucideIcon {
  switch (type) {
    case "subscription":
      return WalletCards;
    case "payment":
      return CircleDollarSign;
    case "distribution":
      return HandCoins;
    case "statement":
      return FileText;
    case "compliance":
      return ShieldCheck;
    default:
      return Bell;
  }
}

function humanize(value: string | null | undefined) {
  if (!value) return "Update";
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
