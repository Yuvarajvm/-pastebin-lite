import { NextResponse } from "next/server";
import { auth } from "@/lib/neon-auth/server";
import { noStoreHeaders } from "@/lib/api";
import { changeUserPassword, PasswordError } from "@/lib/password-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let user: { id: string; email?: string | null; name?: string | null } | null = null;
  try {
    const session = await auth.getSession();
    user = session?.data?.user ?? null;
  } catch {
    user = null;
  }

  if (!user || !user.id || !user.email) {
    return NextResponse.json(
      { error: "Unauthorized. You must be signed in to change your password." },
      { status: 401, headers: noStoreHeaders }
    );
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request payload." },
      { status: 400, headers: noStoreHeaders }
    );
  }

  const { method, currentPassword, otpCode, newPassword, confirmPassword } = body;

  if (!newPassword || typeof newPassword !== "string") {
    return NextResponse.json(
      { error: "New password is required and must be at least 8 characters." },
      { status: 400, headers: noStoreHeaders }
    );
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "New password and password confirmation do not match." },
      { status: 400, headers: noStoreHeaders }
    );
  }

  try {
    const result = await changeUserPassword({
      userId: user.id,
      email: user.email,
      username: user.name || undefined,
      method: method === "email_otp" ? "email_otp" : "current_password",
      currentPassword: typeof currentPassword === "string" ? currentPassword : undefined,
      otpCode: typeof otpCode === "string" ? otpCode : undefined,
      newPassword
    });

    return NextResponse.json(result, { headers: noStoreHeaders });
  } catch (err) {
    if (err instanceof PasswordError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode, headers: noStoreHeaders });
    }
    const message = err instanceof Error ? err.message : "Failed to change password.";
    return NextResponse.json({ error: message }, { status: 500, headers: noStoreHeaders });
  }
}
