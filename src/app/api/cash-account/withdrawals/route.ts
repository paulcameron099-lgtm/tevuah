import {
  NextResponse,
} from "next/server";

import {
  getCurrentUser,
} from "@/src/lib/auth/get-current-user";

import {
  createAdminClient,
} from "@/src/lib/supabase/admin";

import {
  getPaymentNotificationRecipient,
} from "@/src/lib/email/funding-email-recipients";

import {
  sendApplicationMail,
} from "@/src/lib/email/application-mailer";

import {
  companyCashWithdrawalSubmittedEmail,
  investorCashWithdrawalSubmittedEmail,
} from "@/src/lib/email/cash-account-withdrawal-emails";

export const dynamic =
  "force-dynamic";

type CreateWithdrawalBody = {
  amount?: unknown;
  bankName?: unknown;
  accountHolderName?: unknown;
  accountNumber?: unknown;
  routingNumber?: unknown;
  swiftCode?: unknown;
  iban?: unknown;
  bankAddress?: unknown;
  investorNote?: unknown;
};

function formatWithdrawalMoney(
  amountCents: number,
  currency = "USD",
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency,

      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    },
  ).format(
    amountCents /
      100,
  );
}

function cleanString(
  value: unknown,
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function parseUsdToCents(
  value: string,
) {
  const normalized =
    value
      .trim()
      .replace(
        /,/g,
        "",
      );

  if (
    !/^\d+(?:\.\d{1,2})?$/.test(
      normalized,
    )
  ) {
    return null;
  }

  const [
    dollarPart,
    centPart = "",
  ] =
    normalized.split(
      ".",
    );

  const dollars =
    Number(
      dollarPart,
    );

  const cents =
    Number(
      centPart.padEnd(
        2,
        "0",
      ),
    );

  if (
    !Number.isSafeInteger(
      dollars,
    ) ||
    !Number.isSafeInteger(
      cents,
    )
  ) {
    return null;
  }

  const totalCents =
    dollars * 100 +
    cents;

  if (
    !Number.isSafeInteger(
      totalCents,
    ) ||
    totalCents <= 0
  ) {
    return null;
  }

  return totalCents;
}

function maskAccountNumber(
  value:
    | string
    | null
    | undefined,
) {
  if (!value) {
    return null;
  }

  const normalized =
    value.trim();

  if (
    normalized.length <=
    4
  ) {
    return "••••";
  }

  return `••••${normalized.slice(
    -4,
  )}`;
}

export async function GET() {
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
            "Investor access required.",
        },
        {
          status: 403,
        },
      );
    }

    const admin =
      createAdminClient();

    const {
      data,
      error,
    } =
      await admin
        .from(
          "cash_account_withdrawal_requests",
        )
        .select(
          `
          id,
          investor_id,
          account_id,
          amount_cents,
          currency,
          withdrawal_method,
          bank_name,
          account_holder_name,
          account_number,
          investor_note,
          status,
          rejection_reason,
          payment_reference,
          payment_note,
          reviewed_at,
          approved_at,
          paid_at,
          cancelled_at,
          created_at,
          updated_at
          `,
        )
        .eq(
          "investor_id",
          user.id,
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          },
        )
        .limit(25);

    if (error) {
      console.error(
        "Withdrawal request load error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load withdrawal requests.",
        },
        {
          status: 500,
        },
      );
    }

    const withdrawals =
      (data ?? []).map(
        (withdrawal) => ({
          id:
            withdrawal.id,

          amount_cents:
            withdrawal.amount_cents,

          currency:
            withdrawal.currency,

          withdrawal_method:
            withdrawal.withdrawal_method,

          bank_name:
            withdrawal.bank_name,

          account_holder_name:
            withdrawal.account_holder_name,

          masked_account_number:
            maskAccountNumber(
              withdrawal.account_number,
            ),

          investor_note:
            withdrawal.investor_note,

          status:
            withdrawal.status,

          rejection_reason:
            withdrawal.rejection_reason,

          payment_reference:
            withdrawal.payment_reference,

          payment_note:
            withdrawal.payment_note,

          reviewed_at:
            withdrawal.reviewed_at,

          approved_at:
            withdrawal.approved_at,

          paid_at:
            withdrawal.paid_at,

          cancelled_at:
            withdrawal.cancelled_at,

          created_at:
            withdrawal.created_at,

          updated_at:
            withdrawal.updated_at,
        }),
      );

    return NextResponse.json(
      {
        withdrawals,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Withdrawal GET API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load withdrawal requests.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
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
            "Investor access required.",
        },
        {
          status: 403,
        },
      );
    }

    const body =
      (await request.json()) as CreateWithdrawalBody;

    const amount =
      cleanString(
        body.amount,
      );

    const bankName =
      cleanString(
        body.bankName,
      );

    const accountHolderName =
      cleanString(
        body.accountHolderName,
      );

    const accountNumber =
      cleanString(
        body.accountNumber,
      );

    const routingNumber =
      cleanString(
        body.routingNumber,
      );

    const swiftCode =
      cleanString(
        body.swiftCode,
      );

    const iban =
      cleanString(
        body.iban,
      );

    const bankAddress =
      cleanString(
        body.bankAddress,
      );

    const investorNote =
      cleanString(
        body.investorNote,
      );

    const amountCents =
      parseUsdToCents(
        amount,
      );

    if (
      amountCents ===
      null
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid withdrawal amount with no more than two decimal places.",
        },
        {
          status: 400,
        },
      );
    }

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

    if (!accountHolderName) {
      return NextResponse.json(
        {
          error:
            "Account holder name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!accountNumber) {
      return NextResponse.json(
        {
          error:
            "Account number is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      bankName.length >
      160
    ) {
      return NextResponse.json(
        {
          error:
            "Bank name is too long.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      accountHolderName.length >
      160
    ) {
      return NextResponse.json(
        {
          error:
            "Account holder name is too long.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      accountNumber.length >
      100
    ) {
      return NextResponse.json(
        {
          error:
            "Account number is too long.",
        },
        {
          status: 400,
        },
      );
    }

    const admin =
      createAdminClient();

    /*
     * --------------------------------------------------
     * Check current balance for a cleaner API response.
     *
     * The RPC performs the authoritative balance check.
     * --------------------------------------------------
     */
    const {
      data:
        account,
      error:
        accountError,
    } =
      await admin
        .from(
          "investor_cash_accounts",
        )
        .select(
          `
          id,
          available_balance_cents,
          currency,
          status
          `,
        )
        .eq(
          "investor_id",
          user.id,
        )
        .eq(
          "currency",
          "USD",
        )
        .maybeSingle();

    if (accountError) {
      console.error(
        "Withdrawal account lookup error:",
        accountError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load your Cash Account.",
        },
        {
          status: 500,
        },
      );
    }

    if (!account) {
      return NextResponse.json(
        {
          error:
            "Your Tevuah Cash Account is not available.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      account.status !==
      "active"
    ) {
      return NextResponse.json(
        {
          error:
            "Your Tevuah Cash Account is not active.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      account.available_balance_cents <
      amountCents
    ) {
      return NextResponse.json(
        {
          error:
            "The withdrawal amount exceeds your available Cash Account balance.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * --------------------------------------------------
     * Create request.
     *
     * IMPORTANT:
     * This RPC does NOT debit the Cash Account.
     * --------------------------------------------------
     */
    const {
      data,
      error,
    } =
      await admin.rpc(
        "create_cash_account_withdrawal_request",
        {
          p_investor_id:
            user.id,

          p_amount_cents:
            amountCents,

          p_withdrawal_method:
            "wire_transfer",

          p_bank_name:
            bankName,

          p_account_holder_name:
            accountHolderName,

          p_account_number:
            accountNumber,

          p_routing_number:
            routingNumber ||
            null,

          p_swift_code:
            swiftCode ||
            null,

          p_iban:
            iban ||
            null,

          p_bank_address:
            bankAddress ||
            null,

          p_investor_note:
            investorNote ||
            null,

          p_currency:
            "USD",
        },
      );

    if (error) {
      console.error(
        "Create withdrawal RPC error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to submit withdrawal request.",
        },
        {
          status: 400,
        },
      );
    }

    const withdrawal =
      Array.isArray(
        data,
      )
        ? data[0]
        : data;

    if (!withdrawal) {
      return NextResponse.json(
        {
          error:
            "Withdrawal request was not returned.",
        },
        {
          status: 500,
        },
      );
    }

    /*
 * ==========================================================
 * WITHDRAWAL SUBMISSION COMMUNICATION
 * ==========================================================
 *
 * The financial request already exists at this point.
 * Notification/email failures must never roll it back.
 */

const origin =
  new URL(request.url).origin;

const [
  authResult,
  profileResult,
] =
  await Promise.all([
    admin.auth.admin.getUserById(
      user.id,
    ),

    admin
      .from("profiles")
      .select(
        `
        first_name,
        last_name
        `,
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
  null;

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

const maskedAccountNumber =
  maskAccountNumber(
    withdrawal.account_number,
  );

/*
 * ----------------------------------------------------------
 * 1. Investor dashboard notification
 * ----------------------------------------------------------
 */
const {
  error:
    investorNotificationError,
} =
  await admin
    .from(
      "investor_notifications",
    )
    .upsert(
      {
        investor_id:
          user.id,

        notification_type:
          "account",

        event_key:
          `withdrawal-submitted:${withdrawal.id}`,

        title:
          "Withdrawal request received",

        message:
          "We received your Tevuah Cash Account withdrawal request. Our team will review it before funds are released.",

        action_label:
          "View Cash Account",

        action_path:
          "/dashboard/cash-account",

        source_type:
          "cash_account_withdrawal",

        source_id:
          withdrawal.id,
      },
      {
        onConflict:
          "investor_id,event_key",

        ignoreDuplicates:
          true,
      },
    );

if (
  investorNotificationError
) {
  console.error(
    "Withdrawal investor notification error:",
    investorNotificationError,
  );
}

/*
 * ----------------------------------------------------------
 * 2. Company-wide admin notification
 * ----------------------------------------------------------
 *
 * admin_notifications is company-wide.
 * admin_notification_reads handles per-admin read state.
 */
const {
  error:
    adminNotificationError,
} =
  await admin
    .from(
      "admin_notifications",
    )
    .upsert(
      {
        notification_type:
          "cash_withdrawal",

        event_key:
          `withdrawal-submitted:${withdrawal.id}`,

        title:
          "New Cash Account withdrawal request",

        message:
          `${investorName} submitted a ${formatWithdrawalMoney(
            Number(
              withdrawal.amount_cents,
            ),
            withdrawal.currency ??
              "USD",
          )} withdrawal request.`,

        action_label:
          "Review withdrawal",

        action_path:
          `/admin/withdrawals/${withdrawal.id}`,

        source_type:
          "cash_account_withdrawal",

        source_id:
          withdrawal.id,
      },
      {
        onConflict:
          "event_key",

        ignoreDuplicates:
          true,
      },
    );

if (
  adminNotificationError
) {
  console.error(
    "Withdrawal admin notification error:",
    adminNotificationError,
  );
}

/*
 * ----------------------------------------------------------
 * 3. Investor confirmation email
 * ----------------------------------------------------------
 */
let investorEmailSent =
  false;

if (investorEmail) {
  try {
    const email =
      investorCashWithdrawalSubmittedEmail(
        {
          investorName,

          amountCents:
            Number(
              withdrawal.amount_cents,
            ),

          currency:
            withdrawal.currency ??
            "USD",

          bankName:
            withdrawal.bank_name,

          maskedAccountNumber,

          origin,
        },
      );

    investorEmailSent =
      (
        await sendApplicationMail({
          to:
            investorEmail,

          ...email,
        })
      ).sent;
  } catch (emailError) {
    console.error(
      "Withdrawal investor confirmation email error:",
      emailError,
    );
  }
}

/*
 * ----------------------------------------------------------
 * 4. Company notification email
 * ----------------------------------------------------------
 */
let companyEmailSent =
  false;

const companyRecipient =
  getPaymentNotificationRecipient();

if (companyRecipient) {
  try {
    const email =
      companyCashWithdrawalSubmittedEmail(
        {
          investorName,

          investorEmail:
            investorEmail ??
            "Email unavailable",

          amountCents:
            Number(
              withdrawal.amount_cents,
            ),

          currency:
            withdrawal.currency ??
            "USD",

          bankName:
            withdrawal.bank_name,

          maskedAccountNumber,

          withdrawalId:
            withdrawal.id,

          origin,
        },
      );

    companyEmailSent =
      (
        await sendApplicationMail({
          to:
            companyRecipient,

          ...email,
        })
      ).sent;
  } catch (emailError) {
    console.error(
      "Withdrawal company email error:",
      emailError,
    );
  }
}

    /*
     * Never send the full account number back.
     */
    return NextResponse.json(
      {
        success: true,

        withdrawal: {
          id:
            withdrawal.id,

          amount_cents:
            withdrawal.amount_cents,

          currency:
            withdrawal.currency,

          withdrawal_method:
            withdrawal.withdrawal_method,

          bank_name:
            withdrawal.bank_name,

          account_holder_name:
            withdrawal.account_holder_name,

          masked_account_number:
            maskAccountNumber(
              withdrawal.account_number,
            ),

          investor_note:
            withdrawal.investor_note,

          status:
            withdrawal.status,

          rejection_reason:
            withdrawal.rejection_reason,

          payment_reference:
            withdrawal.payment_reference,

          payment_note:
            withdrawal.payment_note,

          reviewed_at:
            withdrawal.reviewed_at,

          approved_at:
            withdrawal.approved_at,

          paid_at:
            withdrawal.paid_at,

          cancelled_at:
            withdrawal.cancelled_at,

          created_at:
            withdrawal.created_at,

          updated_at:
            withdrawal.updated_at,
        },

         emailDelivery: {
      investor:
        investorEmailSent,

      company:
        companyEmailSent,
    },
    
      },
      {
        status: 201,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Withdrawal POST API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to submit withdrawal request.",
      },
      {
        status: 500,
      },
    );
  }
}