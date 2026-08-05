"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";
import { mainNavigation } from "@/src/config/navigation";
import { cn } from "@/src/lib/utils";

import { Logo } from "./logo";
import { MobileNavigation } from "./mobile-navigation";

export function Header() {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHomepage = pathname === "/";
  const transparent = isHomepage && !scrolled;

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
        <Container className="flex h-19 items-center justify-between lg:h-22">
          <Logo variant={transparent ? "light" : "dark"} />

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-5 xl:gap-7 lg:flex"
          >
            {mainNavigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring relative rounded-md py-2 text-[0.78rem] font-semibold tracking-[-0.01em] transition-colors xl:text-[0.82rem]",
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
                      transparent ? "bg-gold-400" : "bg-gold-600",
                      active ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

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

            <Button href="/investments" size="sm">
              Explore opportunities
            </Button>
          </div>

          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen(true)}
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
      </header>

      <MobileNavigation
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        />
    </>
  );
}