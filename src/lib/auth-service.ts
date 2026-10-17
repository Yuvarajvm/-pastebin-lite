import { hash, verify } from "@node-rs/argon2";
import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import type { User, Session, Paste } from "@/lib/db/schema";
import type { SignupInput, LoginInput } from "@/lib/auth-validation";

export const SESSION_COOKIE_NAME = "pastebin_lite_session";
const SESSION_TTL_DAYS = 30;

export type SafeUser = Omit<User, "passwordHash">;

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "AuthError";
  }
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return verify(hash, password);
}

export function sanitizeUser(user: User): SafeUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt)
  };
}

export async function registerUser(input: SignupInput): Promise<SafeUser> {
  const db = getDb();
  const normalizedUsername = input.username.trim();
  const normalizedEmail = input.email.trim().toLowerCase();

  // Check username collision (case-insensitive)
  const existingUser = await db.execute<{ id: string }>(sql`
    SELECT id FROM users
    WHERE LOWER(username) = LOWER(${normalizedUsername})
       OR LOWER(email) = LOWER(${normalizedEmail})
    LIMIT 1
  `);

  if (existingUser[0]) {
    // Determine which field collided
    const usernameMatch = await db.execute<{ id: string }>(sql`
      SELECT id FROM users WHERE LOWER(username) = LOWER(${normalizedUsername}) LIMIT 1
    `);
    if (usernameMatch[0]) {
      throw new AuthError("That username is already taken.", 409);
    }
    throw new AuthError("That email address is already registered.", 409);
  }

  const passwordHash = await hashPassword(input.password);
  const id = `usr_${nanoid(16)}`;

  const rows = await db.execute<User>(sql`
    INSERT INTO users (id, username, email, password_hash)
    VALUES (${id}, ${normalizedUsername}, ${normalizedEmail}, ${passwordHash})
    RETURNING id, username, email, password_hash AS "passwordHash", created_at AS "createdAt"
  `);

  return sanitizeUser(rows[0]);
}

export async function authenticateUser(input: LoginInput): Promise<SafeUser> {
  const db = getDb();
  const identifier = input.identifier.trim();

  const rows = await db.execute<User>(sql`
    SELECT id, username, email, password_hash AS "passwordHash", created_at AS "createdAt"
    FROM users
    WHERE LOWER(username) = LOWER(${identifier})
       OR LOWER(email) = LOWER(${identifier})
    LIMIT 1
  `);

  const user = rows[0];
  if (!user) {
    throw new AuthError("Invalid username/email or password.", 401);
  }

  const isValid = await verifyPassword(user.passwordHash, input.password);
  if (!isValid) {
    throw new AuthError("Invalid username/email or password.", 401);
  }

  return sanitizeUser(user);
}

export async function createSession(userId: string): Promise<string> {
  const db = getDb();
  const sessionToken = nanoid(48);

  await db.execute(sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (
      ${sessionToken},
      ${userId},
      NOW() + (${SESSION_TTL_DAYS} * INTERVAL '1 day')
    )
  `);

  return sessionToken;
}

export async function validateSession(token: string): Promise<{ user: SafeUser; session: Session } | null> {
  const db = getDb();

  type JoinedRow = {
    sessionId: string;
    sessionUserId: string;
    sessionExpiresAt: Date | string;
    sessionCreatedAt: Date | string;
    userId: string;
    username: string;
    email: string;
    userCreatedAt: Date | string;
  };

  const rows = await db.execute<JoinedRow>(sql`
    SELECT
      s.id AS "sessionId",
      s.user_id AS "sessionUserId",
      s.expires_at AS "sessionExpiresAt",
      s.created_at AS "sessionCreatedAt",
      u.id AS "userId",
      u.username,
      u.email,
      u.created_at AS "userCreatedAt"
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${token}
      AND s.expires_at > NOW()
    LIMIT 1
  `);

  const row = rows[0];
  if (!row) return null;

  return {
    user: {
      id: row.userId,
      username: row.username,
      email: row.email,
      createdAt: row.userCreatedAt instanceof Date ? row.userCreatedAt : new Date(row.userCreatedAt)
    },
    session: {
      id: row.sessionId,
      userId: row.sessionUserId,
      expiresAt: row.sessionExpiresAt instanceof Date ? row.sessionExpiresAt : new Date(row.sessionExpiresAt),
      createdAt: row.sessionCreatedAt instanceof Date ? row.sessionCreatedAt : new Date(row.sessionCreatedAt)
    }
  };
}

export async function destroySession(token: string): Promise<void> {
  const db = getDb();
  await db.execute(sql`DELETE FROM sessions WHERE id = ${token}`);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const token = await getSessionTokenFromCookies();
  if (token) {
    const result = await validateSession(token);
    if (result) return result.user;
  }

  // Fallback to Neon Auth managed session
  try {
    const { neonAuth } = await import("@/lib/neon-auth/server");
    const neonSession = await neonAuth.getSession();
    if (neonSession?.data?.user) {
      const u = neonSession.data.user;
      return {
        id: u.id,
        username: u.name || (u.email ? u.email.split("@")[0] : "user"),
        email: u.email || "",
        createdAt: new Date(u.createdAt || Date.now())
      };
    }
  } catch {
    // Neon Auth session not present or network unavailable
  }

  return null;
}

export async function getUserPastes(userId: string): Promise<Paste[]> {
  const db = getDb();
  type RawPaste = Omit<Paste, "createdAt" | "expiresAt"> & { createdAt: Date | string; expiresAt: Date | string | null };

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

  return rows.map((paste) => ({
    ...paste,
    createdAt: paste.createdAt instanceof Date ? paste.createdAt : new Date(paste.createdAt),
    expiresAt: paste.expiresAt ? (paste.expiresAt instanceof Date ? paste.expiresAt : new Date(paste.expiresAt)) : null
  }));
}

export async function deleteUserPaste(pasteId: string, userId: string): Promise<boolean> {
  const db = getDb();
  const rows = await db.execute<{ id: string }>(sql`
    DELETE FROM pastes
    WHERE id = ${pasteId} AND user_id = ${userId}
    RETURNING id
  `);
  return Boolean(rows[0]);
}
