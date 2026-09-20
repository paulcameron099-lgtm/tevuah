import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdmin } from "@/src/lib/auth/require-admin";
import { sendApplicationMail } from "@/src/lib/email/application-mailer";
import { investorJointPaymentInstructionsReadyEmail } from "@/src/lib/email/investment-emails";
import { createAdminClient } from "@/src/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

type RouteContext = {
  params: Promise<{
    externalFundingId: string;
  }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    // ========================================================
    // 1. ADMIN AUTHENTICATION
    // ========================================================

    await requireAdmin();

    const {
      externalFundingId,
    } = await context.params;

    if (
      !UUID_PATTERN.test(
        externalFundingId,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid external funding ID.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    // ========================================================
    // 2. LOAD ALREADY-ISSUED FUNDING RECORD
    //
    // READ ONLY.
    // No issuance RPC.
    // No financial mutation.
    // ========================================================

    const {
      data: funding,
      error: fundingError,
    } = await admin
      .from(
        "joint_investment_external_funding",
      )
      .select(`
        id,
        joint_subscription_id,
        funding_obligation_id,
        investor_id,
        opportunity_id,

        payment_method,

        principal_amount_cents,
        wire_charge_amount_cents,
        total_amount_due_cents,

        payment_reference,

        bank_name,
        beneficiary_name,
        account_number,
        routing_number,
        swift_code,
        iban,
        bank_address,

        bitcoin_amount,
        bitcoin_address,
        bitcoin_payment_url,
        bitcoin_network,

        instructions,

        status,
        instructions_issued_at
      `)
      .eq(
        "id",
        externalFundingId,
      )
      .maybeSingle();

    if (
      fundingError ||
      !funding
    ) {
      console.error(
        "Joint funding lookup failed:",
        fundingError,
      );

      return NextResponse.json(
        {
          error:
            "Joint funding record not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // 3. RESEND IS ONLY FOR ALREADY-ISSUED INSTRUCTIONS
    // ========================================================

    const allowedStatuses =
      new Set([
        "instructions_issued",
        "payment_reported",
        "pending_verification",
        "verified",
      ]);

    if (
      !allowedStatuses.has(
        funding.status,
      )
    ) {
      return NextResponse.json(
        {
          error:
            `Payment instructions cannot be resent while funding status is ${funding.status}.`,
        },
        {
          status: 409,
        },
      );
    }

    if (
      !funding.instructions_issued_at
    ) {
      return NextResponse.json(
        {
          error:
            "Payment instructions have not been issued.",
        },
        {
          status: 409,
        },
      );
    }

    // ========================================================
    // 4. VERIFY METHOD-SPECIFIC SNAPSHOT
    // ========================================================

    if (
      funding.payment_method ===
      "bitcoin"
    ) {
      if (
        funding.bitcoin_amount == null ||
        !funding.bitcoin_address ||
        !funding.bitcoin_network
      ) {
        return NextResponse.json(
          {
            error:
              "Stored Bitcoin payment instructions are incomplete.",
          },
          {
            status: 409,
          },
        );
      }

      if (
        Number(
          funding.wire_charge_amount_cents,
        ) !== 0
      ) {
        return NextResponse.json(
          {
            error:
              "Bitcoin funding record contains an invalid Wire Transfer charge.",
          },
          {
            status: 409,
          },
        );
      }
    } else if (
      funding.payment_method ===
      "wire_transfer"
    ) {
      if (
        !funding.bank_name ||
        !funding.beneficiary_name ||
        !funding.account_number
      ) {
        return NextResponse.json(
          {
            error:
              "Stored Wire Transfer instructions are incomplete.",
          },
          {
            status: 409,
          },
        );
      }
    } else {
      return NextResponse.json(
        {
          error:
            "Unsupported payment method.",
        },
        {
          status: 409,
        },
      );
    }

    // ========================================================
    // 5. LOAD INVESTOR EMAIL + PROFILE + OPPORTUNITY
    // ========================================================

    const [
      authResult,
      profileResult,
      opportunityResult,
    ] = await Promise.all([
      admin.auth.admin.getUserById(
        funding.investor_id,
      ),

      admin
        .from("profiles")
        .select(
          "first_name, last_name",
        )
        .eq(
          "id",
          funding.investor_id,
        )
        .maybeSingle(),

      admin
        .from(
          "investment_opportunities",
        )
        .select(
          "id, title",
        )
        .eq(
          "id",
          funding.opportunity_id,
        )
        .maybeSingle(),
    ]);

    if (
      authResult.error
    ) {
      console.error(
        "Investor Auth lookup failed:",
        authResult.error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load investor email address.",
        },
        {
          status: 500,
        },
      );
    }

    const investorEmail =
      authResult.data.user?.email
        ?.trim();

    if (!investorEmail) {
      return NextResponse.json(
        {
          error:
            "Investor email address is unavailable.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      profileResult.error ||
      !profileResult.data
    ) {
      return NextResponse.json(
        {
          error:
            "Investor profile is unavailable.",
        },
        {
          status: 500,
        },
      );
    }

    if (
      opportunityResult.error ||
      !opportunityResult.data
    ) {
      return NextResponse.json(
        {
          error:
            "Investment opportunity is unavailable.",
        },
        {
          status: 500,
        },
      );
    }

    const investorName =
      [
        profileResult.data
          .first_name,

        profileResult.data
          .last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Investor";

    // ========================================================
    // 6. BUILD EMAIL FROM STORED CANONICAL SNAPSHOT
    // ========================================================

    const email =
      investorJointPaymentInstructionsReadyEmail(
        {
          investorName,

          opportunityTitle:
            opportunityResult.data
              .title,

          paymentMethod:
            funding.payment_method,

          principalAmountCents:
            Number(
              funding.principal_amount_cents,
            ),

          wireChargeAmountCents:
            Number(
              funding.wire_charge_amount_cents,
            ),

          totalAmountDueCents:
            Number(
              funding.total_amount_due_cents,
            ),

          paymentReference:
            funding.payment_reference,

          jointSubscriptionId:
            funding.joint_subscription_id,

          externalFundingId:
            funding.id,

          bitcoinAmount:
            funding.bitcoin_amount,

          bitcoinAddress:
            funding.bitcoin_address,

          bitcoinNetwork:
            funding.bitcoin_network,

          bitcoinPaymentUrl:
            funding.bitcoin_payment_url,

          instructions:
            funding.instructions,

          origin:
            new URL(
              request.url,
            ).origin,
        },
      );

    // ========================================================
    // 7. SEND ONLY — NO DATABASE MUTATION
    // ========================================================

    const delivery =
      await sendApplicationMail({
        to:
          investorEmail,

        ...email,
      });

    if (
      !delivery.sent
    ) {
      console.error(
        "Joint payment instruction resend failed:",
        {
          externalFundingId,
          investorId:
            funding.investor_id,
          error:
            delivery.error,
        },
      );

      return NextResponse.json(
        {
          success: false,

          error:
            delivery.error ||
            "Email delivery failed.",

          fundingStatus:
            funding.status,
        },
        {
          status: 502,
        },
      );
    }

    // ========================================================
    // 8. SUCCESS
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        externalFundingId:
          funding.id,

        jointSubscriptionId:
          funding.joint_subscription_id,

        paymentMethod:
          funding.payment_method,

        fundingStatus:
          funding.status,

        emailSent: true,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Unexpected joint instruction email resend error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to resend payment instructions email.",
      },
      {
        status: 500,
      },
    );
  }
}