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
  "neon-auth.session_token",
  "neon-auth.session_data",
  "neon-auth.local.session_data",
  "pastebin_lite_session"
];

function applyExpiredCookieHeaders(response: NextResponse) {
  for (const name of KNOWN_AUTH_COOKIES) {
    response.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax`
    );
  }
}

async function tryClearNextCookies() {
  try {
    const cookieStore = await cookies();
    for (const name of KNOWN_AUTH_COOKIES) {
      try {
        cookieStore.delete(name);
        cookieStore.set(name, "", {
          path: "/",
          maxAge: 0,
          expires: new Date(0)
        });
      } catch {}
    }
    const all = cookieStore.getAll();
    for (const c of all) {
      if (c.name.includes("neon-auth") || c.name.includes("session")) {
        try {
          cookieStore.delete(c.name);
          cookieStore.set(c.name, "", {
            path: "/",
            maxAge: 0,
            expires: new Date(0)
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
