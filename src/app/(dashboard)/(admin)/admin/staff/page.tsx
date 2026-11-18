
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowUpRight,
  BriefcaseBusiness,
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

type StaffApplicant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position_title: string;
  recruitment_status: string;
  interview_date: string | null;
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
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default async function AdminStaffPage() {
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
    .from("staff_applicants")
    .select(
      "id,first_name,last_name,email,position_title,recruitment_status,interview_date,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error(
      "[ADMIN STAFF] Failed to load applicants",
      error,
    );
  }

  const applicants =
    (data ?? []) as StaffApplicant[];

  const newCount = applicants.filter(
    (applicant) =>
      applicant.recruitment_status === "new",
  ).length;

  const invitedCount = applicants.filter(
    (applicant) =>
      applicant.recruitment_status ===
      "interview_invited",
  ).length;

  const scheduledCount = applicants.filter(
    (applicant) =>
      [
        "interview_scheduled",
        "reminder_sent",
      ].includes(applicant.recruitment_status),
  ).length;

  const statistics = [
    {
      label: "Recent applicants",
      value: applicants.length,
      icon: Users,
    },
    {
      label: "New applications",
      value: newCount,
      icon: ClipboardList,
    },
    {
      label: "Interview invitations",
      value: invitedCount,
      icon: Clock3,
    },
    {
      label: "Interviews scheduled",
      value: scheduledCount,
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
            Administration / Recruitment
          </p>

          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-forest-950 sm:text-4xl">
            Staff Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
            Manage recruitment applicants, coordinate
            Zoom interviews, and track recruitment
            communications.
          </p>
        </div>

        <Link
          href="/admin/staff/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-900"
        >
          Add Applicant
          <ArrowUpRight className="size-4" />
        </Link>
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
            Recruitment Applicants
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            The latest 100 applicants, ordered by
            registration date.
          </p>
        </div>

        {error ? (
          <div className="px-6 py-12 text-sm text-red-700">
            Unable to load staff applicants.
            Please try again.
          </div>
        ) : applicants.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <BriefcaseBusiness className="mx-auto size-10 text-stone-300" />

            <h3 className="mt-5 font-display text-xl font-semibold text-forest-950">
              No applicants yet
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Add your first recruitment applicant
              to begin the hiring process.
            </p>

            <Link
              href="/admin/staff/new"
              className="mt-5 inline-flex rounded-xl bg-forest-950 px-5 py-3 text-sm font-semibold text-white hover:bg-forest-900"
            >
              Add Applicant
            </Link>
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
                    Position
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
                {applicants.map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="transition hover:bg-ivory-100/60"
                  >
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-forest-950">
                        {applicant.first_name}{" "}
                        {applicant.last_name}
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        {applicant.email}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-sm text-forest-950">
                        {applicant.position_title}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-stone-600">
                      {formatDate(applicant.created_at)}
                    </td>

                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-forest-950/5 px-3 py-1.5 text-xs font-semibold text-forest-900">
                        {statusLabel(
                          applicant.recruitment_status,
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <Link
                        href={`/admin/staff/${applicant.id}`}
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
