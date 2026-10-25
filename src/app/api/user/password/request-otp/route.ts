import { NextResponse } from "next/server";
import { auth } from "@/lib/neon-auth/server";
import { noStoreHeaders } from "@/lib/api";
import { generateAndStoreOtp } from "@/lib/password-service";

export const dynamic = "force-dynamic";

export async function POST() {
  let user: { id: string; email?: string | null } | null = null;
  try {
    const session = await auth.getSession();
    user = session?.data?.user ?? null;
  } catch {
    user = null;
  }

  if (!user || !user.id || !user.email) {
    return NextResponse.json(
      { error: "Unauthorized. You must be signed in to request a verification code." },
      { status: 401, headers: noStoreHeaders }
    );
  }

  try {
    const otp = await generateAndStoreOtp(user.id, user.email);

    // In a live SMTP environment, this triggers an email dispatch.
    // For transparent verification and immediate testing, we return previewCode in response.
    return NextResponse.json(
      {
        success: true,
        message: `A 6-digit one-time code has been dispatched to ${user.email}. Code expires in 10 minutes.`,
        previewCode: process.env.NODE_ENV !== "production" ? otp : undefined
      },
      { headers: noStoreHeaders }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate verification code.";
    return NextResponse.json({ error: message }, { status: 500, headers: noStoreHeaders });
  }
}
