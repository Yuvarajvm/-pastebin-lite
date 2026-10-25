"use client";

import { useState } from "react";
import { LockIcon, MailIcon, KeyIcon, CheckIcon, AlertTriangleIcon } from "@/components/icons";

interface PasswordChangeFormProps {
  userEmail?: string | null;
}

export function PasswordChangeForm({ userEmail }: PasswordChangeFormProps) {
  const [method, setMethod] = useState<"current_password" | "email_otp">("current_password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSendOtp() {
    setIsSendingOtp(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/user/password/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code.");
      }
      setOtpSent(true);
      setStatusMessage(
        data.previewCode
          ? `${data.message} (Test Code: ${data.previewCode})`
          : data.message
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    if (method === "current_password" && !currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }

    if (method === "email_otp" && !otpCode) {
      setErrorMessage("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          currentPassword: method === "current_password" ? currentPassword : undefined,
          otpCode: method === "email_otp" ? otpCode.trim() : undefined,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password.");
      }

      setStatusMessage("Password changed successfully.");
      setCurrentPassword("");
      setOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpSent(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="password-form-card">
      <div className="password-header">
        <div className="flex items-center gap-2">
          <KeyIcon className="w-5 h-5 text-accent" />
          <h3 className="password-title">Change Password</h3>
        </div>
        <p className="password-desc">
          To update your password, verify using your current password or request a one-time verification code sent to your registered email.
        </p>
      </div>

      {/* Verification Method Switcher */}
      <div className="method-tabs">
        <button
          type="button"
          onClick={() => {
            setMethod("current_password");
            setErrorMessage(null);
            setStatusMessage(null);
          }}
          className={`method-tab ${method === "current_password" ? "method-tab-active" : ""}`}
        >
          <LockIcon className="w-4 h-4" />
          <span>Current Password</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMethod("email_otp");
            setErrorMessage(null);
            setStatusMessage(null);
          }}
          className={`method-tab ${method === "email_otp" ? "method-tab-active" : ""}`}
        >
          <MailIcon className="w-4 h-4" />
          <span>Email One-Time Code</span>
        </button>
      </div>

      {statusMessage && (
        <div role="status" className="notice notice-success flex items-start gap-2">
          <CheckIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="notice notice-error flex items-start gap-2">
          <AlertTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" style={{ gap: "16px" }}>
        {method === "current_password" ? (
          <div className="auth-field">
            <label htmlFor="current-password">Current Password</label>
            <input
              id="current-password"
              type="password"
              required
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="contact-input"
            />
          </div>
        ) : (
          <div className="otp-request-block">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="otp-code" style={{ fontSize: "12px", fontWeight: 650 }}>
                Verification Code (OTP)
              </label>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="secondary-button"
                style={{ fontSize: "11px", padding: "4px 10px" }}
              >
                {isSendingOtp ? "Sending code…" : otpSent ? "Resend Code" : "Send Code to Email"}
              </button>
            </div>
            <input
              id="otp-code"
              type="text"
              required
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="contact-input font-mono tracking-widest text-center"
            />
            <p className="field-hint" style={{ marginTop: "4px" }}>
              Code sent to {userEmail || "your registered email"}.
            </p>
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="new-password">New Password</label>
          <input
            id="new-password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="contact-input"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="confirm-new-password">Confirm New Password</label>
          <input
            id="confirm-new-password"
            type="password"
            required
            minLength={8}
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="contact-input"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="primary-button"
          style={{ width: "100%", justifyContent: "center", marginTop: "4px" }}
        >
          {isSubmitting ? "Updating password…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
