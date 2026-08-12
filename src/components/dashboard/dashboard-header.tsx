import {
  Bell,
  Menu,
} from "lucide-react";

type DashboardHeaderProps = {
  firstName: string;
};

export function DashboardHeader({
  firstName,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-forest-900/10 bg-ivory-100/90 backdrop-blur-xl">
      <div className="flex min-h-19 items-center justify-between gap-5 px-5 sm:px-7 lg:min-h-22 lg:px-10 xl:px-12">
        <div className="flex items-center gap-4">
          <button
            type="button"
            data-dashboard-menu-trigger
            aria-label="Open navigation"
            className="focus-ring flex size-11 items-center justify-center rounded-full border border-forest-900/10 bg-white text-forest-950 lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div>
            <p className="text-xs text-stone-500">
              Welcome back
            </p>

            <p className="mt-0.5 text-sm font-semibold text-forest-950">
              {firstName || "Investor"}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="focus-ring relative flex size-11 items-center justify-center rounded-full border border-forest-900/10 bg-white text-forest-950 transition hover:border-forest-900/20"
        >
          <Bell className="size-4.5" />

          <span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-gold-500" />
        </button>
      </div>
    </header>
  );
}