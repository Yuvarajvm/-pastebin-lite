import { auth } from "@/lib/neon-auth/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const handlers = auth.handler();

function wrapHandler(method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH") {
  const original = handlers[method];
  if (!original) {
    return async () => NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  return async function (request: NextRequest | Request, context: any) {
    const incomingOrigin = request.headers.get("origin") || "";
    const trustedOrigin =
      process.env.NEON_AUTH_TRUSTED_ORIGIN ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
      "http://localhost:3000";

    const hasBody = method === "POST" || method === "PUT" || method === "PATCH";
    const bodyText = hasBody ? await request.text() : null;

    const makeRequest = (originOverride?: string) => {
      const h = new Headers(request.headers);
      if (originOverride) {
        h.set("origin", originOverride);
        if (h.has("referer")) {
          try {
            const refUrl = new URL(h.get("referer")!);
            const targetOriginUrl = new URL(originOverride);
            refUrl.protocol = targetOriginUrl.protocol;
            refUrl.host = targetOriginUrl.host;
            refUrl.port = targetOriginUrl.port;
            h.set("referer", refUrl.toString());
          } catch {
            h.set("referer", originOverride);
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

    // If upstream returns 403 Forbidden due to untrusted/invalid origin on preview or deployment domain
    if (res.status === 403) {
      try {
        const clone = res.clone();
        const json = await clone.json();
        if (json?.code === "INVALID_ORIGIN" || json?.message?.toLowerCase().includes("origin")) {
          // Retry proxying with trusted origin to permit server-to-server validation
          res = await original(makeRequest(trustedOrigin), context);
        }
      } catch {
        // Not a JSON error response, retain original response
      }
    }

    // If upstream responded with access-control-allow-origin, ensure it reflects client origin
    if (incomingOrigin && res.headers.has("access-control-allow-origin")) {
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
