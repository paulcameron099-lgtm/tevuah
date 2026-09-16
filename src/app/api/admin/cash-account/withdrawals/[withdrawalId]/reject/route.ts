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
  investorCashWithdrawalRejectedEmail,
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
        reason?: string;
      };

    const reason =
      body.reason?.trim();

    if (!reason) {
      return NextResponse.json(
        {
          error:
            "Enter a rejection reason.",
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

    const {
      error:
        rejectError,
    } =
      await admin.rpc(
        "reject_cash_account_withdrawal",
        {
          p_withdrawal_id:
            withdrawalId,

          p_admin_id:
            adminUser.userId,

          p_rejection_reason:
            reason,
        },
      );

    if (rejectError) {
      return NextResponse.json(
        {
          error:
            rejectError.message,
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

    if (investorEmail) {
      const email =
        investorCashWithdrawalRejectedEmail(
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

            reason,

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
        "rejected",
      emailSent,
      message:
        "Withdrawal rejected and investor notified.",
    });
  } catch (error) {
    console.error(
      "Reject withdrawal error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to reject withdrawal.",
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