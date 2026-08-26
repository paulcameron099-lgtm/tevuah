import {
  CircleAlert,
  LogOut,
  ShieldAlert,
} from "lucide-react";

import { redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";

export default async function AccountRestrictedPage() {
  const supabase =
    await createClient();

  const {
    data: claimsData,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  /*
   * We intentionally use the normal
   * signed-in user's profile here.
   */
  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select(
      `
      first_name,
      last_name,
      account_status
      `,
    )
    .eq(
      "id",
      userId,
    )
    .maybeSingle();

  /*
   * If account becomes active again,
   * the user should no longer remain
   * on the restricted page.
   */
  if (
    profile?.account_status ===
    "active"
  ) {
    redirect("/dashboard");
  }

  const suspended =
    profile?.account_status ===
    "suspended";

  const investorName =
    [
      profile?.first_name,
      profile?.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Investor";

  return (
    <main className="min-h-screen bg-ivory-50 px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-4xl border border-forest-900/10 bg-white p-7 shadow-sm sm:p-10">
          <span className="flex size-14 items-center justify-center rounded-full bg-red-50 text-red-700">
            <ShieldAlert className="size-6" />
          </span>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Account access
          </p>

          <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
            {suspended
              ? "Your investor account is temporarily suspended."
              : "Your investor account is disabled."}
          </h1>

          <p className="mt-5 text-sm leading-7 text-stone-600">
            Hello{" "}
            <strong className="text-forest-950">
              {investorName}
            </strong>
            . Access to your investor dashboard and
            account actions is currently restricted.
          </p>

          <div className="mt-7 flex items-start gap-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 p-5">
            <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-700" />

            <div>
              <p className="text-sm font-semibold text-amber-900">
                What this means
              </p>

              <p className="mt-2 text-sm leading-7 text-amber-800">
                You cannot edit onboarding information,
                access investment actions or use the
                investor dashboard while this account
                restriction remains active.
              </p>
            </div>
          </div>

          <p className="mt-7 text-sm leading-7 text-stone-600">
            If you believe this restriction requires
            clarification, contact the Tevuah Reserve
            support or compliance team.
          </p>

          <form
            action="/auth/signout"
            method="post"
            className="mt-8"
          >
            <button
              type="submit"
              className="focus-ring inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed"
            >
              <LogOut className="size-4" />

              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}