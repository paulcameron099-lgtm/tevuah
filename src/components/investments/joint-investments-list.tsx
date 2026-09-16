import Link from "next/link";

import { createClient } from "@/src/lib/supabase/server";


type JointInvestmentRow = {
  joint_subscription_id: string;

  opportunity_title: string;
  opportunity_asset_category: string;
  opportunity_location: string | null;

  initiated_by: string;
  is_initiator: boolean;

  total_commitment_amount: number | string;
  currency: string;
  parent_status: string;

  my_member_status: string;
  my_ownership_bps: number;
  my_obligation_amount: number | string;
  my_consent_status: string | null;

  other_member_first_name: string | null;
  other_member_last_name: string | null;
  other_member_status: string | null;
  other_member_consent_status: string | null;

  invitation_status: string | null;

  both_members_accepted: boolean;
  both_consents_accepted: boolean;
  ready_for_review: boolean;

  created_at: string;
};


function money(
  cents: number | string,
  currency: string,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(
    Number(cents) / 100,
  );
}


function percentage(
  basisPoints: number,
) {
  return `${Number(
    basisPoints,
  ) / 100}%`;
}


function prettyStatus(
  status: string | null,
) {
  if (!status) {
    return "Not started";
  }

  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}


function statusClasses(
  status: string,
) {
  switch (status) {
    case "approved":
    case "funded":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300";

    case "submitted":
    case "under_review":
    case "funding":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300";

    case "rejected":
    case "cancelled":
      return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300";

    default:
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300";
  }
}


function otherName(
  firstName: string | null,
  lastName: string | null,
) {
  return [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() ||
    "Joint investor";
}


export default async function JointInvestmentsList() {
  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "list_my_joint_investments",
    );


  if (error) {
    console.error(
      "Joint investments list RPC error:",
      error,
    );

    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
        <p className="text-sm text-red-700 dark:text-red-300">
          Unable to load your joint investments.
        </p>
      </section>
    );
  }


  const investments =
    (data ?? []) as
      JointInvestmentRow[];


  /*
   * Don't add an empty block to an existing investments
   * dashboard if the investor has never used joint investing.
   */

  if (
    investments.length === 0
  ) {
    return null;
  }


  return (
    <section>
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
          Joint investments
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Investments shared with another Tevuah Reserve investor.
        </p>
      </div>


      <div className="grid gap-4">
        {investments.map(
          (investment) => {
            const partnerName =
              otherName(
                investment.other_member_first_name,
                investment.other_member_last_name,
              );


            return (
              <Link
                key={
                  investment.joint_subscription_id
                }
                href={`/dashboard/investments/joint/${investment.joint_subscription_id}`}
                className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 sm:p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-400">
                        Joint Investment
                      </p>

                      {investment.is_initiator && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-900">
                          You initiated
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-lg font-semibold text-slate-950 transition group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
                      {investment.opportunity_title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      With {partnerName}
                    </p>
                  </div>


                  <span
                    className={[
                      "inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold",
                      statusClasses(
                        investment.parent_status,
                      ),
                    ].join(" ")}
                  >
                    {prettyStatus(
                      investment.parent_status,
                    )}
                  </span>
                </div>


                <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Joint commitment
                    </p>

                    <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                      {money(
                        investment.total_commitment_amount,
                        investment.currency,
                      )}
                    </p>
                  </div>


                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Your commitment
                    </p>

                    <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                      {money(
                        investment.my_obligation_amount,
                        investment.currency,
                      )}
                    </p>
                  </div>


                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Your ownership
                    </p>

                    <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                      {percentage(
                        investment.my_ownership_bps,
                      )}
                    </p>
                  </div>
                </div>


                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 text-sm dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-slate-500">
                    <span>
                      You:{" "}
                      <strong className="font-medium text-slate-700 dark:text-slate-300">
                        {prettyStatus(
                          investment.my_member_status,
                        )}
                      </strong>
                    </span>

                    <span>
                      {partnerName}:{" "}
                      <strong className="font-medium text-slate-700 dark:text-slate-300">
                        {prettyStatus(
                          investment.other_member_status,
                        )}
                      </strong>
                    </span>
                  </div>

                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    View details →
                  </span>
                </div>


                {investment.ready_for_review && (
                  <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                    Both investors have completed their required acceptance.
                  </div>
                )}
              </Link>
            );
          },
        )}
      </div>
    </section>
  );
}