import Link from "next/link";

import {
  Banknote,
  ArrowRight,
} from "lucide-react";

type AdminInvestorCashAccountButtonProps = {
  investorId: string;
};

export function AdminInvestorCashAccountButton({
  investorId,
}: AdminInvestorCashAccountButtonProps) {
  return (
    <Link
      href={`/admin/investors/${investorId}/cash-account`}
      className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-900"
    >
      <Banknote className="size-4" />
      Cash Account
      <ArrowRight className="size-4" />
    </Link>
  );
}
