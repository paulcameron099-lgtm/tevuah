import Link from "next/link";

import {
  ArrowRight,
  Mail,
} from "lucide-react";

import {
  FooterLinkItem,
  FooterReveal,
  FooterRevealSoft,
  FooterStagger,
  FooterStaggerItem,
} from "@/src/components/layout/footer-motion";
import { Container } from "@/src/components/ui/container";
import { footerNavigation } from "@/src/config/navigation";
import { siteConfig } from "@/src/config/site";

import { Logo } from "./logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="overflow-hidden bg-forest-950 text-white">
      <Container>
        {/* ==========================================
            BRAND + NAVIGATION
        ========================================== */}

        <div className="grid gap-12 border-b border-white/10 py-16 sm:py-20 lg:grid-cols-[1.2fr_2fr] lg:gap-20 lg:py-24">
          <FooterReveal className="max-w-md">
            <Logo variant="light" />

            <p className="mt-7 max-w-sm text-sm leading-7 text-white/60">
              Connecting investors with carefully
              considered opportunities across
              vineyard estates, olive agriculture,
              AgTech and fine wine.
            </p>

            <FooterStagger className="mt-8 flex items-center gap-3">
              <FooterStaggerItem>
                <a
                  href={
                    siteConfig.socialLinks.linkedin
                  }
                  aria-label="Tevuah Reserve on LinkedIn"
                  className="focus-ring flex size-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-gold-500 hover:text-gold-400"
                >
                  <ArrowRight className="size-4" />
                </a>
              </FooterStaggerItem>

              <FooterStaggerItem>
                <a
                  href={
                    siteConfig.socialLinks.instagram
                  }
                  aria-label="Tevuah Reserve on Instagram"
                  className="focus-ring flex size-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-gold-500 hover:text-gold-400"
                >
                  <ArrowRight className="size-4" />
                </a>
              </FooterStaggerItem>

              <FooterStaggerItem>
                <a
                  href={`mailto:${siteConfig.email}`}
                  aria-label="Email Tevuah Reserve"
                  className="focus-ring flex size-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-gold-500 hover:text-gold-400"
                >
                  <Mail className="size-4" />
                </a>
              </FooterStaggerItem>
            </FooterStagger>
          </FooterReveal>

          {/* ======================================
              FOOTER NAVIGATION
          ====================================== */}

          <FooterStagger className="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-4">
            {footerNavigation.map((group) => (
              <FooterStaggerItem
                key={group.title}
              >
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                    {group.title}
                  </h2>

                  <FooterStagger className="mt-5 space-y-3.5">
                    {group.items.map((item) => (
                      <FooterLinkItem
                        key={`${group.title}-${item.href}`}
                      >
                        <Link
                          href={item.href}
                          className="text-sm leading-6 text-white/60 transition hover:text-white"
                        >
                          {item.label}
                        </Link>
                      </FooterLinkItem>
                    ))}
                  </FooterStagger>
                </div>
              </FooterStaggerItem>
            ))}
          </FooterStagger>
        </div>

        {/* ==========================================
            INVESTOR UPDATES
        ========================================== */}

        <div className="grid gap-8 border-b border-white/10 py-10 md:grid-cols-[1fr_auto] md:items-center">
          <FooterReveal>
            <div>
              <p className="font-display text-2xl font-medium sm:text-3xl">
                Cultivated insights, delivered.
              </p>

              <p className="mt-2 text-sm text-white/55">
                Estate updates, market
                perspectives and platform news.
              </p>
            </div>
          </FooterReveal>

          <FooterRevealSoft
            className="w-full max-w-md md:w-100"
            delay={0.08}
          >
            <a
              href={`mailto:${siteConfig.email}?subject=Tevuah Reserve updates`}
              className="focus-ring group flex min-h-14 items-center justify-between gap-5 border-b border-white/25 px-1 text-sm text-white/65 transition hover:border-gold-400 hover:text-white"
            >
              <span>
                Request investor updates
              </span>

              <ArrowRight className="size-5 text-gold-400 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            <p className="mt-3 text-xs leading-5 text-white/35">
              Contact Tevuah Reserve to request
              investor and platform updates.
            </p>
          </FooterRevealSoft>
        </div>

        {/* ==========================================
            LEGAL
        ========================================== */}

        <div className="py-8">
          <FooterRevealSoft>
            <div className="flex flex-col gap-5 text-xs leading-5 text-white/40 lg:flex-row lg:items-center lg:justify-between">
              <p>
                © {currentYear} {siteConfig.name}.
                All rights reserved.
              </p>

              <p className="max-w-3xl lg:text-right">
                Investments involve risk,
                including possible loss of
                capital. Information presented on
                the platform may include
                illustrative or demonstration
                content and does not constitute an
                offer, recommendation or
                guarantee.
              </p>
            </div>
          </FooterRevealSoft>
        </div>
      </Container>
    </footer>
  );
}