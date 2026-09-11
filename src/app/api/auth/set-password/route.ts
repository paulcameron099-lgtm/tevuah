import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AUTH_ACTIVATION_COOKIE,
  verifyAuthActivationToken,
} from "@/src/lib/auth/auth-activation";
import { createClient } from "@/src/lib/supabase/server";

type PasswordPayload = { password?: string; confirmPassword?: string };

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

function noStoreJson(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) {
      return noStoreJson({ error: "Invalid request origin." }, 403);
    }

    const cookieStore = await cookies();
    const activation = verifyAuthActivationToken(
      cookieStore.get(AUTH_ACTIVATION_COOKIE)?.value,
    );

    // A normal signed-in session is NOT sufficient.
    if (!activation) {
      return noStoreJson({
        error: "Your password activation session is missing or expired. Please use a fresh invitation or password-reset link.",
      }, 401);
    }

    const payload = (await request.json()) as PasswordPayload;
    const password = payload.password ?? "";
    const confirmPassword = payload.confirmPassword ?? "";

    if (password.length < 8) {
      return noStoreJson({ error: "Your new password must be at least 8 characters." }, 400);
    }
    if (password !== confirmPassword) {
      return noStoreJson({ error: "The passwords you entered do not match." }, 400);
    }

    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      cookieStore.delete(AUTH_ACTIVATION_COOKIE);
      return noStoreJson({
        error: "Your authenticated activation session is no longer valid. Please use a fresh invitation or password-reset link.",
      }, 401);
    }

    // Critical identity binding: token owner MUST equal current Supabase user.
    if (userData.user.id !== activation.userId) {
      console.error("Blocked password update due to activation identity mismatch.", {
        activationUserId: activation.userId,
        authenticatedUserId: userData.user.id,
        purpose: activation.purpose,
      });
      cookieStore.delete(AUTH_ACTIVATION_COOKIE);
      await supabase.auth.signOut({ scope: "local" });
      return noStoreJson({
        error: "Account verification failed. No password was changed. Please open a fresh activation link.",
      }, 403);
    }

    const { data: updateData, error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError || !updateData.user) {
      console.error("Password update error:", updateError);
      return noStoreJson({ error: updateError?.message ?? "Unable to update your password." }, 400);
    }

    if (updateData.user.id !== activation.userId) {
      console.error("Password update returned unexpected user identity.", {
        activationUserId: activation.userId,
        updatedUserId: updateData.user.id,
      });
      cookieStore.delete(AUTH_ACTIVATION_COOKIE);
      await supabase.auth.signOut({ scope: "local" });
      return noStoreJson({ error: "Unable to verify the updated account." }, 500);
    }

    cookieStore.delete(AUTH_ACTIVATION_COOKIE);
    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
    if (signOutError) console.error("Post-password-update local sign-out error:", signOutError);

    return noStoreJson({ success: true, email: updateData.user.email ?? null }, 200);
  } catch (error) {
    console.error("Set password error:", error);
    return noStoreJson({ error: "Unable to update your password." }, 500);
  }
}
