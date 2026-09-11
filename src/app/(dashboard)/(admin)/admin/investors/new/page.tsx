import {
  CreateInvestorForm,
} from "@/src/components/admin/investors/create-investor-form";

import {
  requireAdmin,
} from "@/src/lib/auth/require-admin";

export const dynamic =
  "force-dynamic";

export default async function AdminNewInvestorPage() {
  await requireAdmin();

  return (
    <CreateInvestorForm />
  );
}