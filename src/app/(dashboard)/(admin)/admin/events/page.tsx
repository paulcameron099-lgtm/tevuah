
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  Clock3,
  Users,
} from "lucide-react";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Registration = {
  id: string;
  event_title: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  status: string;
  confirmation_email_status: string;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AdminEventsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !== "admin" &&
    user.role !== "super_admin"
  ) {
    redirect("/dashboard");
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("event_registrations")
    .select(
      "id,event_title,first_name,last_name,email,country,status,confirmation_email_status,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error(
      "[ADMIN EVENTS] Failed to load registrations",
      error,
    );
  }

  const registrations =
    (data ?? []) as Registration[];

  const newCount = registrations.filter(
    (registration) =>
      registration.status === "new",
  ).length;

  const meetingCount = registrations.filter(
    (registration) =>
      registration.status === "meeting_scheduled",
  ).length;

  const pendingCount = registrations.filter(
    (registration) =>
      registration.status === "under_review" ||
      registration.status === "meeting_requested",
  ).length;

  const statistics = [
    {
      label: "Recent registrations",
      value: registrations.length,
      icon: Users,
    },
    {
      label: "New enquiries",
      value: newCount,
      icon: ClipboardList,
    },
    {
      label: "Awaiting next steps",
      value: pendingCount,
      icon: Clock3,
    },
    {
      label: "Meetings scheduled",
      value: meetingCount,
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-9">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
          Administration / Events
        </p>

        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-forest-950 sm:text-4xl">
          Events Management
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
          Review event registrations, manage attendee
          enquiries, and coordinate meeting arrangements.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((statistic) => {
          const Icon = statistic.icon;

          return (
            <div
              key={statistic.label}
              className="rounded-2xl border border-forest-900/10 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-forest-950/5 text-forest-900">
                  <Icon className="size-5" />
                </span>
              </div>

              <p className="mt-6 font-display text-3xl font-semibold text-forest-950">
                {statistic.value}
              </p>

              <p className="mt-2 text-xs font-medium text-stone-500">
                {statistic.label}
              </p>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-sm">
        <div className="border-b border-forest-900/10 px-6 py-6 sm:px-8">
          <h2 className="font-display text-xl font-semibold text-forest-950">
            Registration enquiries
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            The latest 100 registrations, ordered by
            submission date.
          </p>
        </div>

        {error ? (
          <div className="px-6 py-12 text-sm text-red-700">
            Unable to load event registrations.
            Please try again.
          </div>
        ) : registrations.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <CalendarDays className="mx-auto size-10 text-stone-300" />

            <h3 className="mt-5 font-display text-xl font-semibold text-forest-950">
              No registrations yet
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Submitted event registrations will
              appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left">
              <thead className="bg-ivory-100">
                <tr className="text-xs uppercase tracking-wider text-stone-500">
                  <th className="px-6 py-4 font-semibold">
                    Applicant
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Event
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Submitted
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-forest-900/10">
                {registrations.map((registration) => (
                  <tr
                    key={registration.id}
                    className="transition hover:bg-ivory-100/60"
                  >
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-forest-950">
                        {registration.first_name}{" "}
                        {registration.last_name}
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        {registration.email}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="max-w-60 text-sm text-forest-950">
                        {registration.event_title}
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        {registration.country}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-stone-600">
                      {formatDate(registration.created_at)}
                    </td>

                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-forest-950/5 px-3 py-1.5 text-xs font-semibold text-forest-900">
                        {statusLabel(registration.status)}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <Link
                        href={`/admin/events/${registration.id}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-forest-900 hover:text-gold-700"
                      >
                        View details
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
