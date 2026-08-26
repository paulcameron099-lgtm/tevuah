import {
  NextResponse,
} from "next/server";

import { getCurrentUser } from "@/src/lib/auth/get-current-user";
import { createAdminClient } from "@/src/lib/supabase/admin";

type Payload = {
  opportunityId?: string;

  paymentMethod?: string;

  bankName?: string;

  beneficiaryName?: string;

  accountNumber?: string | null;

  routingNumber?: string | null;

  swiftCode?: string | null;

  iban?: string | null;

  bankAddress?: string | null;

  paymentReferencePrefix?: string;

  instructions?: string | null;

  status?:
    | "active"
    | "inactive";
};

export async function PUT(
  request: Request,
) {
  try {
    const user =
      await getCurrentUser();

    if (
      !user ||
      (
        user.role !==
          "admin" &&
        user.role !==
          "super_admin"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator access required.",
        },
        {
          status: 403,
        },
      );
    }

    const body =
      (await request.json()) as Payload;

    const opportunityId =
      body.opportunityId?.trim();

    if (!opportunityId) {
      return NextResponse.json(
        {
          error:
            "Opportunity ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const bankName =
      body.bankName?.trim() ??
      "";

    const beneficiaryName =
      body.beneficiaryName?.trim() ??
      "";

    const prefix =
      body.paymentReferencePrefix
        ?.trim()
        .toUpperCase() ??
      "";

    if (!bankName) {
      return NextResponse.json(
        {
          error:
            "Bank name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!beneficiaryName) {
      return NextResponse.json(
        {
          error:
            "Beneficiary name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !body.accountNumber?.trim() &&
      !body.iban?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Enter either an account number or IBAN.",
        },
        {
          status: 400,
        },
      );
    }

    if (!prefix) {
      return NextResponse.json(
        {
          error:
            "Payment reference prefix is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.status !==
        "active" &&
      body.status !==
        "inactive"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid funding instruction status.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    const {
      data: opportunity,
      error:
        opportunityError,
    } = await admin
      .from(
        "investment_opportunities",
      )
      .select(
        `
        id
        `,
      )
      .eq(
        "id",
        opportunityId,
      )
      .maybeSingle();

    if (
      opportunityError ||
      !opportunity
    ) {
      return NextResponse.json(
        {
          error:
            "Investment opportunity could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    const now =
      new Date().toISOString();

    const {
      data,
      error,
    } = await admin
      .from(
        "investment_funding_instructions",
      )
      .upsert(
        {
          opportunity_id:
            opportunityId,

          payment_method:
            body.paymentMethod?.trim() ||
            "bank_transfer",

          bank_name:
            bankName,

          beneficiary_name:
            beneficiaryName,

          account_number:
            body.accountNumber?.trim() ||
            null,

          routing_number:
            body.routingNumber?.trim() ||
            null,

          swift_code:
            body.swiftCode?.trim() ||
            null,

          iban:
            body.iban?.trim() ||
            null,

          bank_address:
            body.bankAddress?.trim() ||
            null,

          payment_reference_prefix:
            prefix,

          instructions:
            body.instructions?.trim() ||
            null,

          status:
            body.status,

          updated_by:
            user.id,

          updated_at:
            now,
        },
        {
          onConflict:
            "opportunity_id",
        },
      )
      .select(
        `
        id,
        opportunity_id,
        status,
        updated_at
        `,
      )
      .single();

    if (error) {
      console.error(
        "Funding instructions save error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to save funding instructions.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,

      fundingInstructions:
        data,
    });
  } catch (error) {
    console.error(
      "Funding instructions API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save funding instructions.",
      },
      {
        status: 500,
      },
    );
  }
}