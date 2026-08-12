import Image from "next/image";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  description: string;
};

export function AuthShell({
  children,
  title,
  description,
}: AuthShellProps) {
  return (
    <section className="bg-ivory-100 px-4 pb-14 pt-33 sm:px-6 sm:pb-16 sm:pt-37 lg:px-8 lg:pb-20 lg:pt-42">
      <div className="mx-auto grid w-full max-w-360 overflow-hidden rounded-4xl border border-forest-900/10 bg-white shadow-[0_24px_80px_rgba(10,23,18,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left image */}
        <div className="relative hidden min-h-190 overflow-hidden bg-forest-950 lg:block">
          <Image
            src="/images/auth/auth-vineyard.jpg"
            alt="Vineyard landscape"
            fill
            priority
            sizes="45vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-linear-to-b from-forest-950/35 via-forest-950/40 to-forest-950/90" />

          <div className="relative z-10 flex h-full min-h-190 flex-col justify-between p-10 xl:p-14">
            <div>
              <p className="font-display text-2xl font-semibold text-white">
                Tevuah Reserve
              </p>

              <p className="mt-3 max-w-sm text-sm leading-7 text-white/65">
                Access a considered approach to real assets,
                productive estates and fine wine.
              </p>
            </div>

            <div className="max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Private investment platform
              </p>

              <h2 className="font-display mt-5 text-4xl leading-[1.05] font-medium tracking-[-0.04em] text-white xl:text-5xl">
                Invest with a longer view.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
                Discover vineyards, olive estates,
                agricultural technology and fine-wine
                opportunities through one considered
                investment experience.
              </p>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="flex items-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14 xl:px-16">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-9 lg:hidden">
              <p className="font-display text-2xl font-semibold text-forest-950">
                Tevuah Reserve
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                Investor access
              </p>

              <h1 className="font-display mt-4 text-4xl font-medium tracking-[-0.035em] text-forest-950 sm:text-5xl">
                {title}
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-stone-600">
                {description}
              </p>
            </div>

            <div className="mt-9">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}