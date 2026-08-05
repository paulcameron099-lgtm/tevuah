import Image from "next/image";
import {
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Container } from "@/src/components/ui/container";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-forest-950 text-white">
      <div className="absolute inset-0">
        <Image
          src="/images/sections/final-cta-vineyard.jpg"
          alt="Vineyard landscape representing long-term cultivated investment"
          fill
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-forest-950/72" />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,23,18,0.95)_0%,rgba(10,23,18,0.78)_45%,rgba(10,23,18,0.4)_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(194,162,102,0.17),transparent_35%)]" />
      </div>

      <Container className="relative z-10 py-24 sm:py-28 lg:py-36">
        <div className="max-w-5xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gold-400" />

            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">
              Begin your journey
            </p>
          </div>

          <h2 className="font-display mt-7 max-w-4xl text-balance text-5xl leading-[0.94] font-medium tracking-[-0.045em] sm:text-6xl lg:text-8xl">
            Let your capital take root.
          </h2>

          <p className="mt-8 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
            Discover a premium investment experience built around cultivated
            land, agricultural intelligence, fine wine and long-term
            transparency.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/investments" size="lg">
              Explore opportunities
              <ArrowUpRight className="size-4" />
            </Button>

            <Button
              href="/register"
              variant="outline"
              size="lg"
              className="border-white/25 text-white hover:bg-white/10 hover:text-white"
            >
              Create investor account
            </Button>
          </div>

          <div className="mt-12 flex max-w-2xl items-start gap-3 border-t border-white/15 pt-7">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-400" />

            <p className="text-xs leading-6 text-white/45">
              Registration does not constitute an investment commitment.
              Access to genuine opportunities may require identity,
              eligibility, suitability and source-of-funds verification.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}