"use client";

import Link from "next/link";
import {
  LogOut,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { investorDashboardNavigation } from "@/src/config/dashboard-navigation";
import { cn } from "@/src/lib/utils";

type MobileDashboardSidebarProps = {
  open: boolean;
  onClose: () => void;

  user: {
    first_name: string;
    last_name: string;
    role: string;
  };
};

export function MobileDashboardSidebar({
  open,
  onClose,
  user,
}: MobileDashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        className={cn(
          "fixed inset-0 z-80 bg-forest-950/60 backdrop-blur-sm transition-opacity lg:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-90 flex w-[min(88%,320px)] flex-col bg-forest-950 text-white shadow-2xl transition-transform duration-300 lg:hidden",
          open
            ? "translate-x-0"
            : "-translate-x-full",
        )}
      >
        <div className="flex min-h-19 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/"
            onClick={onClose}
          >
            <p className="font-display text-xl font-semibold">
              Tevuah Reserve
            </p>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {investorDashboardNavigation.map(
              (item) => {
                const Icon = item.icon;

                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(
                        item.href,
                      );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-medium",
                      active
                        ? "bg-white text-forest-950"
                        : "text-white/60",
                    )}
                  >
                    <Icon className="size-4.5" />
                    {item.label}
                  </Link>
                );
              },
            )}
          </div>
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="px-3 text-sm font-semibold">
            {user.first_name}{" "}
            {user.last_name}
          </p>

          <p className="mt-1 px-3 text-[0.62rem] uppercase tracking-[0.12em] text-white/40">
            {user.role}
          </p>

          <form
            action="/auth/signout"
            method="post"
            className="mt-4"
          >
            <button
              type="submit"
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-white/60"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}