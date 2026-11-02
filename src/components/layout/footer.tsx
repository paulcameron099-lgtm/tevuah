
import Link from "next/link";
import Image from "next/image";

import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  ShieldAlert,
  Building2,
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

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="overflow-hidden bg-forest-950 text-white">
      <Container>
        {/* ==========================================
            BRAND + NAVIGATION
        ========================================== */}

        <div className="grid gap-12 border-b border-white/10 py-16 sm:py-20 lg:grid-cols-[1.2fr_2fr] lg:gap-20 lg:py-24">

          {/* BRAND + CONTACT */}
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
              </div>
            </Link>

            {/* BRAND DESCRIPTION */}
            <p className="mt-7 max-w-sm text-sm leading-7 text-white/60">
              Connecting investors with carefully considered
              opportunities across vineyard estates, olive
              agriculture, AgTech and fine wine.
            </p>

            {/* CONTACT ICONS */}
            <FooterStagger className="mt-8 flex flex-wrap items-center gap-3">

              <FooterStaggerItem>
                <a
                  href={`mailto:${siteConfig.email}`}
                  aria-label="Email Tevuah Reserve"
                  className="focus-ring flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-400 motion-reduce:transform-none"
                >
                  <Mail className="size-4" />
                </a>
              </FooterStaggerItem>

              <FooterStaggerItem>
                <a
                  href="tel:+447441905062"
                  aria-label="Call Tevuah Reserve"
                  className="focus-ring flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-400 motion-reduce:transform-none"
                >
                  <Phone className="size-4" />
                </a>
              </FooterStaggerItem>

            </FooterStagger>

            {/* CONTACT DETAILS */}
            <div className="mt-8 space-y-5 border-t border-white/10 pt-6">

              {/* PHONE */}
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

              
              
            </div>
          </FooterReveal>

          {/* FOOTER NAVIGATION */}
          <FooterStagger className="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-4">
            {footerNavigation.map((group) => (
              <FooterStaggerItem key={group.title}>
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
            INVESTMENT & REGULATORY DISCLOSURE
        ========================================== */}

        <section
          aria-labelledby="footer-disclosure-heading"
          className="border-b border-white/10 py-10 sm:py-12 lg:py-14"
        >
          <FooterRevealSoft>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)] lg:gap-14">

              {/* INVESTMENT DISCLOSURE */}
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-400">
                    <ShieldAlert className="size-5" />
                  </span>

                  <div>

                    <h2
                      id="footer-disclosure-heading"
                      className="mt-1 font-display text-lg font-medium tracking-tight text-white sm:text-xl"
                    >
                      Investment & Regulatory Disclosure
                    </h2>
                  </div>
                </div>

                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/60">
                  Wine investments should be both profitable and
                  enjoyable but as with any form of trading in
                  commodities, risks will be involved and wine
                  is no exception. The value of investments in
                  fine wine, vineyard estates, olive estates and
                  agricultural technology may rise or fall, and
                  investors may not recover the full amount
                  invested. The wine market in the UK is not
                  subject to regulation of the Financial
                  Conduct Authority.
                </p>
              </div>

              {/* COMPANY REGISTRATION */}
              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
                

                <p className="mt-5 text-sm leading-7 text-white/65">
                  Tevuah Reserve® is registered in Scotland
                  under company registration number{" "}
                  <span className="font-semibold text-white/85">
                    SC164835
                  </span>.
                </p>

                <div className="mt-5 border-t border-white/10 pt-5">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-gold-400">
                    Registered Office
                  </p>

                  <address className="mt-2 text-sm leading-7 not-italic text-white/65">
                    20 Castle Terrace,
                    Edinburgh EH1 2EE,
                    <br />
                    United Kingdom.
                  </address>
                </div>
              </div>
            </div>
          </FooterRevealSoft>
        </section>

        {/* ==========================================
            COPYRIGHT
        ========================================== */}

        <div className="py-7 sm:py-8">
          <FooterRevealSoft>
            <div className="flex flex-col gap-3 text-xs leading-6 text-white/40 sm:flex-row sm:items-center sm:justify-between">
              <p>
                © {currentYear} Tevuah Reserve.
                All Rights Reserved.
              </p>

              <p className="text-white/35">
                Cultivated assets. Considered investment.
              </p>
            </div>
          </FooterRevealSoft>
        </div>
      </Container>
    </footer>
  );
}
