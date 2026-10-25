import type { Paste } from "@/lib/db/schema";

export const noStoreHeaders = { "Cache-Control": "no-store, max-age=0" };

export function serializePaste(paste: Paste) {
  return {
    id: paste.id,
    user_id: paste.userId ?? null,
    title: paste.title,
    content: paste.content,
    language: paste.language,
    created_at: paste.createdAt.toISOString(),
    expires_at: paste.expiresAt?.toISOString() ?? null,
    max_views: paste.maxViews,
    views_count: paste.viewsCount
  };
}

export function getAppOrigin(request?: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, "")}`;
  }
  if (request) {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || "https";
    if (host) {
      return `${proto}://${host}`;
    }
    try {
      return new URL(request.url).origin;
    } catch {
      // Fall through
    }
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}
