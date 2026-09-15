import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";
import {
  getPaymentNotificationRecipient,
} from "@/src/lib/email/funding-email-recipients";
import {
  sendApplicationMail,
} from "@/src/lib/email/application-mailer";
import {
  companyCashDepositVerifiedEmail,
  investorCashDepositRejectedEmail,
  investorCashDepositVerifiedEmail,
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
  action?:
    | "verify"
    | "reject";
  reason?: string;
};

export async function POST(
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

    const body =
      (await request.json()) as Body;

    if (
      body.action !==
        "verify" &&
      body.action !==
        "reject"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid Cash Account deposit review action.",
        },
        {
          status: 400,
        },
      );
    }

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

    if (
      body.action ===
      "reject"
    ) {
      const reason =
        body.reason?.trim();

      if (!reason) {
        return NextResponse.json(
          {
            error:
              "Enter a reason for rejecting the deposit.",
          },
          {
            status: 400,
          },
        );
      }

      const {
        error: rejectError,
      } = await admin
        .from(
          "cash_account_deposit_requests",
        )
        .update({
          status:
            "rejected",
          rejection_reason:
            reason,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          deposit.id,
        );

      if (
        rejectError
      ) {
        return NextResponse.json(
          {
            error:
              "Unable to reject the Cash Account deposit.",
          },
          {
            status: 500,
          },
        );
      }

      let emailSent =
        false;

      if (investorEmail) {
        const email =
          investorCashDepositRejectedEmail({
            investorName,
            amountCents:
              Number(
                deposit.amount_cents,
              ),
            reason,
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
        status:
          "rejected",
        emailSent,
      });
    }

    const {
      data: verificationResult,
      error: verificationError,
    } = await admin.rpc(
      "verify_cash_account_deposit",
      {
        p_deposit_request_id:
          deposit.id,
        p_admin_id:
          adminUser.id,
      },
    );

    if (
      verificationError
    ) {
      console.error(
        "Cash deposit verification RPC error:",
        verificationError,
      );

      return NextResponse.json(
        {
          error:
            verificationError.message ||
            "Unable to verify the Cash Account deposit.",
        },
        {
          status: 409,
        },
      );
    }

    const origin =
      new URL(
        request.url,
      ).origin;

    let investorEmailSent =
      false;

    if (investorEmail) {
      const email =
        investorCashDepositVerifiedEmail({
          investorName,
          amountCents:
            Number(
              deposit.amount_cents,
            ),
          paymentMethod:
            deposit.payment_method ===
            "bitcoin"
              ? "Bitcoin"
              : "Wire transfer",
          origin,
        });

      investorEmailSent =
        (
          await sendApplicationMail({
            to:
              investorEmail,
            ...email,
          })
        ).sent;
    }

    const companyRecipient =
      getPaymentNotificationRecipient();

    let companyEmailSent =
      false;

    if (companyRecipient) {
      const email =
        companyCashDepositVerifiedEmail({
          investorName,
          investorEmail:
            investorEmail ??
            "Email unavailable",
          amountCents:
            Number(
              deposit.amount_cents,
            ),
          paymentMethod:
            deposit.payment_method,
          depositRequestId:
            deposit.id,
        });

      companyEmailSent =
        (
          await sendApplicationMail({
            to:
              companyRecipient,
            ...email,
          })
        ).sent;
    }

    return NextResponse.json({
      success: true,
      status:
        "verified",
      result:
        verificationResult,
      emailDelivery: {
        investor:
          investorEmailSent,
        company:
          companyEmailSent,
      },
    });
  } catch (error) {
    console.error(
      "Cash deposit review API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to review the Cash Account deposit.",
      },
      {
        status: 500,
      },
    );
  }
}
