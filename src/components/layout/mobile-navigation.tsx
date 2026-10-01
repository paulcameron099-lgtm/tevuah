"use client";

import Link from "next/link";

import {
  ArrowUpRight,
  X,
} from "lucide-react";

import {
  useEffect,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  mobileNavigation,
} from "@/src/config/navigation";

import {
  cn,
} from "@/src/lib/utils";

import {
  MobileBackdrop,
  MobileDrawer,
  MobileNavigationItem,
} from "./header-motion";

type MobileNavigationProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNavigation({
  open,
  onClose,
}: MobileNavigationProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-navigation"
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-100 lg:hidden",
        open
          ? "pointer-events-auto"
          : "pointer-events-none",
      )}
    >
      {/* ==========================================
          BACKDROP
      ========================================== */}

      <MobileBackdrop
        open={open}
        className="absolute inset-0"
      >
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onClose}
          tabIndex={open ? 0 : -1}
          className="absolute inset-0 size-full bg-forest-950/65 backdrop-blur-sm"
        />
      </MobileBackdrop>

      {/* ==========================================
          DRAWER
      ========================================== */}

      <MobileDrawer
        open={open}
        className="absolute right-0 top-0 flex h-full w-[min(90%,430px)] flex-col bg-ivory-50 shadow-2xl"
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
            tabIndex={open ? 0 : -1}
            className="focus-ring flex size-11 items-center justify-center rounded-full border border-forest-900/10 bg-white text-forest-950 transition hover:bg-ivory-100"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ========================================
            NAVIGATION
        ======================================== */}

        <nav
          aria-label="Mobile navigation"
          className="flex-1 overflow-y-auto px-6 py-5"
        >
          <ul>
            {mobileNavigation.map(
              (item, index) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(
                    `${item.href}/`,
                  );

                return (
                  <MobileNavigationItem
                    key={item.href}
                    open={open}
                    index={index}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      tabIndex={
                        open ? 0 : -1
                      }
                      aria-current={
                        active
                          ? "page"
                          : undefined
                      }
                      className={cn(
                        "group flex items-center justify-between border-b border-forest-900/10 py-3.5",
                        active &&
                          "border-gold-600/30",
                      )}
                    >
                      <span className="flex items-center gap-4">
                        <span
                          className={cn(
                            "text-[0.68rem] font-semibold",
                            active
                              ? "text-gold-700"
                              : "text-gold-600",
                          )}
                        >
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <span
                          className={cn(
                            "font-display text-[1.35rem] font-medium transition-colors sm:text-2xl",
                            active
                              ? "text-olive-700"
                              : "text-forest-950 group-hover:text-olive-700",
                          )}
                        >
                          {item.label}
                        </span>
                      </span>

                      <ArrowUpRight
                        className={cn(
                          "size-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                          active
                            ? "text-gold-600"
                            : "text-stone-500",
                        )}
                      />
                    </Link>
                  </MobileNavigationItem>
                );
              },
            )}
          </ul>
        </nav>

        {/* ========================================
            ACTIONS
        ======================================== */}

        <div className="border-t border-forest-900/10 bg-forest-950 p-6 text-white">
          <p className="text-sm leading-6 text-white/65">
            Discover carefully presented
            opportunities across cultivated
            land, agricultural technology and
            fine wine.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 text-sm font-semibold transition hover:bg-white/10"
            >
              Sign in
            </Link>

            <Link
              href="/investments"
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-gold-500 px-4 text-center text-sm font-semibold text-forest-950 transition hover:bg-gold-400"
            >
              Explore
            </Link>
          </div>
        </div>
      </MobileDrawer>
    </div>
  );
}