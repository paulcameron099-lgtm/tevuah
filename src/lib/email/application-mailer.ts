
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

type SMTPError = Error & {
  code?: string;
  command?: string;
  responseCode?: number;
  response?: string;
};

function env(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  return "";
}

function smtpConfig() {
  const host =
    env("SMTP_HOST", "EMAIL_SMTP_HOST") ||
    "smtp.zoho.com";

  const portRaw =
    env("SMTP_PORT", "EMAIL_SMTP_PORT") ||
    "587";

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
      "Application SMTP is not configured. " +
        "Set SMTP_USER, SMTP_PASSWORD (or SMTP_PASS), " +
        "and SMTP_FROM.",
    );
  }

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error(
      "SMTP_PORT must be a valid port number.",
    );
  }

  if (port !== 465 && port !== 587) {
    throw new Error(
      "Use SMTP port 587 (STARTTLS) or 465 (implicit TLS).",
    );
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

// Let TypeScript infer the exact SMTP pool transporter type.
function createMailer() {
  const config = smtpConfig();

  const secure = config.port === 465;
  const requireTLS = config.port === 587;

  console.info("[TEVUAH SMTP CONFIG]", {
    host: config.host,
    port: config.port,
    secure,
    requireTLS,
    pooled: true,
    nodeEnv: process.env.NODE_ENV,
    nodeVersion: process.version,
  });

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure,
    requireTLS,
    ignoreTLS: false,

    // SMTP connection pooling
    pool: true,
    maxConnections: 2,
    maxMessages: 50,

    auth: {
      user: config.user,
      pass: config.pass,
    },

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,

    tls: {
      servername: config.host,
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
  });

  return {
    config,
    transport,
  };
}

type Mailer = ReturnType<typeof createMailer>;

let sharedMailer: Mailer | null = null;

function transporter(): Mailer {
  if (!sharedMailer) {
    sharedMailer = createMailer();
  }

  return sharedMailer;
}

function smtpErrorDetails(error: unknown) {
  const err = error as Partial<SMTPError> | null;

  return {
    message:
      error instanceof Error
        ? error.message
        : "Unknown SMTP delivery error.",
    code:
      typeof err?.code === "string"
        ? err.code
        : undefined,
    command:
      typeof err?.command === "string"
        ? err.command
        : undefined,
    responseCode:
      typeof err?.responseCode === "number"
        ? err.responseCode
        : undefined,
  };
}

function isSafeConnectionRetry(
  error: unknown,
): boolean {
  const details = smtpErrorDetails(error);

  const code = details.code ?? "";
  const command = details.command ?? "";
  const message = details.message.toLowerCase();

  // Never retry an SMTP response failure.
  if (details.responseCode !== undefined) {
    return false;
  }

  // Only retry failures before SMTP message submission.
  if (
    command &&
    command !== "CONN" &&
    command !== "STARTTLS"
  ) {
    return false;
  }

  if (
    message.includes("greeting never received")
  ) {
    return true;
  }

  return [
    "ETIMEDOUT",
    "ECONNREFUSED",
    "ENETUNREACH",
    "EHOSTUNREACH",
  ].includes(code);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getComplianceRecipient(): string {
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

export async function verifyApplicationEmailTransport(): Promise<void> {
  const { transport } = transporter();

  await transport.verify();
}

export async function sendApplicationMail(
  input: MailInput,
): Promise<MailDeliveryResult> {
  const maxAttempts = 3;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    const startedAt = Date.now();

    try {
      const { config, transport } = transporter();

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
        attempt,
        durationMs: Date.now() - startedAt,
      });

      return {
        sent: true,
        messageId: info.messageId,
      };
    } catch (error) {
      const details = smtpErrorDetails(error);

      const retryable =
        isSafeConnectionRetry(error);

      console.error("[TEVUAH SMTP FAILURE]", {
        to: input.to,
        subject: input.subject,
        attempt,
        durationMs: Date.now() - startedAt,
        ...details,
        retryable,
      });

      if (
        !retryable ||
        attempt >= maxAttempts
      ) {
        return {
          sent: false,
          error: details.message,
        };
      }

      // Retry transient connection failures only.
      await delay(attempt * 2000);
    }
  }

  return {
    sent: false,
    error: "SMTP delivery attempts exhausted.",
  };
}

export function getInvestorEnquiryRecipient(): string {
  return (
    env(
      "INVESTOR_ENQUIRY_EMAIL",
      "CONTACT_EMAIL",
    ) ||
    env(
      "SMTP_USER",
      "SMTP_USERNAME",
      "EMAIL_SMTP_USER",
    )
  );
}
