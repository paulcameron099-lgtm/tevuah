import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { Container } from "@/src/components/ui/container";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderPage({
  eyebrow,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <main className="min-h-[80vh] bg-ivory-100 pt-19 lg:pt-22">
      <section className="py-20 sm:py-28 lg:py-36">
        <Container>
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
              {eyebrow}
            </p>

            <h1 className="font-display mt-6 text-balance text-5xl leading-[0.98] font-medium tracking-[-0.04em] text-forest-950 sm:text-6xl lg:text-8xl">
              {title}
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
              {description}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/"
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-forest-900/15 px-6 text-sm font-semibold text-forest-950 transition hover:bg-white"
              >
                <ArrowLeft className="size-4" />
                Return home
              </Link>

              <Link
                href="/investments"
                className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest-950 px-6 text-sm font-semibold text-white transition hover:bg-forest-800 hover:text-white"
              >
                Explore investments
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}