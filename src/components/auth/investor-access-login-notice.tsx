import {
  ShieldCheck,
} from "lucide-react";

export function InvestorAccessLoginNotice() {
  return (
    <div className="rounded-2xl border border-forest-900/10 bg-ivory-50 p-4">
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-700" />

        <p className="text-xs leading-6 text-stone-600">
          Investor access is available to clients invited by Tevuah Reserve.
          If you are interested in our investment opportunities, contact our
          team for an investment consultation.
        </p>
      </div>
    </div>
  );
}