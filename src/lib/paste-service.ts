import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { Paste } from "@/lib/db/schema";
import type { CreatePasteInput } from "@/lib/validation";

const ID_LENGTH = 12;
const MAX_ID_ATTEMPTS = 4;
type RawPaste = Omit<Paste, "createdAt" | "expiresAt"> & { createdAt: Date | string; expiresAt: Date | string | null };

function normalizePaste(paste: RawPaste): Paste {
  return {
    ...paste,
    createdAt: paste.createdAt instanceof Date ? paste.createdAt : new Date(paste.createdAt),
    expiresAt: paste.expiresAt ? (paste.expiresAt instanceof Date ? paste.expiresAt : new Date(paste.expiresAt)) : null
  };
}

export class PasteUnavailableError extends Error {
  constructor() {
    super("Paste is unavailable.");
  }
}

export async function createPaste(input: CreatePasteInput, userId?: string | null): Promise<Paste> {
  const db = getDb();
  for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt += 1) {
    const id = nanoid(ID_LENGTH);
    try {
      const rows = await db.execute<RawPaste>(sql`
        INSERT INTO pastes (id, user_id, title, content, language, expires_at, max_views)
        VALUES (
          ${id},
          ${userId ?? null},
          ${input.title},
          ${input.content},
          ${input.language},
          CASE WHEN ${input.ttl_seconds ?? null}::integer IS NULL THEN NULL
               ELSE NOW() + (${input.ttl_seconds ?? null}::integer * INTERVAL '1 second') END,
          ${input.max_views ?? null}
        )
        RETURNING id, user_id AS "userId", title, content, language, created_at AS "createdAt", expires_at AS "expiresAt",
                  max_views AS "maxViews", views_count AS "viewsCount"
      `);
      return normalizePaste(rows[0]);
    } catch (error) {
      // PostgreSQL unique_violation: extraordinarily unlikely Nano ID collision.
      if ((error as { code?: string }).code !== "23505" || attempt === MAX_ID_ATTEMPTS - 1) throw error;
    }
  }
  throw new Error("Could not allocate a paste ID.");
}

/** Retrieves content only if it is still accessible, consuming exactly one view. */
export async function consumePaste(id: string): Promise<Paste> {
  const db = getDb();
  const rows = await db.execute<RawPaste>(sql`
    UPDATE pastes
    SET views_count = views_count + 1
    WHERE id = ${id}
      AND (expires_at IS NULL OR expires_at > NOW())
      AND (max_views IS NULL OR views_count < max_views)
    RETURNING id, user_id AS "userId", title, content, language, created_at AS "createdAt", expires_at AS "expiresAt",
              max_views AS "maxViews", views_count AS "viewsCount"
  `);
  if (!rows[0]) throw new PasteUnavailableError();
  return normalizePaste(rows[0]);
}

/** Retrieves all pastes owned by a specific authenticated user. */
export async function getUserPastes(userId: string): Promise<Paste[]> {
  const db = getDb();
  const rows = await db.execute<RawPaste>(sql`
    SELECT
      id,
      user_id AS "userId",
      title,
      content,
      language,
      created_at AS "createdAt",
      expires_at AS "expiresAt",
      max_views AS "maxViews",
      views_count AS "viewsCount"
    FROM pastes
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `);
  return rows.map(normalizePaste);
}

/** Deletes a paste only if it is owned by the specified user. */
export async function deleteUserPaste(pasteId: string, userId: string): Promise<boolean> {
  const db = getDb();
  const rows = await db.execute<{ id: string }>(sql`
    DELETE FROM pastes
    WHERE id = ${pasteId} AND user_id = ${userId}
    RETURNING id
  `);
  return Boolean(rows[0]);
}
