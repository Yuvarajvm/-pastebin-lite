import { describe, expect, it } from "vitest";
import { generateAndStoreOtp, verifyOtpCode } from "@/lib/password-service";

describe("Password Service & Verification", () => {
  it("generates a 6-digit numeric OTP and verifies it successfully", async () => {
    const userId = "test_user_otp_1";
    const email = "otp.test@gmail.com";

    const otp = await generateAndStoreOtp(userId, email);
    expect(otp).toMatch(/^\d{6}$/);

    // Verifying with wrong OTP fails
    const invalidResult = await verifyOtpCode(userId, email, "000000");
    expect(invalidResult).toBe(false);

    // Verifying with correct OTP succeeds
    const validResult = await verifyOtpCode(userId, email, otp);
    expect(validResult).toBe(true);

    // OTP is one-time use; subsequent verification fails
    const reuseResult = await verifyOtpCode(userId, email, otp);
    expect(reuseResult).toBe(false);
  });

  it("verifies OTP across canonical Gmail alias variations", async () => {
    const userId = "test_user_otp_2";
    const rawEmail = "alex.smith+alias@gmail.com";

    const otp = await generateAndStoreOtp(userId, rawEmail);

    // Check with canonical alias
    const result = await verifyOtpCode(userId, "alexsmith@gmail.com", otp);
    expect(result).toBe(true);
  });
});
