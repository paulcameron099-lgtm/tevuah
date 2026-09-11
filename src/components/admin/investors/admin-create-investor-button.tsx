import {
  UserPlus,
} from "lucide-react";

import Link from "next/link";

export function AdminCreateInvestorButton() {
  return (
    <Link
      href="/admin/investors/new"
      className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest-950 px-5 text-sm font-semibold text-white transition hover:bg-forest-800"
    >
      <UserPlus className="size-4" />
      Create Investor
    </Link>
  );
}
