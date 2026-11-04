
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

import {
  EventRegistrationDetails,
} from "@/src/components/admin/events/event-registration-details";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EventRegistrationPage({
  params,
}: Props) {
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
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  ) {
    notFound();
  }

  const admin = createAdminClient();

  const { data: registration, error: registrationError } =
    await admin
      .from("event_registrations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (registrationError) {
    throw new Error("Could not load event registration.");
  }

  if (!registration) {
    notFound();
  }

  const [
    { data: meeting, error: meetingError },
    { data: emailLogs, error: emailError },
  ] = await Promise.all([
    admin
      .from("event_meetings")
      .select("*")
      .eq("registration_id", id)
      .maybeSingle(),

    admin
      .from("event_email_logs")
      .select(
        "id,email_type,recipient_email,subject,delivery_status,attempt_number,error_message,sent_at,created_at",
      )
      .eq("registration_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (meetingError || emailError) {
    throw new Error("Could not load meeting or email history.");
  }

  return (
    <EventRegistrationDetails
      registration={registration}
      meeting={meeting}
      emailLogs={emailLogs ?? []}
    />
  );
}
