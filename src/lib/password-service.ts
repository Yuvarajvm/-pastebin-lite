import { hash, verify } from "@node-rs/argon2";
import { sql } from "drizzle-orm";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { normalizeEmail } from "@/lib/email-utils";

export class PasswordError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "PasswordError";
  }
}

// In-memory OTP cache for fast verification with TTL, backed by DB table
interface StoredOtp {
  otp: string;
  email: string;
  expiresAt: number;
}
const otpMemoryCache = new Map<string, StoredOtp>();

export async function generateAndStoreOtp(userId: string, email: string): Promise<string> {
  const canonicalEmail = normalizeEmail(email);
  // Generate a cryptographically secure 6-digit numeric OTP
  const randomNum = crypto.randomInt(100000, 999999);
  const otp = randomNum.toString();
  const ttlMs = 10 * 60 * 1000; // 10 minutes
  const expiresAt = Date.now() + ttlMs;

  // Save to memory cache
  otpMemoryCache.set(userId, { otp, email: canonicalEmail, expiresAt });
  otpMemoryCache.set(canonicalEmail, { otp, email: canonicalEmail, expiresAt });

  // Ensure DB table exists and persist
  try {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_otps (
        id varchar(64) PRIMARY KEY,
        user_id text,
        email varchar(255) NOT NULL,
        otp_code varchar(12) NOT NULL,
        expires_at timestamp with time zone NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    const id = `otp_${userId}_${Date.now()}`;
    await db.execute(sql`
      INSERT INTO password_otps (id, user_id, email, otp_code, expires_at)
      VALUES (${id}, ${userId}, ${canonicalEmail}, ${otp}, NOW() + INTERVAL '10 minutes');
    `);
  } catch {
    // Memory cache serves as reliable fallback
  }

  return otp;
}

export async function requestEmailOtp(email: string): Promise<{ success: boolean; message: string }> {
  const canonicalEmail = normalizeEmail(email);
  const baseUrl =
    process.env.NEON_AUTH_BASE_URL ||
    process.env.NEXT_PUBLIC_NEON_AUTH_BASE_URL ||
    "https://ep-fancy-sun-az01xegk.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth";
  const trustedOrigin =
    process.env.NEON_AUTH_TRUSTED_ORIGIN || "https://pastebin-lite-rho-seven.vercel.app";

  try {
    const res = await fetch(`${baseUrl}/email-otp/send-verification-otp`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: trustedOrigin
      },
      body: JSON.stringify({
        email: canonicalEmail,
        type: "forget-password"
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new PasswordError(errJson?.message || "Failed to send verification email. Please try again.");
    }
  } catch (err) {
    if (err instanceof PasswordError) throw err;
    throw new PasswordError("Unable to dispatch verification email. Please try again.");
  }

  return {
    success: true,
    message: `A 6-digit verification code has been sent to ${email}. Please check your email inbox.`
  };
}

export async function verifyOtpCode(userId: string, email: string, code: string): Promise<boolean> {
  const cleanCode = code.trim();
  const canonicalEmail = normalizeEmail(email);

  // 1. First, verify against Neon Auth upstream email OTP service (the code sent to user's real email)
  try {
    const baseUrl =
      process.env.NEON_AUTH_BASE_URL ||
      process.env.NEXT_PUBLIC_NEON_AUTH_BASE_URL ||
      "https://ep-fancy-sun-az01xegk.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth";
    const trustedOrigin =
      process.env.NEON_AUTH_TRUSTED_ORIGIN || "https://pastebin-lite-rho-seven.vercel.app";

    const res = await fetch(`${baseUrl}/email-otp/check-verification-otp`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: trustedOrigin
      },
      body: JSON.stringify({
        email: canonicalEmail,
        type: "forget-password",
        otp: cleanCode
      })
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      if (json?.success) {
        return true;
      }
    }
  } catch {
    // Upstream check fallback
  }

  // Check memory cache first
  const cached = otpMemoryCache.get(userId) || otpMemoryCache.get(canonicalEmail);
  if (cached && cached.expiresAt > Date.now()) {
    if (cached.otp === cleanCode) {
      otpMemoryCache.delete(userId);
      otpMemoryCache.delete(canonicalEmail);
      try {
        const db = getDb();
        await db.execute(sql`
          DELETE FROM password_otps
          WHERE (user_id = ${userId} OR email = ${canonicalEmail});
        `);
      } catch {}
      return true;
    }
  }

  // Fallback check against database
  try {
    const db = getDb();
    const rows = await db.execute<{ id: string; otp_code: string }>(sql`
      SELECT id, otp_code
      FROM password_otps
      WHERE (user_id = ${userId} OR email = ${canonicalEmail})
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1;
    `);

    if (rows.length > 0 && rows[0].otp_code === cleanCode) {
      // Invalidate used OTP
      await db.execute(sql`DELETE FROM password_otps WHERE id = ${rows[0].id};`);
      return true;
    }
  } catch {
    // Continue
  }

  return false;
}

export async function hashUserPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });
}

export async function changeUserPassword(params: {
  userId: string;
  email: string;
  username?: string;
  method: "current_password" | "email_otp";
  currentPassword?: string;
  otpCode?: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  const { userId, email, username, method, currentPassword, otpCode, newPassword } = params;

  if (!newPassword || newPassword.length < 8) {
    throw new PasswordError("New password must be at least 8 characters in length.");
  }

  const db = getDb();
  const canonicalEmail = normalizeEmail(email);

  // 1. Verify credentials based on selected method
  if (method === "current_password") {
    if (!currentPassword) {
      throw new PasswordError("Current password is required to change password.");
    }

    // Lookup user in database
    const userRows = await db.execute<{ id: string; password_hash: string }>(sql`
      SELECT id, password_hash
      FROM users
      WHERE id = ${userId} OR email = ${email} OR email = ${canonicalEmail}
      LIMIT 1;
    `);

    if (userRows.length === 0 || !userRows[0].password_hash) {
      throw new PasswordError("No existing password found for this account. Please verify via Email OTP instead.");
    }

    const isMatch = await verify(userRows[0].password_hash, currentPassword);
    if (!isMatch) {
      throw new PasswordError("The current password you provided is incorrect.");
    }
  } else if (method === "email_otp") {
    if (!otpCode) {
      throw new PasswordError("One-time verification code (OTP) is required.");
    }

    const isOtpValid = await verifyOtpCode(userId, email, otpCode);
    if (!isOtpValid) {
      throw new PasswordError("Invalid or expired verification code. Please request a new code.");
    }
  } else {
    throw new PasswordError("Invalid password change method. Must provide current password or email OTP.");
  }

  // 2. Hash new password and update record
  const newHash = await hashUserPassword(newPassword);

  const updateResult = await db.execute<{ id: string }>(sql`
    UPDATE users
    SET password_hash = ${newHash}
    WHERE id = ${userId} OR email = ${email} OR email = ${canonicalEmail}
    RETURNING id;
  `);

  if (updateResult.length === 0) {
    // If user record doesn't exist yet (e.g. registered via Neon Auth OAuth), create the user row
    const defaultUsername = username || email.split("@")[0] || `user_${userId.slice(0, 8)}`;
    await db.execute(sql`
      INSERT INTO users (id, username, email, password_hash)
      VALUES (${userId}, ${defaultUsername}, ${email}, ${newHash})
      ON CONFLICT (id) DO UPDATE
      SET password_hash = ${newHash};
    `);
  }

  return {
    success: true,
    message: "Password changed successfully."
  };
}
