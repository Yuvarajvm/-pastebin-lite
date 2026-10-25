import { NextResponse } from "next/server";
import { auth } from "@/lib/neon-auth/server";
import { noStoreHeaders } from "@/lib/api";
import { requestEmailOtp } from "@/lib/password-service";

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
    const result = await requestEmailOtp(user.email);

    return NextResponse.json(
      {
        success: true,
        message: result.message
      },
      { headers: noStoreHeaders }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate verification code.";
    return NextResponse.json({ error: message }, { status: 500, headers: noStoreHeaders });
  }
}
