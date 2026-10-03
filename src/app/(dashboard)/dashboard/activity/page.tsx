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

  /*
   * Actual immutable activity timestamp.
   *
   * This remains the real system/audit chronology.
   */
  occurred_at: string;

  /*
   * Optional administrator-controlled historical timestamp.
   *
   * When present, this controls investor-facing chronology only.
   */
  historical_occurred_at: string | null;

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

  /*
   * ----------------------------------------------------------
   * Load the investor's permanent activity history
   * ----------------------------------------------------------
   *
   * We deliberately do not order/limit by occurred_at here.
   *
   * Why:
   *
   * An administrator may assign historical_occurred_at to an
   * event. If PostgreSQL first ordered and limited by the real
   * occurred_at, an event whose investor-facing date was moved
   * into the past could still occupy a slot among the newest
   * 250 records.
   *
   * Investor-facing chronology must instead be based on:
   *
   * historical_occurred_at ?? occurred_at
   *
   * Therefore:
   *
   *   1. Load the investor's activity records.
   *   2. Calculate effective chronology.
   *   3. Sort by effective chronology.
   *   4. Take the newest 250.
   *
   * Actual occurred_at remains untouched.
   * ----------------------------------------------------------
   */

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
      historical_occurred_at,
      created_at
      `,
    )
    .eq("investor_id", user.id);

  if (error) {
    console.error(
      "Investor activity load error:",
      error,
    );

    throw new Error(
      "Unable to load your activity history.",
    );
  }

  /*
   * ----------------------------------------------------------
   * Investor-facing chronology
   * ----------------------------------------------------------
   *
   * Historical date wins when present.
   *
   * Actual occurred_at remains available on every event for
   * administration/audit and is never rewritten here.
   * ----------------------------------------------------------
   */

  const allEvents =
    (data ?? []) as ActivityEvent[];

  const sortedEvents = [...allEvents].sort(
    compareActivityEvents,
  );

  const events = sortedEvents.slice(0, 250);

  const groupedEvents =
    groupEventsByDate(events);

  const investmentEvents =
    events.filter(
      (event) =>
        event.event_type === "investment" ||
        event.event_type === "subscription",
    ).length;

  const cashEvents =
    events.filter(
      (event) =>
        event.event_type === "account" ||
        event.event_type === "funding" ||
        event.event_type === "distribution",
    ).length;

  const reportingEvents =
    events.filter(
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
              ([dateKey, dateEvents]) => {
                const headingTimestamp =
                  getEffectiveTimestamp(
                    dateEvents[0],
                  );

                return (
                  <div
                    key={dateKey}
                    className="px-6 py-7 sm:px-8"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                      {formatDateHeading(
                        headingTimestamp,
                      )}
                    </p>

                    <div className="mt-5 space-y-5">
                      {dateEvents.map(
                        (event) => (
                          <ActivityRow
                            key={event.id}
                            event={event}
                          />
                        ),
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>

      {allEvents.length > 250 ? (
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
    EVENT_PRESENTATION[
      event.event_type
    ] ??
    EVENT_PRESENTATION.system;

  const Icon =
    presentation.icon;

  /*
   * The investor sees the historical timestamp when one has
   * been assigned. Otherwise they see the real occurred_at.
   */
  const effectiveTimestamp =
    getEffectiveTimestamp(
      event,
    );

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
            dateTime={
              effectiveTimestamp
            }
            className="shrink-0 text-xs font-medium text-stone-400"
          >
            {formatTime(
              effectiveTimestamp,
            )}
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

/*
 * ------------------------------------------------------------
 * Effective timestamp
 * ------------------------------------------------------------
 *
 * This is the single canonical helper for every investor-facing
 * Activity Timeline date operation.
 *
 * DO NOT use occurred_at directly for:
 *
 *   - display
 *   - grouping
 *   - ordering
 *
 * occurred_at remains the immutable real/audit timestamp.
 * ------------------------------------------------------------
 */

function getEffectiveTimestamp(
  event: ActivityEvent,
) {
  return (
    event.historical_occurred_at ??
    event.occurred_at
  );
}

/*
 * Sort newest -> oldest using investor-facing chronology.
 *
 * If two events have exactly the same effective timestamp,
 * ID provides a deterministic secondary ordering.
 */
function compareActivityEvents(
  a: ActivityEvent,
  b: ActivityEvent,
) {
  const aTime =
    new Date(
      getEffectiveTimestamp(a),
    ).getTime();

  const bTime =
    new Date(
      getEffectiveTimestamp(b),
    ).getTime();

  if (aTime !== bTime) {
    return bTime - aTime;
  }

  return b.id.localeCompare(
    a.id,
  );
}

function groupEventsByDate(
  events: ActivityEvent[],
): Array<
  [
    string,
    ActivityEvent[],
  ]
> {
  const groups =
    new Map<
      string,
      ActivityEvent[]
    >();

  for (
    const event of events
  ) {
    const effectiveTimestamp =
      getEffectiveTimestamp(
        event,
      );

    /*
     * Use the same local-calendar interpretation used by the
     * displayed heading instead of slicing the UTC ISO string.
     *
     * This prevents grouping around midnight from disagreeing
     * with the date shown to the investor.
     */
    const dateKey =
      getDateGroupKey(
        effectiveTimestamp,
      );

    const current =
      groups.get(
        dateKey,
      ) ?? [];

    current.push(
      event,
    );

    groups.set(
      dateKey,
      current,
    );
  }

  return Array.from(
    groups.entries(),
  );
}

function getDateGroupKey(
  value: string,
) {
  const date =
    new Date(value);

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    ),
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    ),
  ].join("-");
}

function formatDateHeading(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(
    new Date(value),
  );
}

function formatTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}