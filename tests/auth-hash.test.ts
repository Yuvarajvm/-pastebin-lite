import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth-service";

describe("auth hashing", () => {
  it("hashes password and verifies successfully", async () => {
    const password = "mySecurePassword!99";
    const hashed = await hashPassword(password);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(password);
    expect(hashed.startsWith("$argon2id$")).toBe(true);

    const match = await verifyPassword(hashed, password);
    expect(match).toBe(true);

    const fail = await verifyPassword(hashed, "wrongPassword");
    expect(fail).toBe(false);
  });
});
