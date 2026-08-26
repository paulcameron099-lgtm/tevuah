"use client";

import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Filter,
  Search,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import { cn } from "@/src/lib/utils";

type InvestorRecord = {
  id: string;

  firstName: string;
  lastName: string;

  email: string;

  phone:
    | string
    | null;

  country:
    | string
    | null;

  city:
    | string
    | null;

  state:
    | string
    | null;

  role: string;

  accountStatus: string;

  onboardingStatus: string;

  kycStatus: string;

  taxStatus: string;

  eligibilityStatus: string;

  suitabilityStatus: string;

  complianceStatus: string;

  createdAt: string;

  lastSignInAt:
    | string
    | null;

  emailConfirmed: boolean;
};

type InvestorDirectoryProps = {
  investors:
    InvestorRecord[];
};

type VerificationFilter =
  | "all"
  | "not_started"
  | "in_progress"
  | "under_review"
  | "action_required"
  | "approved"
  | "rejected";

type AccountFilter =
  | "all"
  | "active"
  | "suspended"
  | "disabled";

export function InvestorDirectory({
  investors,
}: InvestorDirectoryProps) {
  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    verificationFilter,
    setVerificationFilter,
  ] =
    useState<VerificationFilter>(
      "all",
    );

  const [
    accountFilter,
    setAccountFilter,
  ] =
    useState<AccountFilter>(
      "all",
    );

  /*
   * --------------------------------------------------
   * FILTER DIRECTORY
   * --------------------------------------------------
   */
  const filteredInvestors =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return investors.filter(
        (investor) => {
          const fullName =
            `${investor.firstName} ${investor.lastName}`
              .trim()
              .toLowerCase();

          const matchesSearch =
            !normalizedSearch ||
            fullName.includes(
              normalizedSearch,
            ) ||
            investor.email
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            investor.id
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesVerification =
            verificationFilter ===
              "all" ||
            investor.onboardingStatus ===
              verificationFilter;

          const matchesAccount =
            accountFilter ===
              "all" ||
            investor.accountStatus ===
              accountFilter;

          return (
            matchesSearch &&
            matchesVerification &&
            matchesAccount
          );
        },
      );
    }, [
      investors,
      search,
      verificationFilter,
      accountFilter,
    ]);

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-forest-900/10 bg-white">
      {/* ==========================================
          SEARCH + FILTERS
      ========================================== */}

      <div className="border-b border-forest-900/10 p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />

            <input
              type="search"
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Search by investor name, email or user ID..."
              className="focus-ring min-h-12 w-full rounded-xl border border-forest-900/10 bg-ivory-50 pl-11 pr-4 text-sm text-forest-950 outline-none"
            />
          </div>

          {/* VERIFICATION FILTER */}

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" />

            <select
              value={
                verificationFilter
              }
              onChange={(
                event,
              ) =>
                setVerificationFilter(
                  event.target
                    .value as VerificationFilter,
                )
              }
              className="focus-ring min-h-12 min-w-52 appearance-none rounded-xl border border-forest-900/10 bg-white pl-10 pr-8 text-sm text-forest-950 outline-none"
            >
              <option value="all">
                All verification
              </option>

              <option value="not_started">
                Not started
              </option>

              <option value="in_progress">
                In progress
              </option>

              <option value="under_review">
                Under review
              </option>

              <option value="action_required">
                Action required
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>
          </div>

          {/* ACCOUNT FILTER */}

          <select
            value={
              accountFilter
            }
            onChange={(
              event,
            ) =>
              setAccountFilter(
                event.target
                  .value as AccountFilter,
              )
            }
            className="focus-ring min-h-12 min-w-44 rounded-xl border border-forest-900/10 bg-white px-4 text-sm text-forest-950 outline-none"
          >
            <option value="all">
              All accounts
            </option>

            <option value="active">
              Active
            </option>

            <option value="suspended">
              Suspended
            </option>

            <option value="disabled">
              Disabled
            </option>
          </select>
        </div>

        <p className="mt-4 text-xs text-stone-500">
          Showing{" "}
          <span className="font-semibold text-forest-950">
            {
              filteredInvestors.length
            }
          </span>{" "}
          of{" "}
          <span className="font-semibold text-forest-950">
            {
              investors.length
            }
          </span>{" "}
          investors
        </p>
      </div>

      {/* ==========================================
          DESKTOP TABLE
      ========================================== */}

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-295 border-collapse">
          <thead>
            <tr className="border-b border-forest-900/10 bg-ivory-50 text-left">
              <TableHeading>
                Investor
              </TableHeading>

              <TableHeading>
                Verification
              </TableHeading>

              <TableHeading>
                KYC
              </TableHeading>

              <TableHeading>
                Tax
              </TableHeading>

              <TableHeading>
                Account
              </TableHeading>

              <TableHeading>
                Joined
              </TableHeading>

              <TableHeading>
                Action
              </TableHeading>
            </tr>
          </thead>

          <tbody>
            {filteredInvestors.map(
              (
                investor,
              ) => (
                <tr
                  key={
                    investor.id
                  }
                  className="border-b border-forest-900/8 last:border-b-0"
                >
                  {/* INVESTOR */}

                  <td className="px-6 py-5 align-top">
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forest-950 text-xs font-bold text-white">
                        {initials(
                          investor.firstName,
                          investor.lastName,
                        )}
                      </span>

                      <div className="min-w-0">
                        <p className="font-semibold text-forest-950">
                          {
                            investor.firstName
                          }{" "}
                          {
                            investor.lastName
                          }
                        </p>

                        <p className="mt-1 max-w-52 truncate text-xs text-stone-500">
                          {
                            investor.email
                          }
                        </p>

                        <p className="mt-1 max-w-40 truncate font-mono text-[0.6rem] text-stone-400">
                          {
                            investor.id
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* ONBOARDING */}

                  <td className="px-6 py-5 align-top">
                    <StatusBadge
                      status={
                        investor.onboardingStatus
                      }
                    />
                  </td>

                  {/* KYC */}

                  <td className="px-6 py-5 align-top">
                    <MiniVerificationBadge
                      status={
                        investor.kycStatus
                      }
                    />
                  </td>

                  {/* TAX */}

                  <td className="px-6 py-5 align-top">
                    <MiniVerificationBadge
                      status={
                        investor.taxStatus
                      }
                    />
                  </td>

                  {/* ACCOUNT */}

                  <td className="px-6 py-5 align-top">
                    <AccountBadge
                      status={
                        investor.accountStatus
                      }
                    />
                  </td>

                  {/* JOINED */}

                  <td className="px-6 py-5 align-top">
                    <p className="text-sm text-forest-950">
                      {formatDate(
                        investor.createdAt,
                      )}
                    </p>

                    <p className="mt-1 text-xs text-stone-400">
                      {investor.emailConfirmed
                        ? "Email confirmed"
                        : "Email unconfirmed"}
                    </p>
                  </td>

                  {/* ACTION */}

                  <td className="px-6 py-5 align-top">
                    <Link
                      href={`/admin/investors/${investor.id}`}
                      className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white transition hover:bg-forest-800"
                    >
                      View investor

                      <ArrowRight className="size-3.5" />
                    </Link>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* ==========================================
          MOBILE / TABLET CARDS
      ========================================== */}

      <div className="divide-y divide-forest-900/10 lg:hidden">
        {filteredInvestors.map(
          (
            investor,
          ) => (
            <article
              key={
                investor.id
              }
              className="p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest-950 text-xs font-bold text-white">
                  {initials(
                    investor.firstName,
                    investor.lastName,
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-forest-950">
                    {
                      investor.firstName
                    }{" "}
                    {
                      investor.lastName
                    }
                  </p>

                  <p className="mt-1 truncate text-xs text-stone-500">
                    {
                      investor.email
                    }
                  </p>
                </div>

                <AccountBadge
                  status={
                    investor.accountStatus
                  }
                />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <MobileStatus
                  label="Verification"
                  status={
                    investor.onboardingStatus
                  }
                />

                <MobileStatus
                  label="KYC"
                  status={
                    investor.kycStatus
                  }
                />

                <MobileStatus
                  label="Tax"
                  status={
                    investor.taxStatus
                  }
                />
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-forest-900/10 pt-4">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
                    Joined
                  </p>

                  <p className="mt-1 text-xs text-forest-950">
                    {formatDate(
                      investor.createdAt,
                    )}
                  </p>
                </div>

                <Link
                  href={`/admin/investors/${investor.id}`}
                  className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-full bg-forest-950 px-4 text-xs font-semibold text-white"
                >
                  View investor

                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </article>
          ),
        )}
      </div>

      {/* ==========================================
          EMPTY STATE
      ========================================== */}

      {filteredInvestors.length ===
      0 ? (
        <div className="border-t border-forest-900/10 px-6 py-16 text-center">
          <Search className="mx-auto size-6 text-stone-300" />

          <h3 className="font-display mt-4 text-2xl font-semibold text-forest-950">
            No investors found.
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-stone-500">
            Try changing the search term or
            directory filters.
          </p>
        </div>
      ) : null}
    </section>
  );
}

/*
 * ==================================================
 * TABLE HEADING
 * ==================================================
 */
function TableHeading({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="px-6 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-500">
      {children}
    </th>
  );
}

/*
 * ==================================================
 * MAIN VERIFICATION BADGE
 * ==================================================
 */
function StatusBadge({
  status,
}: {
  status: string;
}) {
  const config =
    getStatusConfig(
      status,
    );

  const Icon =
    config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold",
        config.className,
      )}
    >
      <Icon className="size-3" />

      {
        humanize(
          status,
        )
      }
    </span>
  );
}

