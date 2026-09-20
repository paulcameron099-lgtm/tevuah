import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileSignature,
  MapPin,
  ShieldCheck,
  Sprout,
  UsersRound,
} from "lucide-react";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createHash } from "crypto";

import {
  JointInvitationAcceptanceForm,
} from "@/src/components/investments/joint-invitation-acceptance-form";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createClient,
} from "@/src/lib/supabase/server";

type InvitationPreview = {
  invitation_id: string;
  joint_subscription_id: string;
  invitation_status: string;
  expires_at: string;

  member_id: string;
  invitee_investor_id: string;
  member_status: string;
  member_slot: number;

  ownership_bps: number;
  funding_obligation_bps: number;
  obligation_amount: number;

  initiated_by: string;
  parent_status: string;

  total_commitment_amount: number;
  currency: string;

  opportunity_id: string;
  opportunity_title: string;
  opportunity_slug: string;
  opportunity_asset_category: string | null;
  opportunity_location: string | null;

  inviter_first_name: string | null;
  inviter_last_name: string | null;

  invitee_first_name: string | null;
  invitee_last_name: string | null;
};

export default async function JointInvestmentInvitationPage({
  params,
}: {
  params: Promise<{
    token: string;
  }>;
}) {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(
      "/auth/login",
    );
  }

  const {
    token,
  } =
    await params;

  if (!token) {
    return (
      <InvitationUnavailable />
    );
  }

  /*
   * IMPORTANT:
   *
   * The raw invitation token must never be sent to PostgreSQL.
   * The database stores and receives only its SHA-256 digest.
   */
  const tokenHash =
    createHash("sha256")
      .update(token)
      .digest("hex");

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "preview_joint_investment_invitation",
      {
        p_token_hash:
          tokenHash,
      },
    );

  if (error) {
    console.error(
      "Joint invitation preview error:",
      error,
    );

    return (
      <InvitationUnavailable />
    );
  }

  const invitation =
    (
      Array.isArray(data)
        ? data[0]
        : data
    ) as
      | InvitationPreview
      | undefined;

  if (!invitation) {
    return (
      <InvitationUnavailable />
    );
  }

  const inviterName =
    fullName(
      invitation.inviter_first_name,
      invitation.inviter_last_name,
    ) ||
    "Joint investor";

  const inviteeName =
    fullName(
      invitation.invitee_first_name,
      invitation.invitee_last_name,
    ) ||
    "Investor";

  const currency =
    invitation.currency ||
    "USD";

  return (
    <div className="min-h-screen bg-[#f7f6f1]">
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="border-b border-forest-900/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-10">
          <Link
            href="/dashboard/investments"
            className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-forest-950 transition hover:text-gold-700"
          >
            <ArrowLeft className="size-4" />

            My Investments
          </Link>

          <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400 sm:flex">
            <ShieldCheck className="size-4 text-gold-600" />

            Secure investor consent
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="overflow-hidden rounded-4xl bg-forest-950 text-white shadow-sm">
          <div className="relative px-6 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-12">
            <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-gold-400/10 blur-3xl" />

            <div className="relative max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold-300">
                  Joint Investment Invitation
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/65">
                  50 / 50
                </span>
              </div>

              <p className="mt-7 text-sm font-medium text-gold-300">
                {inviterName} invited you
                to invest together
              </p>

              <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {
                  invitation.opportunity_title
                }
              </h1>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">
                {invitation.opportunity_asset_category ? (
                  <span className="inline-flex items-center gap-2">
                    <Sprout className="size-4 text-gold-300" />

                    {humanize(
                      invitation.opportunity_asset_category,
                    )}
                  </span>
                ) : null}

                {invitation.opportunity_location ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4 text-gold-300" />

                    {
                      invitation.opportunity_location
                    }
                  </span>
                ) : null}

                <span className="inline-flex items-center gap-2">
                  <CalendarClock className="size-4 text-gold-300" />

                  Invitation expires{" "}
                  {formatDate(
                    invitation.expires_at,
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            INTRO + ECONOMICS
        ===================================================== */}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="space-y-8">
            <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ivory-100 text-forest-950">
                  <UsersRound className="size-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                    Your invitation
                  </p>

                  <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
                    Review your joint
                    investment
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
                    Hello {inviteeName}.{" "}
                    {inviterName} has
                    invited you to
                    participate in this
                    investment on an
                    equal 50/50 basis.
                    Review the commitment,
                    your individual
                    funding obligation,
                    and the required
                    acknowledgements
                    before signing.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-5 border-t border-forest-900/10 pt-7 sm:grid-cols-3">
                <Metric
                  label="Joint commitment"
                  value={formatMoney(
                    Number(
                      invitation.total_commitment_amount,
                    ),
                    currency,
                  )}
                />

                <Metric
                  label="Your obligation"
                  value={formatMoney(
                    Number(
                      invitation.obligation_amount,
                    ),
                    currency,
                  )}
                />

                <Metric
                  label="Your ownership"
                  value={formatBasisPoints(
                    invitation.ownership_bps,
                  )}
                />
              </div>
            </section>

            {/* =================================================
                50/50 STRUCTURE
            ================================================= */}

            <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                Joint structure
              </p>

              <h2 className="font-display mt-2 text-3xl font-semibold text-forest-950">
                Equal ownership. Equal
                funding responsibility.
              </h2>

              <div className="mt-7 overflow-hidden rounded-3xl border border-forest-900/10">
                <div className="grid sm:grid-cols-2">
                  <MemberPanel
                    eyebrow="Initiating investor"
                    name={inviterName}
                    ownership="50%"
                    obligation={formatMoney(
                      Number(
                        invitation.total_commitment_amount,
                      ) / 2,
                      currency,
                    )}
                  />

                  <div className="border-t border-forest-900/10 sm:border-l sm:border-t-0">
                    <MemberPanel
                      eyebrow="Your share"
                      name={inviteeName}
                      ownership={formatBasisPoints(
                        invitation.ownership_bps,
                      )}
                      obligation={formatMoney(
                        Number(
                          invitation.obligation_amount,
                        ),
                        currency,
                      )}
                      highlighted
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-ivory-50 p-5">
                <p className="text-sm leading-7 text-stone-600">
                  Acceptance does not
                  mean the entire joint
                  commitment is funded
                  by you. Your canonical
                  funding obligation is{" "}
                  <strong className="text-forest-950">
                    {formatMoney(
                      Number(
                        invitation.obligation_amount,
                      ),
                      currency,
                    )}
                  </strong>
                  , representing{" "}
                  <strong className="text-forest-950">
                    {formatBasisPoints(
                      invitation.funding_obligation_bps,
                    )}
                  </strong>{" "}
                  of the total joint
                  commitment.
                </p>
              </div>
            </section>

            {/* =================================================
                ACCEPTANCE FORM
            ================================================= */}

            <JointInvitationAcceptanceForm
              token={token}
              jointSubscriptionId={
                invitation.joint_subscription_id
              }
              opportunityTitle={
                invitation.opportunity_title
              }
              inviterName={
                inviterName
              }
              inviteeName={
                inviteeName
              }
              totalCommitmentCents={
                Number(
                  invitation.total_commitment_amount,
                )
              }
              obligationAmountCents={
                Number(
                  invitation.obligation_amount,
                )
              }
              currency={
                currency
              }
            />
          </div>

          {/* ===================================================
              SIDEBAR
          =================================================== */}

          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <section className="rounded-[1.75rem] border border-forest-900/10 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600">
                Invitation Summary
              </p>

              <div className="mt-6 space-y-5">
                <SidebarValue
                  label="Opportunity"
                  value={
                    invitation.opportunity_title
                  }
                />

                <SidebarValue
                  label="Invited by"
                  value={
                    inviterName
                  }
                />

                <SidebarValue
                  label="Joint commitment"
                  value={formatMoney(
                    Number(
                      invitation.total_commitment_amount,
                    ),
                    currency,
                  )}
                />

                <SidebarValue
                  label="Your commitment"
                  value={formatMoney(
                    Number(
                      invitation.obligation_amount,
                    ),
                    currency,
                  )}
                />

                <SidebarValue
                  label="Ownership"
                  value={formatBasisPoints(
                    invitation.ownership_bps,
                  )}
                />

                <SidebarValue
                  label="Expires"
                  value={formatDate(
                    invitation.expires_at,
                  )}
                />
              </div>
            </section>

            <section className="rounded-[1.75rem] bg-forest-950 p-6 text-white">
              <ShieldCheck className="size-6 text-gold-300" />

              <h3 className="font-display mt-5 text-2xl font-semibold">
                Protected acceptance
              </h3>

              <p className="mt-3 text-sm leading-7 text-white/65">
                This invitation is
                tied to your
                authenticated investor
                account. The invitation
                link alone cannot be
                used by another
                investor to accept your
                allocation.
              </p>
            </section>

            <Link
              href={`/investments/${invitation.opportunity_slug}`}
              className="focus-ring flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-forest-900/10 bg-white px-5 text-sm font-semibold text-forest-950 transition hover:bg-stone-50"
            >
              View opportunity
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
 * UNAVAILABLE
 * ============================================================ */

function InvitationUnavailable() {
  return (
    <div className="min-h-screen bg-[#f7f6f1] px-5 py-16">
      <div className="mx-auto max-w-xl rounded-4xl border border-forest-900/10 bg-white p-8 text-center sm:p-10">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
          <FileSignature className="size-5" />
        </div>

        <h1 className="font-display mt-6 text-3xl font-semibold text-forest-950">
          Invitation unavailable
        </h1>

        <p className="mt-3 text-sm leading-7 text-stone-600">
          This joint investment
          invitation is invalid,
          expired, already completed,
          or is not assigned to the
          currently signed-in investor.
        </p>

        <Link
          href="/dashboard/investments"
          className="focus-ring mt-7 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
        >
          Return to investments
        </Link>
      </div>
    </div>
  );
}

/* ============================================================
 * COMPONENTS
 * ============================================================ */

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-stone-400">
        {label}
      </p>

      <p className="font-display mt-2 text-2xl font-semibold text-forest-950">
        {value}
      </p>
    </div>
  );
}

