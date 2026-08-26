import { createAdminClient } from "@/src/lib/supabase/admin";

export type ComplianceAuditAction =
  | "sensitive_value_revealed"
  | "investor_approved"
  | "investor_rejected"
  | "information_requested"
  | "onboarding_submitted"
  | "admin_note_added"
  | "document_viewed"
  | "investor_account_suspended"
  | "investor_account_activated"
  | "investor_account_disabled";

type RecordComplianceAuditParams = {
  actorUserId: string;
  investorUserId: string;

  action: ComplianceAuditAction;

  fieldName?: string | null;

  metadata?: Record<
    string,
    unknown
  >;
};

export async function recordComplianceAudit({
  actorUserId,
  investorUserId,
  action,
  fieldName = null,
  metadata = {},
}: RecordComplianceAuditParams) {
  const admin =
    createAdminClient();

  const {
    error,
  } = await admin
    .from(
      "compliance_audit_logs",
    )
    .insert({
      actor_user_id:
        actorUserId,

      investor_user_id:
        investorUserId,

      action,

      field_name:
        fieldName,

      metadata,
    });

  if (error) {
    console.error(
      "Compliance audit log error:",
      error,
    );

    /*
     * Do not throw here.
     *
     * A logging failure should be recorded
     * server-side but should not expose
     * internal information to the client.
     */
  }
}