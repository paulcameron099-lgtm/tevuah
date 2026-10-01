"use client";

import Link from "next/link";

import {
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  ContactRound,
  FileWarning,
  Menu,
  Newspaper,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  Button,
} from "@/src/components/ui/button";

import {
  Container,
} from "@/src/components/ui/container";

import {
  mainNavigation,
  moreNavigation,
} from "@/src/config/navigation";

import {
  cn,
} from "@/src/lib/utils";

import {
  HeaderDropdown,
  HeaderEntrance,
} from "./header-motion";

import {
  Logo,
} from "./logo";

import {
  MobileNavigation,
} from "./mobile-navigation";

const moreIcons = {
  "/faq": CircleHelp,
  "/risk-disclosure": FileWarning,
  "/contact": ContactRound,
  "/insights": Newspaper,
} as const;

export function Header() {
  const pathname = usePathname();

  const moreMenuRef =
    useRef<HTMLDivElement>(null);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [moreMenuOpen, setMoreMenuOpen] =
    useState(false);

  const [scrolled, setScrolled] =
    useState(false);

  const isHomepage = pathname === "/";
  const transparent =
    isHomepage && !scrolled;

  const moreActive = moreNavigation.some(
    (item) =>
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`),
  );

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const closeMoreMenu = useCallback(() => {
    setMoreMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  useEffect(() => {
    if (!moreMenuOpen) {
      return;
    }

    const handlePointerDown = (
      event: PointerEvent,
    ) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !moreMenuRef.current?.contains(target)
      ) {
        setMoreMenuOpen(false);
      }
    };

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setMoreMenuOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [moreMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          transparent
            ? "border-transparent bg-transparent text-white"
            : "border-b border-forest-900/10 bg-ivory-50/95 text-forest-950 shadow-[0_10px_40px_rgba(10,23,18,0.06)] backdrop-blur-xl",
        )}
      >
        <HeaderEntrance>
          <Container className="flex h-19 items-center justify-between lg:h-22">
            <Logo
              variant={
                transparent
                  ? "light"
                  : "dark"
              }
            />

            {/* ======================================
                DESKTOP NAVIGATION
            ====================================== */}

            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-5 lg:flex xl:gap-7"
            >
              {mainNavigation.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(
                    `${item.href}/`,
                  );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                    className={cn(
                      "focus-ring group relative rounded-md py-2 text-[0.78rem] font-semibold tracking-[-0.01em] transition-colors xl:text-[0.82rem]",
                      transparent
                        ? "text-white/80 hover:text-white"
                        : "text-stone-700 hover:text-forest-950",
                      active &&
                        (transparent
                          ? "text-white"
                          : "text-forest-950"),
                    )}
                  >
                    {item.label}

                    <span
                      className={cn(
                        "absolute inset-x-0 -bottom-1 mx-auto h-px origin-center transition-transform duration-300",
                        transparent
                          ? "bg-gold-400"
                          : "bg-gold-600",
                        active
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100",
                      )}
                    />
                  </Link>
                );
              })}

              {/* ====================================
                  MORE DROPDOWN
              ==================================== */}

              <div
                ref={moreMenuRef}
                className="relative"
                onMouseEnter={() =>
                  setMoreMenuOpen(true)
                }
                onMouseLeave={() =>
                  setMoreMenuOpen(false)
                }
                onFocusCapture={() =>
                  setMoreMenuOpen(true)
                }
                onBlurCapture={(event) => {
                  const nextTarget =
                    event.relatedTarget;

                  if (
                    nextTarget instanceof Node &&
                    event.currentTarget.contains(
                      nextTarget,
                    )
                  ) {
                    return;
                  }

                  setMoreMenuOpen(false);
                }}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={moreMenuOpen}
                  onClick={() =>
                    setMoreMenuOpen(
                      (current) => !current,
                    )
                  }
                  className={cn(
                    "focus-ring group relative flex items-center gap-1.5 rounded-md py-2 text-[0.78rem] font-semibold tracking-[-0.01em] transition-colors xl:text-[0.82rem]",
                    transparent
                      ? "text-white/80 hover:text-white"
                      : "text-stone-700 hover:text-forest-950",
                    (moreActive ||
                      moreMenuOpen) &&
                      (transparent
                        ? "text-white"
                        : "text-forest-950"),
                  )}
                >
                  More

                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-300",
                      moreMenuOpen &&
                        "rotate-180",
                    )}
                  />

                  <span
                    className={cn(
                      "absolute inset-x-0 -bottom-1 mx-auto h-px origin-center transition-transform duration-300",
                      transparent
                        ? "bg-gold-400"
                        : "bg-gold-600",
                      moreActive ||
                        moreMenuOpen
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </button>

                <HeaderDropdown
                  open={moreMenuOpen}
                  className="absolute right-0 top-full pt-5"
                >
                  <div
                    role="menu"
                    aria-label="More navigation"
                    className="w-145 overflow-hidden rounded-3xl border border-forest-900/10 bg-ivory-50 shadow-[0_24px_80px_rgba(10,23,18,0.16)]"
                  >
                    <div className="border-b border-forest-900/10 px-6 py-5">
                      <div className="flex items-end justify-between gap-8">
                        <div>
                          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-600">
                            Explore more
                          </p>

                          <p className="font-display mt-2 text-xl font-medium text-forest-950">
                            Information & support
                          </p>
                        </div>

                        <p className="max-w-52 text-right text-xs leading-5 text-stone-500">
                          Investor information,
                          guidance and Tevuah
                          Reserve perspectives.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-px bg-forest-900/10">
                      {moreNavigation.map(
                        (item) => {
                          const active =
                            pathname ===
                              item.href ||
                            pathname.startsWith(
                              `${item.href}/`,
                            );

                          const Icon =
                            moreIcons[
                              item.href as keyof typeof moreIcons
                            ];

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              role="menuitem"
                              onClick={
                                closeMoreMenu
                              }
                              className={cn(
                                "group relative bg-ivory-50 p-6 transition-colors duration-300 hover:bg-white",
                                active &&
                                  "bg-white",
                              )}
                            >
                              <div className="flex items-start justify-between gap-5">
                                <span
                                  className={cn(
                                    "flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                                    active
                                      ? "border-gold-500/30 bg-gold-500/10 text-gold-700"
                                      : "border-forest-900/10 bg-white text-forest-950 group-hover:border-gold-500/30 group-hover:text-gold-700",
                                  )}
                                >
                                  <Icon className="size-4" />
                                </span>

                                <ArrowUpRight className="size-4 text-stone-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-600" />
                              </div>

                              <h3 className="font-display mt-5 text-xl font-medium text-forest-950">
                                {item.label}
                              </h3>

                              <p className="mt-2 text-xs leading-6 text-stone-600">
                                {
                                  item.description
                                }
                              </p>

                              <span
                                className={cn(
                                  "absolute inset-x-6 bottom-0 h-px origin-left bg-gold-600 transition-transform duration-300",
                                  active
                                    ? "scale-x-100"
                                    : "scale-x-0 group-hover:scale-x-100",
                                )}
                              />
                            </Link>
                          );
                        },
                      )}
                    </div>
                  </div>
                </HeaderDropdown>
              </div>
            </nav>

            {/* ======================================
                DESKTOP ACTIONS
            ====================================== */}

            <div className="hidden items-center gap-3 lg:flex">
              <Button
                href="/login"
                variant="ghost"
                size="sm"
                className={cn(
                  transparent
                    ? "text-white hover:bg-white/10"
                    : "text-forest-950 hover:bg-forest-900/5",
                )}
              >
                Sign in
              </Button>

              <Button
                href="/investments"
                size="sm"
              >
                Explore opportunities
              </Button>
            </div>

            {/* ======================================
                MOBILE MENU BUTTON
            ====================================== */}

            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() =>
                setMobileMenuOpen(true)
              }
              className={cn(
                "focus-ring flex size-11 items-center justify-center rounded-full border transition lg:hidden",
                transparent
                  ? "border-white/25 bg-white/10 text-white hover:bg-white/15"
                  : "border-forest-900/10 bg-white text-forest-950 hover:bg-ivory-100",
              )}
            >
              <Menu className="size-5" />
            </button>
          </Container>
        </HeaderEntrance>
      </header>

      <MobileNavigation
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
      />
    </>
  );
}