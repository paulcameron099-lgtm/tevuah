import {
  NextResponse,
} from "next/server";

import {
  requireAdmin,
} from "@/src/lib/auth/require-admin";

import {
  sendApplicationMail,
} from "@/src/lib/email/application-mailer";

import {
  investorCashWithdrawalPaidEmail,
} from "@/src/lib/email/cash-account-withdrawal-emails";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    withdrawalId: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    const adminUser =
      await requireAdmin();

    const {
      withdrawalId,
    } =
      await context.params;

    const body =
      (await request.json()) as {
        paymentReference?:
          string;

        paymentNote?:
          string;
      };

    const paymentReference =
      body.paymentReference?.trim();

    const paymentNote =
      body.paymentNote?.trim() ||
      null;

    if (!paymentReference) {
      return NextResponse.json(
        {
          error:
            "Payment reference is required.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    const {
      data:
        withdrawal,
      error:
        withdrawalError,
    } =
      await admin
        .from(
          "cash_account_withdrawal_requests",
        )
        .select(
          `
          id,
          investor_id,
          amount_cents,
          currency,
          bank_name,
          account_number,
          status,
          payment_reference
          `,
        )
        .eq(
          "id",
          withdrawalId,
        )
        .maybeSingle();

    if (
      withdrawalError ||
      !withdrawal
    ) {
      return NextResponse.json(
        {
          error:
            "Withdrawal request not found.",
        },
        {
          status: 404,
        },
      );
    }

    const alreadyPaid =
      withdrawal.status ===
      "paid";

    const [
      authResult,
      profileResult,
    ] =
      await Promise.all([
        admin.auth.admin.getUserById(
          withdrawal.investor_id,
        ),

        admin
          .from("profiles")
          .select(
            "first_name, last_name",
          )
          .eq(
            "id",
            withdrawal.investor_id,
          )
          .maybeSingle(),
      ]);

    const {
      error:
        paidError,
    } =
      await admin.rpc(
        "mark_cash_account_withdrawal_paid",
        {
          p_withdrawal_id:
            withdrawalId,

          p_admin_id:
            adminUser.userId,

          p_payment_reference:
            paymentReference,

          p_payment_note:
            paymentNote,
        },
      );

    if (paidError) {
      return NextResponse.json(
        {
          error:
            paidError.message,
        },
        {
          status: 409,
        },
      );
    }

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

    if (
      investorEmail &&
      !alreadyPaid
    ) {
      const email =
        investorCashWithdrawalPaidEmail(
          {
            investorName,

            amountCents:
              Number(
                withdrawal.amount_cents,
              ),

            currency:
              withdrawal.currency,

            bankName:
              withdrawal.bank_name,

            maskedAccountNumber:
              maskAccount(
                withdrawal.account_number,
              ),

            paymentReference,

            origin:
              new URL(
                request.url,
              ).origin,
          },
        );

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

      status:
        "paid",

      emailSent,

      message:
        "Withdrawal marked paid and investor notified.",
    });
  } catch (error) {
    console.error(
      "Mark withdrawal paid error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to mark withdrawal paid.",
      },
      {
        status: 500,
      },
    );
  }
}

function maskAccount(
  accountNumber:
    | string
    | null,
) {
  if (!accountNumber) {
    return null;
  }

  return `••••${accountNumber.slice(
    -4,
  )}`;
}