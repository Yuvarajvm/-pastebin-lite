import { auth } from "@/lib/neon-auth/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const handlers = auth.handler();

const DEFAULT_TRUSTED_ORIGIN = "https://pastebin-lite-rho-seven.vercel.app";
const LOCALHOST_ORIGIN = "http://localhost:3000";

const KNOWN_ALLOWED_ORIGINS = new Set([
  "https://pastebin-lite-rho-seven.vercel.app",
  "https://pastebin-lite-hobby-af98.vercel.app",
  "https://pastebin-lite-git-main-hobby-af98.vercel.app",
  "https://pastebin-lite-c2k20qxol-hobby-af98.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);

function resolveUpstreamOrigin(incomingOrigin: string): string {
  if (process.env.NEON_AUTH_TRUSTED_ORIGIN) {
    return process.env.NEON_AUTH_TRUSTED_ORIGIN;
  }
  if (KNOWN_ALLOWED_ORIGINS.has(incomingOrigin)) {
    return incomingOrigin;
  }
  if (incomingOrigin.includes("localhost") || incomingOrigin.includes("127.0.0.1")) {
    return LOCALHOST_ORIGIN;
  }
  return (
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    DEFAULT_TRUSTED_ORIGIN
  );
}

function wrapHandler(method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH") {
  const original = handlers[method];
  if (!original) {
    return async () => NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  return async function (request: NextRequest | Request, context: any) {
    const incomingOrigin = request.headers.get("origin") || "";
    const trustedOrigin = resolveUpstreamOrigin(incomingOrigin);

    const hasBody = method === "POST" || method === "PUT" || method === "PATCH";
    const bodyText = hasBody ? await request.text() : null;

    const makeRequest = (originOverride?: string) => {
      const h = new Headers(request.headers);
      const targetOrigin = originOverride || trustedOrigin;

      if (targetOrigin) {
        h.set("origin", targetOrigin);
        if (h.has("referer")) {
          try {
            const refUrl = new URL(h.get("referer")!);
            const targetOriginUrl = new URL(targetOrigin);
            refUrl.protocol = targetOriginUrl.protocol;
            refUrl.host = targetOriginUrl.host;
            refUrl.port = targetOriginUrl.port;
            h.set("referer", refUrl.toString());
          } catch {
            h.set("referer", targetOrigin);
          }
        }
      }

      return new Request(request.url, {
        method,
        headers: h,
        body: bodyText
      });
    };

    let res = await original(makeRequest(), context);

    // If upstream returns 403 or 400 due to origin validation, retry with canonical default origin
    if (res.status === 403 || res.status === 400) {
      try {
        const clone = res.clone();
        const text = await clone.text();
        if (text.toLowerCase().includes("origin")) {
          res = await original(makeRequest(DEFAULT_TRUSTED_ORIGIN), context);
        }
      } catch {
        // Retain original response
      }
    }

    // Always ensure CORS headers reflect client browser origin
    if (incomingOrigin) {
      res.headers.set("access-control-allow-origin", incomingOrigin);
      res.headers.set("access-control-allow-credentials", "true");
    }

    return res;
  };
}

export const GET = wrapHandler("GET");
export const POST = wrapHandler("POST");
export const PUT = wrapHandler("PUT");
export const DELETE = wrapHandler("DELETE");
export const PATCH = wrapHandler("PATCH");
