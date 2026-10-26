
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function InvestorAccessLoginNotice() {
  return (
    <div className="overflow-hidden rounded-2xl border border-forest-900/10 bg-ivory-50 p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-4">
        {/* SECURITY ICON */}
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-gold-600/15 bg-gold-500/10">
          <ShieldCheck className="size-5 text-gold-700" />
        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold tracking-[-0.01em] text-forest-950 sm:text-base">
            New to Tevuah Reserve?
          </h3>

          <p className="mt-2 max-w-xl text-sm leading-7 text-stone-600">
            Investor accounts are available by invitation.
            To learn more about accessing Tevuah Reserve,
            connect with our team for further information.
          </p>

          {/* CONTACT BUTTON */}
          <Link
            href="/contact"
            className="focus-ring group mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest-950 px-6 py-3 text-center text-sm font-semibold text-white shadow-[0_8px_24px_rgba(10,23,18,0.12)] transition-all duration-300 hover:bg-forest-800 hover:shadow-[0_12px_30px_rgba(10,23,18,0.18)] active:scale-[0.98] motion-reduce:transform-none sm:w-fit"
          >
            Contact our team

            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </Link>
        </div>
      </div>
    </div>
  );
}
