"use client";

import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { useEffect } from "react";

import { mainNavigation } from "@/src/config/navigation";
import { cn } from "@/src/lib/utils";

type MobileNavigationProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNavigation({
  open,
  onClose,
}: MobileNavigationProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  return (
   <div
  id="mobile-navigation"
  aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-100 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-forest-950/65 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={cn(
          "absolute right-0 top-0 flex h-full w-[min(88%,420px)] flex-col bg-ivory-50 shadow-2xl transition-transform duration-500 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-forest-900/10 px-6 py-5">
          <div>
            <p className="font-display text-xl font-semibold text-forest-950">
              Tevuah
            </p>

            <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-stone-500">
              Reserve
            </p>
          </div>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="focus-ring flex size-11 items-center justify-center rounded-full border border-forest-900/10 bg-white text-forest-950 transition hover:bg-ivory-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-7">
          <ul className="space-y-1">
            {mainNavigation.map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="group flex items-center justify-between border-b border-forest-900/10 py-4"
                >
                  <span className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-gold-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="font-display text-2xl font-medium text-forest-950 transition-colors group-hover:text-olive-700">
                      {item.label}
                    </span>
                  </span>

                  <ArrowUpRight className="size-4 text-stone-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-forest-900/10 bg-forest-950 p-6 text-white">
          <p className="text-sm leading-6 text-white/65">
            Discover carefully presented opportunities across cultivated land,
            agricultural technology and fine wine.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              onClick={onClose}
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 text-sm font-semibold transition hover:bg-white/10"
            >
              Sign in
            </Link>

            <Link
              href="/investments"
              onClick={onClose}
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-gold-500 px-4 text-center text-sm font-semibold text-forest-950 transition hover:bg-gold-400"
            >
              Explore
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}