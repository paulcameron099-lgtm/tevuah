"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  Bell,
  Menu,
} from "lucide-react";

import { DashboardSidebar } from "@/src/components/dashboard/dashboard-sidebar";
import { MobileDashboardSidebar } from "@/src/components/dashboard/mobile-dashboard-sidebar";

type DashboardShellProps = {
  children: ReactNode;

  user: {
    first_name: string;
    last_name: string;
    role: string;
    avatar_url: string | null;
  };
};

export function DashboardShell({
  children,
  user,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-ivory-100">
      <DashboardSidebar user={user} />

      <MobileDashboardSidebar
        open={mobileMenuOpen}
        onClose={() =>
          setMobileMenuOpen(false)
        }
        user={user}
      />

      <div className="min-h-screen lg:pl-72.5">
        <header className="sticky top-0 z-30 border-b border-forest-900/10 bg-ivory-100/90 backdrop-blur-xl">
          <div className="flex min-h-19 items-center justify-between gap-5 px-5 sm:px-7 lg:min-h-22 lg:px-10 xl:px-12">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                aria-label="Open navigation"
                className="focus-ring flex size-11 items-center justify-center rounded-full border border-forest-900/10 bg-white text-forest-950 lg:hidden"
              >
                <Menu className="size-5" />
              </button>

              <div>
                <p className="text-xs text-stone-500">
                  Investor portal
                </p>

                <p className="mt-0.5 text-sm font-semibold text-forest-950">
                  Welcome back
                  {user.first_name
                    ? `, ${user.first_name}`
                    : ""}
                  .
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Notifications"
              className="focus-ring relative flex size-11 items-center justify-center rounded-full border border-forest-900/10 bg-white text-forest-950"
            >
              <Bell className="size-4.5" />

              <span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-gold-500" />
            </button>
          </div>
        </header>

        <main className="px-5 py-8 sm:px-7 sm:py-10 lg:px-10 lg:py-12 xl:px-12">
          <div className="mx-auto w-full max-w-360">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}