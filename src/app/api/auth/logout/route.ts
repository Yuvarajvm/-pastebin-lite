import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { noStoreHeaders } from "@/lib/api";

export const dynamic = "force-dynamic";

export const KNOWN_AUTH_COOKIES = [
  "__Secure-neon-auth.session_token",
  "__Secure-neon-auth.session_data",
  "__Secure-neon-auth.dont_remember",
  "__Secure-neon-auth.local.session_data",
  "__Secure-neon-auth.session_challenge",
  "__Secure-neon-auth.session_challange",
  "__Secure-neon-auth.state",
  "__Secure-neon-auth.pkce_code_verifier",
  "neon-auth.session_token",
  "neon-auth.session_data",
  "neon-auth.dont_remember",
  "neon-auth.local.session_data",
  "neon-auth.session_challenge",
  "neon-auth.session_challange",
  "neon-auth.state",
  "neon-auth.pkce_code_verifier",
  "pastebin_lite_session"
];

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
    const all = cookieStore.getAll();
    for (const c of all) {
      if (c.name.includes("neon-auth") || c.name.includes("session")) {
        try {
          const isSecurePrefix = c.name.startsWith("__Secure-") || c.name.startsWith("__Host-");
          cookieStore.delete(c.name);
          cookieStore.set(c.name, "", {
            path: "/",
            maxAge: 0,
            expires: new Date(0),
            httpOnly: true,
            sameSite: "lax",
            secure: isSecurePrefix || process.env.NODE_ENV === "production"
          });
        } catch {}
      }
    }
  } catch {
    // Outside request store context (e.g. unit tests)
  }
}

export async function POST() {
  await tryClearNextCookies();
  const res = NextResponse.json({ success: true }, { headers: noStoreHeaders });
  applyExpiredCookieHeaders(res);
  return res;
}

export async function GET(request: Request) {
  await tryClearNextCookies();
  const url = new URL(request.url);
  const res = NextResponse.redirect(new URL("/", url.origin), { headers: noStoreHeaders });
  applyExpiredCookieHeaders(res);
  return res;
}
