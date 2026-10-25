/**
 * Email normalization utilities to prevent Gmail dot-trick and plus-addressing
 * free-trial abuse.
 *
 * Example:
 * - "John.Doe+trial@gmail.com" -> "johndoe@gmail.com"
 * - "J.O.H.N@googlemail.com"   -> "john@gmail.com"
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "";
  }

  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) {
    return email.trim().toLowerCase();
  }

  const [rawLocalPart, domain] = parts;

  // Gmail & Googlemail treat dots as nonexistent and everything after '+' as alias tags
  if (domain === "gmail.com" || domain === "googlemail.com") {
    // 1. Remove all dots
    let cleanLocal = rawLocalPart.replace(/\./g, "");
    // 2. Remove alias tag (e.g. +anything)
    cleanLocal = cleanLocal.split("+")[0];
    return `${cleanLocal}@gmail.com`;
  }

  // For other providers (e.g. Outlook, Proton), also strip '+' sub-addressing if present
  const cleanLocal = rawLocalPart.split("+")[0];
  return `${cleanLocal}@${domain}`;
}

/**
 * Checks if two email addresses map to the exact same canonical mailbox.
 */
export function isSameCanonicalEmail(emailA: string, emailB: string): boolean {
  return normalizeEmail(emailA) === normalizeEmail(emailB);
}
