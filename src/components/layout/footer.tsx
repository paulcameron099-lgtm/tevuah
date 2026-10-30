import Link from "next/link";

import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  // Linkedin,
  // Instagram,
} from "lucide-react";
import Image from "next/image";

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
          {/* BRAND LOGO */}
          
        <Link
          href="/"
          aria-label="Tevuah Reserve home"
          className="focus-ring group inline-flex max-w-full items-center gap-4 rounded-full"
        >
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-gold-500/40 bg-[#071F13] shadow-[0_8px_28px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:border-gold-400 sm:size-18">
            <Image
              src="/images/logo/tevuah-reserve-logo.jpeg"
              alt="Tevuah Reserve logo"
              fill
              sizes="(max-width: 640px) 64px, 72px"
              className="rounded-full object-cover"
            />
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {siteConfig.shortName}
            </span>

            <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-gold-400">
              Reserve
            </span>
          </div>
        </Link>


          {/* BRAND DESCRIPTION */}
          <p className="mt-7 max-w-sm text-sm leading-7 text-white/60">
            Connecting investors with carefully considered
            opportunities across vineyard estates, olive agriculture,
            AgTech and fine wine.
          </p>

          {/* CONTACT AND SOCIAL ICONS */}
          <FooterStagger className="mt-8 flex flex-wrap items-center gap-3">
            {/* EMAIL */}
            <FooterStaggerItem>
              <a
                href={`mailto:${siteConfig.email}`}
                aria-label="Email Tevuah Reserve"
                className="focus-ring group flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-400 motion-reduce:transform-none"
              >
                <Mail className="size-4" />
              </a>
            </FooterStaggerItem>

            {/* PHONE */}
            <FooterStaggerItem>
              <a
                href="tel:+447441905062"
                aria-label="Call Tevuah Reserve"
                className="focus-ring group flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-400 motion-reduce:transform-none"
              >
                <Phone className="size-4" />
              </a>
            </FooterStaggerItem>

            {/* LINKEDIN */}
            {/* <FooterStaggerItem>
              <a
                href={siteConfig.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tevuah Reserve on LinkedIn"
                className="focus-ring group flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-400 motion-reduce:transform-none"
              >
                <Linkedin className="size-4" />
              </a>
            </FooterStaggerItem> */}

            {/* INSTAGRAM */}
            {/* <FooterStaggerItem>
              <a
                href={siteConfig.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tevuah Reserve on Instagram"
                className="focus-ring group flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-400 motion-reduce:transform-none"
              >
                <Instagram className="size-4" />
              </a>
            </FooterStaggerItem> */}
          </FooterStagger>

          {/* CONTACT DETAILS */}
          <div className="mt-8 space-y-5 border-t border-white/10 pt-6">
            {/* PHONE NUMBER */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gold-400">
                <Phone className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/40">
                  Call our team
                </p>

                <a
                  href="tel:+447441905062"
                  className="focus-ring mt-1 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-gold-400"
                >
                  +44 7441905062
                  <ArrowUpRight className="size-3.5 text-gold-400" />
                </a>
              </div>
            </div>

            {/* OFFICE ADDRESS */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gold-400">
                <MapPin className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/40">
                  Our office
                </p>

                <address className="mt-1 max-w-xs text-sm leading-7 not-italic text-white/70">
                  20 Castle Terrace, Edinburgh EH1 2EE,
                  <span className="block">
                    United Kingdom
                  </span>
                </address>
              </div>
            </div>
          </div>
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
                Investments involve risk, including possible loss of capital. Information presented on the platform is provided for informational purposes and does not constitute an offer, recommendation or guarantee of investment performance.
              </p>
            </div>
          </FooterRevealSoft>
        </div>
      </Container>
    </footer>
  );
}