/*
 * ==================================================
 * KYC / TAX BADGE
 * ==================================================
 */
function MiniVerificationBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status ??
    "not_started";

  const verified =
    normalized ===
      "verified" ||
    normalized ===
      "approved";

  const review =
    normalized ===
    "under_review";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold",

        verified
          ? "bg-emerald-50 text-emerald-700"
          : review
            ? "bg-amber-50 text-amber-700"
            : normalized ===
                "rejected"
              ? "bg-red-50 text-red-700"
              : "bg-stone-100 text-stone-600",
      )}
    >
      {verified ? (
        <ShieldCheck className="size-3" />
      ) : review ? (
        <Clock3 className="size-3" />
      ) : (
        <CircleAlert className="size-3" />
      )}

      {
        humanize(
          normalized,
        )
      }
    </span>
  );
}

/*
 * ==================================================
 * ACCOUNT STATUS BADGE
 * ==================================================
 */
function AccountBadge({
  status,
}: {
  status: string;
}) {
  const active =
    status ===
    "active";

  const suspended =
    status ===
    "suspended";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold",

        active
          ? "bg-emerald-50 text-emerald-700"
          : suspended
            ? "bg-amber-50 text-amber-700"
            : "bg-red-50 text-red-700",
      )}
    >
      {active ? (
        <UserRoundCheck className="size-3" />
      ) : (
        <UserRoundX className="size-3" />
      )}

      {
        humanize(
          status,
        )
      }
    </span>
  );
}

