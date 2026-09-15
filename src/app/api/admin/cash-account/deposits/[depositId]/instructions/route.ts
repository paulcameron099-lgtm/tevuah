import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";
import {
  sendApplicationMail,
} from "@/src/lib/email/application-mailer";
import {
  investorCashDepositInstructionsEmail,
} from "@/src/lib/email/investment-emails";
import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    depositId: string;
  }>;
};

type Body = {
  bankName?: string;
  beneficiaryName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  bankAddress?: string;
  paymentReference?: string;

  bitcoinAmount?: string;
  bitcoinAddress?: string;
  bitcoinPaymentUrl?: string;
  bitcoinNetwork?: string;

  instructions?: string;
};

function clean(
  value: unknown,
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

export async function PUT(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    const adminUser =
      await getCurrentUser();

    if (
      !adminUser ||
      (
        adminUser.role !==
          "admin" &&
        adminUser.role !==
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

    const {
      depositId,
    } = await params;

    const admin =
      createAdminClient();

    const {
      data: deposit,
      error: depositError,
    } = await admin
      .from(
        "cash_account_deposit_requests",
      )
      .select("*")
      .eq(
        "id",
        depositId,
      )
      .maybeSingle();

    if (
      depositError ||
      !deposit
    ) {
      return NextResponse.json(
        {
          error:
            "Cash Account funding request could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      [
        "verified",
        "cancelled",
      ].includes(
        String(
          deposit.status,
        ),
      )
    ) {
      return NextResponse.json(
        {
          error:
            "This funding request is already closed.",
        },
        {
          status: 409,
        },
      );
    }

    const body =
      (await request.json()) as Body;

    const paymentMethod =
      String(
        deposit.payment_method,
      );

    const update:
      Record<string, unknown> = {
        updated_at:
          new Date().toISOString(),

        status:
          "awaiting_payment",

        instructions:
          clean(
            body.instructions,
          ) ||
          null,

        instructions_sent_at:
          new Date().toISOString(),

        instructions_sent_by:
          adminUser.id,

        rejection_reason:
          null,
      };

    if (
      paymentMethod ===
      "wire_transfer"
    ) {
      const bankName =
        clean(
          body.bankName,
        );

      const beneficiaryName =
        clean(
          body.beneficiaryName,
        );

      const accountNumber =
        clean(
          body.accountNumber,
        );

      const iban =
        clean(
          body.iban,
        );

      if (
        !bankName ||
        !beneficiaryName ||
        (
          !accountNumber &&
          !iban
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Wire instructions require bank name, beneficiary name, and account number or IBAN.",
          },
          {
            status: 400,
          },
        );
      }

      Object.assign(
        update,
        {
          bank_name:
            bankName,
          beneficiary_name:
            beneficiaryName,
          account_number:
            accountNumber ||
            null,
          routing_number:
            clean(
              body.routingNumber,
            ) ||
            null,
          swift_code:
            clean(
              body.swiftCode,
            ) ||
            null,
          iban:
            iban ||
            null,
          bank_address:
            clean(
              body.bankAddress,
            ) ||
            null,
          payment_reference:
            clean(
              body.paymentReference,
            ) ||
            `CASH-${deposit.id.slice(0, 8).toUpperCase()}`,

          bitcoin_amount:
            null,
          bitcoin_address:
            null,
          bitcoin_payment_url:
            null,
        },
      );
    } else if (
      paymentMethod ===
      "bitcoin"
    ) {
      const bitcoinAmount =
        clean(
          body.bitcoinAmount,
        );

      const bitcoinAddress =
        clean(
          body.bitcoinAddress,
        );

      const numericAmount =
        Number(
          bitcoinAmount,
        );

      if (
        !Number.isFinite(
          numericAmount,
        ) ||
        numericAmount <= 0 ||
        !bitcoinAddress
      ) {
        return NextResponse.json(
          {
            error:
              "Bitcoin instructions require the exact BTC amount and receiving address.",
          },
          {
            status: 400,
          },
        );
      }

      Object.assign(
        update,
        {
          bitcoin_amount:
            bitcoinAmount,
          bitcoin_address:
            bitcoinAddress,
          bitcoin_payment_url:
            clean(
              body.bitcoinPaymentUrl,
            ) ||
            null,
          bitcoin_network:
            clean(
              body.bitcoinNetwork,
            ) ||
            "Bitcoin",

          bank_name:
            null,
          beneficiary_name:
            null,
          account_number:
            null,
          routing_number:
            null,
          swift_code:
            null,
          iban:
            null,
          bank_address:
            null,
          payment_reference:
            null,
        },
      );
    } else {
      return NextResponse.json(
        {
          error:
            "Unsupported payment method.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: updatedDeposit,
      error: updateError,
    } = await admin
      .from(
        "cash_account_deposit_requests",
      )
      .update(
        update,
      )
      .eq(
        "id",
        deposit.id,
      )
      .select("*")
      .single();

    if (
      updateError
    ) {
      console.error(
        "Cash deposit instructions save error:",
        updateError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to save Cash Account funding instructions.",
        },
        {
          status: 500,
        },
      );
    }

    const [
      authResult,
      profileResult,
    ] = await Promise.all([
      admin.auth.admin.getUserById(
        deposit.investor_id,
      ),

      admin
        .from("profiles")
        .select(
          "first_name, last_name",
        )
        .eq(
          "id",
          deposit.investor_id,
        )
        .maybeSingle(),
    ]);

    const investorEmail =
      authResult.data.user
        ?.email;

    const investorName =
      [
        profileResult.data
          ?.first_name,
        profileResult.data
          ?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Investor";

    let emailSent =
      false;

    if (investorEmail) {
      const email =
        investorCashDepositInstructionsEmail({
          investorName,
          amountCents:
            Number(
              deposit.amount_cents,
            ),
          paymentMethod,
          depositRequestId:
            deposit.id,
          origin:
            new URL(
              request.url,
            ).origin,
        });

      emailSent =
        (
          await sendApplicationMail({
            to:
              investorEmail,
            ...email,
          })
        ).sent;
    }

    return NextResponse.json({
      success: true,
      deposit:
        updatedDeposit,
      emailSent,
    });
  } catch (error) {
    console.error(
      "Cash deposit instruction API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to send Cash Account funding instructions.",
      },
      {
        status: 500,
      },
    );
  }
}
