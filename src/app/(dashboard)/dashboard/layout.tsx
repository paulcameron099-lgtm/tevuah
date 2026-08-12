import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/src/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/src/lib/auth/get-current-user";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell
      user={{
        first_name:
          user.first_name ?? "",
        last_name:
          user.last_name ?? "",
        role:
          user.role ?? "investor",
        avatar_url:
          user.avatar_url ?? null,
      }}
    >
      {children}
    </DashboardShell>
  );
}