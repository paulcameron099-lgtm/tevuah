
  import { NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type PreferencesPayload = {
  investmentUpdates?: boolean;
  paymentUpdates?: boolean;
  distributionUpdates?: boolean;
  statementUpdates?: boolean;
  complianceUpdates?: boolean;
  marketingUpdates?: boolean;
};

export async function PATCH(
  request: Request,
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      user.role !==
      "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "Forbidden.",
        },
        {
          status: 403,
        },
      );
    }

    const body =
      (await request.json()) as PreferencesPayload;

    const admin =
      createAdminClient();

    const {
      error,
    } = await admin
      .from(
        "investor_notification_preferences",
      )
      .upsert(
        {
          investor_id:
            user.id,

          investment_updates:
            body.investmentUpdates ??
            true,

          payment_updates:
            body.paymentUpdates ??
            true,

          distribution_updates:
            body.distributionUpdates ??
            true,

          statement_updates:
            body.statementUpdates ??
            true,

          compliance_updates:
            body.complianceUpdates ??
            true,

          marketing_updates:
            body.marketingUpdates ??
            false,

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "investor_id",
        },
      );

    if (error) {
      console.error(
        "Investor notification preferences update error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to update notification preferences.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Investor notification preferences API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to update notification preferences.",
      },
      {
        status: 500,
      },
    );
  }
}