
 import { NextResponse,
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
  companyCashDepositReportedEmail,
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
  wireReference?: string;
  bitcoinTransactionHash?: string;
  proofBucket?: string;
  proofStoragePath?: string;
  note?: string;
};

function clean(
  value: unknown,
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    const user =
      await getCurrentUser();

    if (
      !user ||
      user.role !==
        "investor"
    ) {
      return NextResponse.json(
        {
          error:
            "Investor access required.",
        },
        {
          status: 401,
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
      .eq(
        "investor_id",
        user.id,
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
      ![
        "awaiting_payment",
        "rejected",
      ].includes(
        String(
          deposit.status,
        ),
      )
    ) {
      return NextResponse.json(
        {
          error:
            "This deposit cannot be reported from its current status.",
        },
        {
          status: 409,
        },
      );
    }

    const body =
      (await request.json()) as Body;

    const wireReference =
      clean(
        body.wireReference,
      );

    const bitcoinTransactionHash =
      clean(
        body.bitcoinTransactionHash,
      );

    const proofStoragePath =
      clean(
        body.proofStoragePath,
      );

    if (
      deposit.payment_method ===
        "wire_transfer" &&
      !wireReference &&
      !proofStoragePath
    ) {
      return NextResponse.json(
        {
          error:
            "Enter the wire transfer reference or payment proof.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      deposit.payment_method ===
        "bitcoin" &&
      !bitcoinTransactionHash
    ) {
      return NextResponse.json(
        {
          error:
            "Enter the Bitcoin transaction hash.",
        },
        {
          status: 400,
        },
      );
    }

    const now =
      new Date().toISOString();

    const {
      error: updateError,
    } = await admin
      .from(
        "cash_account_deposit_requests",
      )
      .update({
        wire_reference:
          deposit.payment_method ===
          "wire_transfer"
            ? wireReference ||
              null
            : null,

        bitcoin_transaction_hash:
          deposit.payment_method ===
          "bitcoin"
            ? bitcoinTransactionHash ||
              null
            : null,

        proof_bucket:
          clean(
            body.proofBucket,
          ) ||
          null,

        proof_storage_path:
          proofStoragePath ||
          null,

        investor_note:
          clean(
            body.note,
          ) ||
          null,

        reported_at:
          now,

        status:
          "payment_reported",

        rejection_reason:
          null,

        updated_at:
          now,
      })
      .eq(
        "id",
        deposit.id,
      );

    if (
      updateError
    ) {
      console.error(
        "Cash deposit report update error:",
        updateError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to report this Cash Account payment.",
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
        user.id,
      ),

      admin
        .from("profiles")
        .select(
          "first_name, last_name",
        )
        .eq(
          "id",
          user.id,
        )
        .maybeSingle(),
    ]);

    const investorEmail =
      authResult.data.user
        ?.email ??
      "Email unavailable";

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

    const companyRecipient =
      getPaymentNotificationRecipient();

    let companyEmailSent =
      false;

    if (companyRecipient) {
      const email =
        companyCashDepositReportedEmail({
          investorName,
          investorEmail,
          amountCents:
            Number(
              deposit.amount_cents,
            ),
          paymentMethod:
            deposit.payment_method,
          depositRequestId:
            deposit.id,
          origin:
            new URL(
              request.url,
            ).origin,
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
        "payment_reported",
      companyEmailSent,
    });
  } catch (error) {
    console.error(
      "Cash deposit report API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to report this Cash Account payment.",
      },
      {
        status: 500,
      },
    );
  }
}
