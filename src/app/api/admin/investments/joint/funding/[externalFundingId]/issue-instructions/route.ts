import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdmin } from "@/src/lib/auth/require-admin";
import { sendApplicationMail } from "@/src/lib/email/application-mailer";
import { investorJointPaymentInstructionsReadyEmail } from "@/src/lib/email/investment-emails";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    externalFundingId: string;
  }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RequestBody = {
  bankName?: string | null;
  beneficiaryName?: string | null;
  accountNumber?: string | null;
  routingNumber?: string | null;
  swiftCode?: string | null;
  iban?: string | null;
  bankAddress?: string | null;
  wireInstructions?: string | null;

  bitcoinAmount?: number | string | null;
  bitcoinAddress?: string | null;
  bitcoinNetwork?: string | null;
  bitcoinPaymentUrl?: string | null;
  bitcoinInstructions?: string | null;
};

function cleanOptionalText(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();

  return cleaned.length > 0
    ? cleaned
    : null;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { externalFundingId } =
      await context.params;

    if (
      !UUID_PATTERN.test(externalFundingId)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid external funding ID.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // 1. ADMIN AUTHENTICATION
    // ========================================================

    const adminUser =
      await requireAdmin();

    const adminActorId =
      adminUser.userId;

    // ========================================================
    // 2. READ REQUEST BODY
    //
    // Wire and Bitcoin requests provide admin-entered payment destination details.
    // ========================================================

    let body: RequestBody = {};

    try {
      const rawBody =
        await request.text();

      if (rawBody.trim()) {
        body = JSON.parse(rawBody);
      }
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const bankName =
      cleanOptionalText(
        body.bankName
      );

    const beneficiaryName =
      cleanOptionalText(
        body.beneficiaryName
      );

    const accountNumber =
      cleanOptionalText(
        body.accountNumber
      );

    const routingNumber =
      cleanOptionalText(
        body.routingNumber
      );

    const swiftCode =
      cleanOptionalText(
        body.swiftCode
      );

    const iban =
      cleanOptionalText(
        body.iban
      );

    const bankAddress =
      cleanOptionalText(
        body.bankAddress
      );

    const wireInstructions =
      cleanOptionalText(
        body.wireInstructions
      );

    const bitcoinAddress =
      cleanOptionalText(
        body.bitcoinAddress
      );

    const bitcoinNetwork =
      cleanOptionalText(
        body.bitcoinNetwork
      );

    const bitcoinPaymentUrl =
      cleanOptionalText(
        body.bitcoinPaymentUrl
      );

    const bitcoinInstructions =
      cleanOptionalText(
        body.bitcoinInstructions
      );

    let bitcoinAmount:
      | number
      | null = null;

    if (
      body.bitcoinAmount !== undefined &&
      body.bitcoinAmount !== null &&
      body.bitcoinAmount !== ""
    ) {
      const parsed =
        Number(body.bitcoinAmount);

      if (
        !Number.isFinite(parsed) ||
        parsed <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Bitcoin amount must be greater than zero.",
          },
          { status: 400 }
        );
      }

      bitcoinAmount = parsed;
    }

    // ========================================================
    // 3. AUTH-BOUND DATABASE RPC
    //
    // IMPORTANT:
    // The RPC checks auth.uid(), therefore this MUST use
    // the authenticated SSR client.
    // ========================================================

    const supabase =
      await createClient();

   const {
  data,
  error,
} = await supabase.rpc(
  "issue_joint_investment_payment_instructions",
  {
    p_external_funding_id:
      externalFundingId,

    p_admin_id:
      adminActorId,

    p_bank_name:
      bankName,

    p_beneficiary_name:
      beneficiaryName,

    p_account_number:
      accountNumber,

    p_routing_number:
      routingNumber,

    p_swift_code:
      swiftCode,

    p_iban:
      iban,

    p_bank_address:
      bankAddress,

    p_wire_instructions:
      wireInstructions,

    p_bitcoin_amount:
      bitcoinAmount,

    p_bitcoin_address:
      bitcoinAddress,

    p_bitcoin_network:
      bitcoinNetwork,

    p_bitcoin_payment_url:
      bitcoinPaymentUrl,

    p_bitcoin_instructions:
      bitcoinInstructions,
  }
);

    if (error) {
      console.error(
        "Joint payment instruction issuance failed:",
        {
          externalFundingId,
          adminActorId,
          code: error.code,
          message: error.message,
        }
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to issue payment instructions.",
        },
        { status: 400 }
      );
    }

    const result =
      data?.[0];

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Payment instruction issuance returned no result.",
        },
        { status: 500 }
      );
    }

    // ========================================================
    // 4. POST-COMMIT EMAIL ENRICHMENT
    //
    // Service-role access begins only AFTER the controlled
    // database mutation has succeeded.
    // ========================================================

    let investorEmailSent = false;

    try {
      const admin =
        createAdminClient();

      const {
        data: funding,
        error: fundingError,
      } = await admin
        .from(
          "joint_investment_external_funding"
        )
        .select(`
          id,
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
          instructions
        `)
        .eq(
          "id",
          externalFundingId
        )
        .single();

      if (fundingError || !funding) {
        throw new Error(
          fundingError?.message ||
            "Unable to load issued payment instructions."
        );
      }

      const {
        data: authUserData,
        error: authUserError,
      } =
        await admin.auth.admin.getUserById(
          funding.investor_id
        );

      if (authUserError) {
        throw authUserError;
      }

      const investorEmail =
        authUserData.user?.email?.trim();

      if (!investorEmail) {
        throw new Error(
          "Investor email address is unavailable."
        );
      }

      const [
        profileResult,
        opportunityResult,
      ] = await Promise.all([
        admin
          .from("profiles")
          .select(
            "first_name, last_name"
          )
          .eq(
            "id",
            funding.investor_id
          )
          .single(),

        admin
          .from(
            "investment_opportunities"
          )
          .select("title")
          .eq(
            "id",
            funding.opportunity_id
          )
          .single(),
      ]);

      if (
        profileResult.error ||
        !profileResult.data
      ) {
        throw new Error(
          profileResult.error?.message ||
            "Investor profile unavailable."
        );
      }

      if (
        opportunityResult.error ||
        !opportunityResult.data
      ) {
        throw new Error(
          opportunityResult.error?.message ||
            "Investment opportunity unavailable."
        );
      }

      const investorName =
        [
          profileResult.data.first_name,
          profileResult.data.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        "Investor";

      // ======================================================
      // 5. EXISTING BRANDED EMAIL TEMPLATE
      //
      // Feed the canonical issued funding snapshot into the
      // same template architecture already used for Wire.
      // ======================================================
      
 const email =
  investorJointPaymentInstructionsReadyEmail(
    {
      investorName,

      opportunityTitle:
        opportunityResult.data.title,

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
        result.joint_subscription_id,

      externalFundingId:
        result.external_funding_id,

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

      const delivery =
        await sendApplicationMail({
          to: investorEmail,
          subject: email.subject,
          text: email.text,
          html: email.html,
        });

      investorEmailSent =
        delivery.sent;

      if (!delivery.sent) {
        console.error(
          "Joint payment instructions email failed:",
          {
            externalFundingId,
            investorId:
              funding.investor_id,
            error:
              delivery.error,
          }
        );
      }
    } catch (emailError) {
      // ------------------------------------------------------
      // Email failure MUST NOT roll back successfully issued
      // database instructions.
      // ------------------------------------------------------

      console.error(
        "Unable to send joint payment instructions email:",
        {
          externalFundingId,
          error:
            emailError instanceof Error
              ? emailError.message
              : emailError,
        }
      );
    }

    // ========================================================
    // 6. RESPONSE
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        fundingInstructions: {
          id:
            result.external_funding_id,

          jointSubscriptionId:
            result.joint_subscription_id,

          fundingObligationId:
            result.funding_obligation_id,

          investorId:
            result.investor_id,

          paymentMethod:
            result.payment_method,

          principalAmountCents:
            result.principal_amount_cents,

          wireChargeAmountCents:
            result.wire_charge_amount_cents,

          totalAmountDueCents:
            result.total_amount_due_cents,

          paymentReference:
            result.payment_reference,

          status:
            result.funding_status,

          instructionsIssuedAt:
            result.instructions_issued_at,
        },

        investorEmailSent,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected joint payment instruction issuance error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to issue payment instructions.",
      },
      { status: 500 }
    );
  }
}