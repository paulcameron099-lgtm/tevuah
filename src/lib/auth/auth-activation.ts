import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

export const AUTH_ACTIVATION_COOKIE = "tevuah_auth_activation";
const ACTIVATION_TTL_SECONDS = 15 * 60;

export type AuthActivationPurpose = "invite" | "recovery";

type ActivationPayload = {
  userId: string;
  purpose: AuthActivationPurpose;
  expiresAt: number;
};

function getActivationSecret() {
  const secret = process.env.TEVUAH_AUTH_ACTIVATION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("TEVUAH_AUTH_ACTIVATION_SECRET must be configured with at least 32 characters.");
  }
  return secret;
}

function sign(encodedPayload: string) {
  return createHmac("sha256", getActivationSecret()).update(encodedPayload).digest("base64url");
}

export function createAuthActivationToken(userId: string, purpose: AuthActivationPurpose) {
  const payload: ActivationPayload = {
    userId,
    purpose,
    expiresAt: Math.floor(Date.now() / 1000) + ACTIVATION_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAuthActivationToken(token: string | undefined | null): ActivationPayload | null {
  if (!token) return null;
  const [encodedPayload, suppliedSignature] = token.split(".");
  if (!encodedPayload || !suppliedSignature) return null;

  const expectedSignature = sign(encodedPayload);
  const suppliedBuffer = Buffer.from(suppliedSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  if (suppliedBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<ActivationPayload>;
    if (
      typeof parsed.userId !== "string" || !parsed.userId ||
      (parsed.purpose !== "invite" && parsed.purpose !== "recovery") ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= Math.floor(Date.now() / 1000)
    ) return null;

    return { userId: parsed.userId, purpose: parsed.purpose, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

export const authActivationCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: ACTIVATION_TTL_SECONDS,
};
