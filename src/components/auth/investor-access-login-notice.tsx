import {
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";

export function InvestorAccessLoginNotice() {
  return (
    <div className="rounded-2xl border border-forest-900/10 bg-ivory-50 p-4">
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-700" />

        <p className="text-xs leading-6 text-stone-600">
          New to Tevuah Reserve?
          Investor accounts are available by invitation. To learn more about accessing Tevuah Reserve, contact our team.
        </p>
        <Link
          href="/contact"
          className="text-sm font-semibold text-forest-950 underline-offset-4 hover:underline"
        >
          Contact our team
        </Link>
      </div>
    </div>
  );
}