/*
 * ==================================================
 * MOBILE STATUS
 * ==================================================
 */
function MobileStatus({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <div className="mt-2">
        <StatusBadge
          status={
            status
          }
        />
      </div>
    </div>
  );
}

/*
 * ==================================================
 * STATUS CONFIG
 * ==================================================
 */
function getStatusConfig(
  status: string,
) {
  switch (status) {
    case "approved":
      return {
        icon:
          CheckCircle2,

        className:
          "bg-emerald-50 text-emerald-700",
      };

    case "under_review":
      return {
        icon:
          Clock3,

        className:
          "bg-amber-50 text-amber-700",
      };

    case "action_required":
      return {
        icon:
          CircleAlert,

        className:
          "bg-red-50 text-red-700",
      };

    case "rejected":
      return {
        icon:
          CircleAlert,

        className:
          "bg-red-50 text-red-700",
      };

    case "in_progress":
      return {
        icon:
          Clock3,

        className:
          "bg-blue-50 text-blue-700",
      };

    default:
      return {
        icon:
          CircleAlert,

        className:
          "bg-stone-100 text-stone-600",
      };
  }
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

function initials(
  firstName: string,
  lastName: string,
) {
  return [
    firstName?.[0],
    lastName?.[0],
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase() ||
    "TR";
}

function formatDate(
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
    },
  ).format(
    new Date(
      value,
    ),
  );
}