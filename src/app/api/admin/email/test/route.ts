import {
  NextResponse,
} from "next/server";

import {
  requireAdmin,
} from "@/src/lib/auth/require-admin";
import {
  getComplianceRecipient,
  sendApplicationMail,
  verifyApplicationEmailTransport,
} from "@/src/lib/email/application-mailer";

export async function POST(
  request: Request,
) {
  await requireAdmin();

  const recipient =
    getComplianceRecipient();

  if (!recipient) {
    return NextResponse.json(
      {
        success: false,
        error:
          "No test recipient is configured. Set COMPLIANCE_EMAIL, COMPLIANCE_NOTIFICATION_EMAIL, or SMTP_USER.",
      },
      {
        status: 500,
      },
    );
  }

  try {
    await verifyApplicationEmailTransport();
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        stage:
          "smtp_verify",
        error:
          error instanceof Error
            ? error.message
            : "SMTP verification failed.",
      },
      {
        status: 500,
      },
    );
  }

  const origin =
    new URL(
      request.url,
    ).origin;

  const delivery =
    await sendApplicationMail({
      to: recipient,
      subject:
        "Tevuah Reserve — application email test",
      text:
        `Application SMTP is working. Origin: ${origin}`,
      html:
        `<p>Application SMTP is working.</p><p>Origin: ${origin}</p>`,
    });

  return NextResponse.json(
    {
      success:
        delivery.sent,
      recipient,
      messageId:
        delivery.messageId,
      error:
        delivery.error,
    },
    {
      status:
        delivery.sent
          ? 200
          : 500,
    },
  );
}
