import "server-only";

import nodemailer from "nodemailer";

type MailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type MailDeliveryResult = {
  sent: boolean;
  messageId?: string;
  error?: string;
};

function env(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

function smtpConfig() {
  const host =
    env("SMTP_HOST", "EMAIL_SMTP_HOST") ||
    "smtp.zoho.com";

  const portRaw =
    env("SMTP_PORT", "EMAIL_SMTP_PORT") ||
    "465";

  const port = Number(portRaw);

  const user = env(
    "SMTP_USER",
    "SMTP_USERNAME",
    "EMAIL_SMTP_USER",
  );

  const pass = env(
    "SMTP_PASSWORD",
    "SMTP_PASS",
    "EMAIL_SMTP_PASSWORD",
  );

  const from =
    env(
      "SMTP_FROM",
      "EMAIL_FROM",
      "MAIL_FROM",
    ) || user;

  if (!user || !pass || !from) {
    throw new Error(
      "Application SMTP is not configured. Set SMTP_USER, SMTP_PASSWORD (or SMTP_PASS), and SMTP_FROM/EMAIL_FROM.",
    );
  }

  if (!Number.isFinite(port)) {
    throw new Error("SMTP_PORT must be a valid number.");
  }

  return {
    host,
    port,
    secure: port === 465,
    user,
    pass,
    from,
  };
}

function transporter() {
  const config = smtpConfig();

  return {
    config,
    transport: nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      requireTLS: config.port === 587,
    }),
  };
}

export function getComplianceRecipient() {
  return (
    env(
      "COMPLIANCE_EMAIL",
      "COMPLIANCE_NOTIFICATION_EMAIL",
    ) ||
    env(
      "SMTP_USER",
      "SMTP_USERNAME",
      "EMAIL_SMTP_USER",
    )
  );
}

export async function verifyApplicationEmailTransport() {
  const { transport } = transporter();
  await transport.verify();
}

export async function sendApplicationMail(
  input: MailInput,
): Promise<MailDeliveryResult> {
  try {
    const { config, transport } =
      transporter();

    const info = await transport.sendMail({
      from: config.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    console.info("[TEVUAH EMAIL SENT]", {
      to: input.to,
      subject: input.subject,
      messageId: info.messageId,
    });

    return {
      sent: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown email delivery error.";

    console.error("[TEVUAH EMAIL FAILED]", {
      to: input.to,
      subject: input.subject,
      error: message,
    });

    return {
      sent: false,
      error: message,
    };
  }
}
