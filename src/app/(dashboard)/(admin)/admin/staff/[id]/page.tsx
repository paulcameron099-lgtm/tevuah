
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

import StaffApplicantDetails from "@/src/components/admin/staff/staff-applicant-details";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StaffApplicantPage({
  params,
}: PageProps) {
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

  const { id } = await params;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id,
    )
  ) {
    notFound();
  }

  const admin = createAdminClient();

  const [applicantResult, logsResult] = await Promise.all([
    admin
      .from("staff_applicants")
      .select("*")
      .eq("id", id)
      .maybeSingle(),

    admin
      .from("staff_recruitment_email_logs")
      .select(
        "id,email_type,subject,recipient_email,body_text,delivery_status,attempt_number,provider_message_id,error_message,created_at,sent_at",
      )
      .eq("applicant_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (applicantResult.error) {
    console.error(
      "[ADMIN STAFF] Applicant lookup failed",
      applicantResult.error,
    );

    throw new Error("Unable to load applicant.");
  }

  if (!applicantResult.data) {
    notFound();
  }

  if (logsResult.error) {
    console.error(
      "[ADMIN STAFF] Email log lookup failed",
      logsResult.error,
    );

    throw new Error("Unable to load recruitment email history.");
  }

  return (
    <StaffApplicantDetails
      applicant={applicantResult.data}
      emailLogs={logsResult.data ?? []}
    />
  );
}
