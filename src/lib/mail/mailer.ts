import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(
    process.env.SMTP_PORT ?? "587",
  );

  const secure =
    process.env.SMTP_SECURE === "true";

  const user =
    process.env.SMTP_USER;

  const pass =
    process.env.SMTP_PASS;

  if (
    !host ||
    !user ||
    !pass
  ) {
    throw new Error(
      "Missing SMTP environment variables.",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,

    auth: {
      user,
      pass,
    },
  });
}

type SendMailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendMail({
  to,
  subject,
  html,
  text,
}: SendMailParams) {
  const transporter =
    getTransporter();

  const from =
    process.env.MAIL_FROM;

  if (!from) {
    throw new Error(
      "MAIL_FROM is missing.",
    );
  }

  return transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });
}

