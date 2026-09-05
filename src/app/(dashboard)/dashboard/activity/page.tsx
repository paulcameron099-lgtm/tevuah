import {
  ArrowRight,
  Banknote,
  BellRing,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  FileBarChart,
  HandCoins,
  History,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type ActivityEventType =
  | "subscription"
  | "funding"
  | "investment"
  | "distribution"
  | "statement"
  | "compliance"
  | "account"
  | "system";

type ActivityEvent = {
  id: string;
  event_type: ActivityEventType;
  event_key: string;
  title: string;
  message: string;
  action_path: string | null;
  source_type: string | null;
  source_id: string | null;
  occurred_at: string;
  created_at: string;
};

const EVENT_PRESENTATION: Record<
  ActivityEventType,
  {
    label: string;
    icon: LucideIcon;
  }
> = {
  subscription: {
    label: "Subscription",
    icon: BriefcaseBusiness,
  },
  funding: {
    label: "Funding",
    icon: CircleDollarSign,
  },
  investment: {
    label: "Investment",
    icon: CheckCircle2,
  },
  distribution: {
    label: "Distribution",
    icon: HandCoins,
  },
  statement: {
    label: "Statement",
    icon: FileBarChart,
  },
  compliance: {
    label: "Compliance",
    icon: ShieldCheck,
  },
  account: {
    label: "Account",
    icon: Banknote,
  },
  system: {
    label: "System",
    icon: BellRing,
  },
};

export default async function InvestorActivityPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "investor") {
    redirect("/dashboard");
  }

  const admin = createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from("investor_activity_events")
    .select(
      `
      id,
      event_type,
      event_key,
      title,
      message,
      action_path,
      source_type,
      source_id,
      occurred_at,
      created_at
      `,
    )
    .eq("investor_id", user.id)
    .order("occurred_at", {
      ascending: false,
    })
    .order("id", {
      ascending: false,
    })
    .limit(250);

  if (error) {
    console.error(
      "Investor activity load error:",
      error,
    );

    throw new Error(
      "Unable to load your activity history.",
    );
  }

  const events = (data ?? []) as ActivityEvent[];
  const groupedEvents = groupEventsByDate(events);

  const investmentEvents = events.filter(
    (event) =>
      event.event_type === "investment" ||
      event.event_type === "subscription",
  ).length;

  const cashEvents = events.filter(
    (event) =>
      event.event_type === "account" ||
      event.event_type === "funding" ||
      event.event_type === "distribution",
  ).length;

  const reportingEvents = events.filter(
    (event) =>
      event.event_type === "statement" ||
      event.event_type === "compliance",
  ).length;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investor record
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Activity Timeline
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          A permanent chronological record of your investment,
          cash account, distribution, statement and compliance activity.
          Unlike notifications, these historical records do not disappear
          when they are read.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Timeline events"
          value={events.length}
        />

        <SummaryCard
          label="Investment activity"
          value={investmentEvents}
        />

        <SummaryCard
          label="Cash & distributions"
          value={cashEvents}
        />

        <SummaryCard
          label="Reporting & compliance"
          value={reportingEvents}
        />
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
        <div className="flex flex-col gap-4 border-b border-forest-900/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
              Permanent history
            </p>

            <h2 className="font-display mt-3 text-3xl font-semibold text-forest-950">
              Your account activity
            </h2>
          </div>

          <Link
            href="/dashboard/notifications"
            className="focus-ring inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-forest-950"
          >
            View notifications
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="px-6 py-16 text-center sm:px-8">
            <History className="mx-auto size-8 text-stone-300" />

            <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
              No activity recorded yet.
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-500">
              Investment, funding, distribution, reporting and compliance
              events will appear here as your account activity develops.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-forest-900/10">
            {groupedEvents.map(
              ([dateKey, dateEvents]) => (
                <div
                  key={dateKey}
                  className="px-6 py-7 sm:px-8"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                    {formatDateHeading(dateEvents[0].occurred_at)}
                  </p>

                  <div className="mt-5 space-y-5">
                    {dateEvents.map((event) => (
                      <ActivityRow
                        key={event.id}
                        event={event}
                      />
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {events.length >= 250 ? (
        <p className="text-center text-xs leading-6 text-stone-400">
          Showing your 250 most recent timeline events.
        </p>
      ) : null}
    </div>
  );
}

function ActivityRow({
  event,
}: {
  event: ActivityEvent;
}) {
  const presentation =
    EVENT_PRESENTATION[event.event_type] ??
    EVENT_PRESENTATION.system;

  const Icon = presentation.icon;

  return (
    <article className="relative flex gap-4 rounded-2xl border border-forest-900/10 bg-ivory-50/50 p-4 sm:p-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-forest-900/10 bg-white text-forest-950">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-stone-500 ring-1 ring-inset ring-forest-900/10">
              {presentation.label}
            </span>

            <h3 className="mt-2 text-sm font-semibold text-forest-950">
              {event.title}
            </h3>
          </div>

          <time
            dateTime={event.occurred_at}
            className="shrink-0 text-xs font-medium text-stone-400"
          >
            {formatTime(event.occurred_at)}
          </time>
        </div>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
          {event.message}
        </p>

        {event.action_path ? (
          <Link
            href={event.action_path}
            className="focus-ring mt-3 inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-forest-950"
          >
            View details
            <ArrowRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="font-display mt-3 text-3xl font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function groupEventsByDate(
  events: ActivityEvent[],
): Array<[string, ActivityEvent[]]> {
  const groups = new Map<string, ActivityEvent[]>();

  for (const event of events) {
    const dateKey = event.occurred_at.slice(0, 10);
    const current = groups.get(dateKey) ?? [];

    current.push(event);
    groups.set(dateKey, current);
  }

  return Array.from(groups.entries());
}

function formatDateHeading(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}