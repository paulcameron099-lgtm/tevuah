import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

import {
  VerifyRecoveryForm,
} from "@/src/components/auth/verify-recovery-form";

export const metadata: Metadata = {
  title:
    "Verify Password Recovery | Tevuah Reserve",

  description:
    "Verify your Tevuah Reserve password recovery request.",

  robots: {
    index: false,
    follow: false,
  },
};

type VerifyRecoveryPageProps = {
  searchParams: Promise<{
    email?: string | string[];
  }>;
};

export default async function VerifyRecoveryPage({
  searchParams,
}: VerifyRecoveryPageProps) {
  const params =
    await searchParams;

  const emailParam =
    Array.isArray(params.email)
      ? params.email[0]
      : params.email;

  const email =
    emailParam
      ?.trim()
      .toLowerCase() ??
    "";

  return (
    <main className="min-h-screen bg-ivory-50">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(194,162,102,0.14),transparent_34%),linear-gradient(180deg,#f7f3ea_0%,#ffffff_55%,#f7f3ea_100%)]" />

        <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-16 sm:px-8 lg:px-12">
          <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.72fr)] lg:items-center lg:gap-20">
            {/* Left content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-forest-900/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-forest-900 shadow-sm backdrop-blur">
                <ShieldCheck className="size-4 text-gold-700" />

                Secure account recovery
              </div>

              <h1 className="mt-7 max-w-xl font-serif text-4xl font-medium leading-[1.08] tracking-[-0.035em] text-forest-950 sm:text-5xl lg:text-6xl">
                Verify your
                password recovery.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-stone-600 sm:text-lg">
                Enter the verification code sent to
                your email address. Once verified,
                you&apos;ll be able to choose a new
                password for your Tevuah Reserve
                account.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-forest-900/10 bg-white/65 p-5 backdrop-blur">
                  <KeyRound className="size-5 text-gold-700" />

                  <h2 className="mt-4 text-sm font-semibold text-forest-950">
                    One-time verification
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    The recovery code can only be
                    used to continue the secure
                    password-reset process.
                  </p>
                </div>

                <div className="rounded-2xl border border-forest-900/10 bg-white/65 p-5 backdrop-blur">
                  <ShieldCheck className="size-5 text-gold-700" />

                  <h2 className="mt-4 text-sm font-semibold text-forest-950">
                    Protected reset
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Your password cannot be changed
                    until the recovery request has
                    been successfully verified.
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="focus-ring mt-10 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-forest-950 underline-offset-4 hover:underline"
              >
                <ArrowLeft className="size-4" />
                Return to sign in
              </Link>
            </div>

            {/* Verification card */}
            <div className="rounded-[28px] border border-forest-900/10 bg-white p-6 shadow-[0_24px_80px_rgba(19,42,34,0.10)] sm:p-8 lg:p-10">
              <div className="border-b border-forest-900/10 pb-7">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
                  Tevuah Reserve
                </div>

                <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-forest-950">
                  Enter verification code
                </h2>

                <p className="mt-3 text-sm leading-6 text-stone-600">
                  Use the code contained in your
                  password recovery email.
                </p>
              </div>

              <div className="pt-7">
                <VerifyRecoveryForm
                  initialEmail={email}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}