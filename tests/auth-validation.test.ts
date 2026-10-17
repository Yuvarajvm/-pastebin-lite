import { describe, expect, it } from "vitest";
import { signupSchema, loginSchema } from "@/lib/auth-validation";

describe("authValidation", () => {
  describe("signupSchema", () => {
    it("accepts valid registration data", () => {
      const valid = signupSchema.safeParse({
        username: "johndoe",
        email: "John@Example.com",
        password: "securepassword123"
      });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.username).toBe("johndoe");
        expect(valid.data.email).toBe("john@example.com"); // normalized lowercase
      }
    });

    it("rejects invalid usernames", () => {
      expect(signupSchema.safeParse({ username: "ab", email: "a@b.com", password: "password123" }).success).toBe(false);
      expect(signupSchema.safeParse({ username: "invalid space", email: "a@b.com", password: "password123" }).success).toBe(false);
      expect(signupSchema.safeParse({ username: "invalid@char", email: "a@b.com", password: "password123" }).success).toBe(false);
    });

    it("rejects invalid emails", () => {
      expect(signupSchema.safeParse({ username: "user123", email: "not-an-email", password: "password123" }).success).toBe(false);
    });

    it("rejects short passwords", () => {
      expect(signupSchema.safeParse({ username: "user123", email: "a@b.com", password: "short" }).success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("accepts valid login credentials", () => {
      expect(loginSchema.safeParse({ identifier: "user123", password: "any-password" }).success).toBe(true);
      expect(loginSchema.safeParse({ identifier: "user@example.com", password: "any-password" }).success).toBe(true);
    });

    it("rejects empty identifiers or passwords", () => {
      expect(loginSchema.safeParse({ identifier: "", password: "pass" }).success).toBe(false);
      expect(loginSchema.safeParse({ identifier: "user", password: "" }).success).toBe(false);
    });
  });
});
