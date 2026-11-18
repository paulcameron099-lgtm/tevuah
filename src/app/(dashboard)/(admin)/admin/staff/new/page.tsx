
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import AddStaffApplicantForm from "@/src/components/admin/staff/add-staff-applicant-form";

export const dynamic = "force-dynamic";

export default async function NewStaffApplicantPage() {
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

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
          Administration / Staff Management
        </p>

        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-forest-950 sm:text-4xl">
          Add Staff Applicant
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
          Register a new recruitment applicant.
          You can manage their interview schedules
          and recruitment emails after saving.
        </p>
      </div>

      <AddStaffApplicantForm />
    </div>
  );
}
