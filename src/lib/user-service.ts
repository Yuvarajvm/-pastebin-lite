import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { normalizeEmail } from "@/lib/email-utils";

export interface SoftDeleteResult {
  success: boolean;
  message: string;
  normalizedEmail: string;
}

export interface TrialEligibilityResult {
  eligible: boolean;
  normalizedEmail: string;
  previousAccountDeleted: boolean;
  reason?: string;
}

/**
 * Executes a soft deletion of the user account.
 *
 * 1. Sets deleted_at = NOW() and marks trial_claimed = true on the user profile.
 * 2. Writes a tombstone to account_deletions with the canonical normalized email
 *    (stripping Gmail dot and plus aliases) to permanently block loop-hole re-registration.
 * 3. Destroys active database sessions.
 */
export async function softDeleteUserAccount(params: {
  userId: string;
  email: string;
  reason?: string;
}): Promise<SoftDeleteResult> {
  const db = getDb();
  const canonicalEmail = normalizeEmail(params.email);
  const tombstoneId = nanoid(24);

  // 1. Ensure account_deletions table exists and record the tombstone
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS account_deletions (
      id varchar(36) PRIMARY KEY,
      user_id text,
      email varchar(255) NOT NULL,
      normalized_email varchar(255) NOT NULL,
      trial_claimed boolean DEFAULT true NOT NULL,
      deleted_at timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

  // Insert tombstone or update existing record
  await db.execute(sql`
    INSERT INTO account_deletions (id, user_id, email, normalized_email, trial_claimed, deleted_at)
    VALUES (${tombstoneId}, ${params.userId}, ${params.email}, ${canonicalEmail}, true, NOW())
    ON CONFLICT (id) DO UPDATE
    SET deleted_at = NOW(), trial_claimed = true;
  `);

  // 2. Soft-delete the user record in users table if present
  try {
    await db.execute(sql`
      UPDATE users
      SET deleted_at = NOW(), trial_claimed = true
      WHERE id = ${params.userId} OR email = ${params.email} OR email = ${canonicalEmail};
    `);
  } catch {
    // If users table is absent or schema varies, continue
  }

  // 3. Purge active sessions from the database
  try {
    await db.execute(sql`
      DELETE FROM sessions
      WHERE user_id = ${params.userId};
    `);
  } catch {
    // Continue
  }

  return {
    success: true,
    message: "Account soft-deleted successfully.",
    normalizedEmail: canonicalEmail
  };
}

/**
 * Checks if a given email (or its canonical Gmail alias) has already consumed
 * a free trial or was previously associated with a soft-deleted account.
 */
export async function checkEmailTrialEligibility(email: string): Promise<TrialEligibilityResult> {
  const db = getDb();
  const canonicalEmail = normalizeEmail(email);

  try {
    // Ensure table exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS account_deletions (
        id varchar(36) PRIMARY KEY,
        user_id text,
        email varchar(255) NOT NULL,
        normalized_email varchar(255) NOT NULL,
        trial_claimed boolean DEFAULT true NOT NULL,
        deleted_at timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    // Check account_deletions tombstones
    const tombstoneRows = await db.execute<{ id: string; trial_claimed: boolean }>(sql`
      SELECT id, trial_claimed
      FROM account_deletions
      WHERE normalized_email = ${canonicalEmail}
         OR email = ${email}
      LIMIT 1;
    `);

    if (tombstoneRows.length > 0) {
      return {
        eligible: false,
        normalizedEmail: canonicalEmail,
        previousAccountDeleted: true,
        reason: "An account with this email address was previously deleted. Free-trial access cannot be re-claimed."
      };
    }

    // Check users table for soft-deleted status or already claimed trial
    const userRows = await db.execute<{ id: string; deleted_at: Date | null; trial_claimed: boolean | null }>(sql`
      SELECT id, deleted_at, trial_claimed
      FROM users
      WHERE email = ${email} OR email = ${canonicalEmail}
      LIMIT 1;
    `);

    if (userRows.length > 0) {
      const user = userRows[0];
      if (user.deleted_at) {
        return {
          eligible: false,
          normalizedEmail: canonicalEmail,
          previousAccountDeleted: true,
          reason: "An account with this email address was previously deleted. Free-trial access cannot be re-claimed."
        };
      }
      if (user.trial_claimed) {
        return {
          eligible: false,
          normalizedEmail: canonicalEmail,
          previousAccountDeleted: false,
          reason: "Free trial has already been claimed for this account."
        };
      }
    }
  } catch {
    // If tables don't exist yet, fall back gracefully
  }

  return {
    eligible: true,
    normalizedEmail: canonicalEmail,
    previousAccountDeleted: false
  };
}