function MemberPanel({
  eyebrow,
  name,
  ownership,
  obligation,
  highlighted = false,
}: {
  eyebrow: string;
  name: string;
  ownership: string;
  obligation: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-5 sm:p-6 ${
        highlighted
          ? "bg-ivory-50"
          : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.13em] text-stone-400">
          {eyebrow}
        </p>

        {highlighted ? (
          <span className="rounded-full bg-forest-950 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white">
            You
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-base font-semibold text-forest-950">
        {name}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.12em] text-stone-400">
            Ownership
          </p>

          <p className="mt-1 text-sm font-semibold text-forest-950">
            {ownership}
          </p>
        </div>

        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.12em] text-stone-400">
            Obligation
          </p>

          <p className="mt-1 text-sm font-semibold text-forest-950">
            {obligation}
          </p>
        </div>
      </div>
    </div>
  );
}

function SidebarValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-forest-900/10 pb-4 last:border-b-0 last:pb-0">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-semibold leading-6 text-forest-950">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
 * HELPERS
 * ============================================================ */

function fullName(
  firstName:
    | string
    | null,
  lastName:
    | string
    | null,
) {
  return [
    firstName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function humanize(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatBasisPoints(
  basisPoints: number,
) {
  return `${(
    Number(
      basisPoints,
    ) / 100
  ).toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 2,
    },
  )}%`;
}

function formatMoney(
  cents: number,
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    },
  ).format(
    cents / 100,
  );
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}