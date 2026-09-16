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
  investorCashWithdrawalProcessingEmail,
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
          status
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

    /*
     * CRITICAL:
     *
     * Do not perform any balance mutation here.
     *
     * The RPC locks the withdrawal and Cash Account,
     * checks available balance, creates the immutable
     * withdrawal ledger debit and moves the request
     * to processing atomically.
     */
    const {
      data:
        result,
      error:
        approvalError,
    } =
      await admin.rpc(
        "approve_cash_account_withdrawal",
        {
          p_withdrawal_id:
            withdrawalId,

          p_admin_id:
            adminUser.userId,
        },
      );

    if (approvalError) {
      console.error(
        "Withdrawal approval RPC error:",
        approvalError,
      );

      return NextResponse.json(
        {
          error:
            approvalError.message,
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

    /*
     * Don't resend email on an idempotent retry.
     */
    const alreadyApproved =
      Boolean(
        result &&
          typeof result ===
            "object" &&
          "alreadyApproved" in
            result &&
          result.alreadyApproved,
      );

    if (
      investorEmail &&
      !alreadyApproved
    ) {
      const email =
        investorCashWithdrawalProcessingEmail(
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
        "processing",

      result,

      emailSent,

      message:
        "Withdrawal approved and moved to processing.",
    });
  } catch (error) {
    console.error(
      "Approve withdrawal error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to approve withdrawal.",
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