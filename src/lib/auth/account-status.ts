import { createAdminClient } from "@/src/lib/supabase/admin";

export type AccountStatus =
  | "active"
  | "suspended"
  | "disabled";

type AccountAccessResult =
  | {
      allowed: true;

      status:
        AccountStatus;
    }
  | {
      allowed: false;

      status:
        AccountStatus;

      reason: string;
    };

export async function checkAccountAccess(
  userId: string,
): Promise<AccountAccessResult> {
  const admin =
    createAdminClient();

  const {
    data: profile,
    error,
  } = await admin
    .from("profiles")
    .select(
      `
      account_status
      `,
    )
    .eq(
      "id",
      userId,
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Account status check error:",
      error,
    );

    return {
      allowed: false,

      status:
        "disabled",

      reason:
        "Unable to verify account access.",
    };
  }

  /*
   * No profile should never be treated
   * as an active account.
   */
  if (!profile) {
    return {
      allowed: false,

      status:
        "disabled",

      reason:
        "Investor profile could not be found.",
    };
  }

  const status =
    (profile.account_status ??
      "active") as AccountStatus;

  /*
   * ACTIVE
   */
  if (
    status ===
    "active"
  ) {
    return {
      allowed: true,

      status,
    };
  }

  /*
   * SUSPENDED
   */
  if (
    status ===
    "suspended"
  ) {
    return {
      allowed: false,

      status,

      reason:
        "Your investor account has been temporarily suspended.",
    };
  }

  /*
   * DISABLED
   */
  return {
    allowed: false,

    status:
      "disabled",

    reason:
      "Your investor account has been disabled.",
  };
}