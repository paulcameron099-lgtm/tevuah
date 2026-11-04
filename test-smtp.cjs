
// require("dotenv").config({ path: ".env.local" });

const nodemailer = require("nodemailer");

async function main() {
  const host =
    process.env.SMTP_HOST ||
    process.env.EMAIL_SMTP_HOST ||
    "smtp.zoho.com";

  const port = Number(
    process.env.SMTP_PORT ||
    process.env.EMAIL_SMTP_PORT ||
    587
  );

  const user =
    process.env.SMTP_USER ||
    process.env.SMTP_USERNAME ||
    process.env.EMAIL_SMTP_USER;

  const pass =
    process.env.SMTP_PASSWORD ||
    process.env.SMTP_PASS ||
    process.env.EMAIL_SMTP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Missing SMTP credentials.");
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
  });

  try {
    console.log("Testing SMTP connection:", {
      host,
      port,
      secure: port === 465,
    });

    await transport.verify();

    console.log(
      "SUCCESS: Zoho SMTP connection, TLS and authentication verified."
    );
  } finally {
    transport.close();
  }
}

main().catch((error) => {
  console.error("SMTP verification failed:", {
    code: error.code,
    command: error.command,
    message: error.message,
  });

  process.exitCode = 1;
});
