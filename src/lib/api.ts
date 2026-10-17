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
