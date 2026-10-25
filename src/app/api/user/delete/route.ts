import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/neon-auth/server";
import { noStoreHeaders } from "@/lib/api";
import { softDeleteUserAccount } from "@/lib/user-service";
import { KNOWN_AUTH_COOKIES } from "@/app/api/auth/logout/route";

export const dynamic = "force-dynamic";

function applyExpiredCookieHeaders(response: NextResponse) {
  for (const name of KNOWN_AUTH_COOKIES) {
    const isSecurePrefix = name.startsWith("__Secure-") || name.startsWith("__Host-");
    const secureFlag = isSecurePrefix || process.env.NODE_ENV === "production" ? "; Secure" : "";
    response.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax${secureFlag}`
    );
  }
}

async function tryClearNextCookies() {
  try {
    const cookieStore = await cookies();
    for (const name of KNOWN_AUTH_COOKIES) {
      try {
        const isSecurePrefix = name.startsWith("__Secure-") || name.startsWith("__Host-");
        cookieStore.delete(name);
        cookieStore.set(name, "", {
          path: "/",
          maxAge: 0,
          expires: new Date(0),
          httpOnly: true,
          sameSite: "lax",
          secure: isSecurePrefix || process.env.NODE_ENV === "production"
        });
      } catch {}
    }
  } catch {}
}

export async function POST(request: Request) {
  // 1. Authenticate user
  let user: { id: string; email?: string | null } | null = null;
  try {
    const session = await auth.getSession();
    user = session?.data?.user ?? null;
  } catch {
    user = null;
  }

  if (!user || !user.id) {
    return NextResponse.json(
      { error: "Unauthorized. You must be signed in to delete your account." },
      { status: 401, headers: noStoreHeaders }
    );
  }

  // 2. Validate confirmation payload
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const confirmation = typeof body?.confirmation === "string" ? body.confirmation.trim() : "";
  if (confirmation !== "delete me") {
    return NextResponse.json(
      {
        error: "Confirmation text mismatch. You must type exactly \"delete me\" to confirm account deletion."
      },
      { status: 400, headers: noStoreHeaders }
    );
  }

  // 3. Perform soft deletion and anti-abuse tombstone registration
  const userEmail = user.email || `${user.id}@neonauth.local`;
  const result = await softDeleteUserAccount({
    userId: user.id,
    email: userEmail,
    reason: "User requested deletion with 'delete me' confirmation"
  });

  // 4. Invalidate cookies and sessions
  await tryClearNextCookies();

  const response = NextResponse.json(
    {
      success: true,
      message: "Account has been soft-deleted and all sessions terminated.",
      normalizedEmail: result.normalizedEmail
    },
    { headers: noStoreHeaders }
  );

  applyExpiredCookieHeaders(response);
  return response;
}
