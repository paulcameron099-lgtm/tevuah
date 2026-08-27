import {
  ArrowLeft,
  FileText,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  StatementGenerateForm,
} from "@/src/components/admin/statements/statement-generate-form";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

export default async function NewStatementPage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !== "admin" &&
    user.role !== "super_admin"
  ) {
    redirect("/dashboard");
  }

  const admin =
    createAdminClient();

  /*
   * ==================================================
   * LOAD INVESTORS
   * ==================================================
   */
  const {
    data: profiles,
    error,
  } = await admin
    .from(
      "profiles",
    )
    .select(
      `
      id,
      first_name,
      last_name,
      role,
      account_status
      `,
    )
    .eq(
      "role",
      "investor",
    )
    .order(
      "first_name",
      {
        ascending:
          true,
      },
    );

  if (error) {
    console.error(
      "Statement investor list load error:",
      error,
    );

    throw new Error(
      "Unable to load investors.",
    );
  }

  const investors =
    await Promise.all(
      (
        profiles ??
        []
      ).map(
        async (
          profile,
        ) => {
          const {
            data:
              authUserData,
          } =
            await admin.auth.admin.getUserById(
              profile.id,
            );

          return {
            id:
              profile.id,

            firstName:
              profile.first_name ??
              "",

            lastName:
              profile.last_name ??
              "",

            email:
              authUserData.user
                ?.email ??
              null,

            accountStatus:
              profile.account_status ??
              "active",
          };
        },
      ),
    );

  return (
    <div className="space-y-8">
      <Link
        href="/admin/statements"
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-forest-950"
      >
        <ArrowLeft className="size-4" />

        Back to statements
      </Link>

      <div>
        <div className="flex size-11 items-center justify-center rounded-full bg-ivory-50">
          <FileText className="size-5 text-gold-600" />
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
          Investor reporting
        </p>

        <h1 className="font-display mt-4 text-4xl font-semibold tracking-[-0.035em] text-forest-950 sm:text-5xl">
          Generate Statement
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
          Generate a frozen investor statement for a
          current or historical reporting period.
        </p>
      </div>

      <StatementGenerateForm
        investors={
          investors
        }
      />
    </div>
  );
}