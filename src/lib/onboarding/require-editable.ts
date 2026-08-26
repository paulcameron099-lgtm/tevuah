import { createAdminClient } from "@/src/lib/supabase/admin";

export type OnboardingSection =
  | "profile"
  | "identity"
  | "address"
  | "eligibility"
  | "suitability"
  | "tax";

type EditableResult =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      reason: string;
    };

export async function checkOnboardingEditable(
  userId: string,
  section: OnboardingSection,
): Promise<EditableResult> {
  const admin =
    createAdminClient();

  const {
    data: onboarding,
    error,
  } = await admin
    .from("investor_onboarding")
    .select(
      `
      submitted_at,
      is_locked,
      editable_sections
      `,
    )
    .eq(
      "user_id",
      userId,
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Onboarding edit check error:",
      error,
    );

    return {
      allowed: false,
      reason:
        "Unable to verify onboarding edit permissions.",
    };
  }

  /*
   * No onboarding row yet.
   */
  if (!onboarding) {
    return {
      allowed: true,
    };
  }

  /*
   * Before final submission there is
   * no compliance lock.
   */
  if (!onboarding.is_locked) {
    return {
      allowed: true,
    };
  }

  /*
   * Submitted onboarding is locked,
   * but compliance can selectively
   * reopen individual sections.
   */
  const editableSections =
    onboarding.editable_sections ??
    [];

  if (
    editableSections.includes(
      section,
    )
  ) {
    return {
      allowed: true,
    };
  }

  return {
    allowed: false,

    reason:
      "This onboarding section is locked while your account is under compliance review.",
  };
}