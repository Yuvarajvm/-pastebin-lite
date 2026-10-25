"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/neon-auth/client";
import { AlertTriangleIcon, ShieldCheckIcon, CheckIcon } from "@/components/icons";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  userEmail
}: DeleteAccountModalProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const REQUIRED_CONFIRMATION = "delete me";
  const isMatch = confirmText.trim() === REQUIRED_CONFIRMATION;

  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
      setErrorMessage(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  async function handleDelete() {
    if (!isMatch || isDeleting) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: confirmText.trim() })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete account. Please try again.");
      }

      // Clear client session
      try {
        await authClient.signOut().catch(() => {});
      } catch {}

      // Hard redirect to home with confirmation parameter
      window.location.href = "/?account_deleted=1";
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsDeleting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div className="modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-warning-icon" aria-hidden="true">
            <AlertTriangleIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 id="modal-headline" className="modal-title">
              Delete account
            </h2>
            <p className="modal-subtitle">
              This action requires explicit confirmation.
            </p>
          </div>
        </div>

        {/* Warning Details */}
        <div className="modal-body">
          <div className="danger-alert-box">
            <p>
              <strong>Are you absolutely sure you want to delete your account?</strong>
            </p>
            <p style={{ marginTop: "6px" }}>
              All active sessions for <strong>{userEmail || "your account"}</strong> will be revoked immediately and your account will be soft-deleted.
            </p>
          </div>

          <div className="anti-abuse-notice">
            <span className="notice-icon flex items-center justify-center">
              <ShieldCheckIcon className="w-4 h-4 text-accent" />
            </span>
            <div>
              <strong>Free Trial Anti-Abuse Protection</strong>
              <p>
                To prevent trial loop-holes, this email address will be permanently recorded as having consumed trial access. Creating a new account with this email (or Gmail alias variants) will <strong>not</strong> grant a new free trial.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div role="alert" className="notice notice-error" style={{ margin: "0 0 14px" }}>
              {errorMessage}
            </div>
          )}

          {/* GitHub style confirmation input */}
          <div className="confirmation-input-wrap">
            <label htmlFor="confirm-delete-input">
              To confirm, type <strong className="code-token">delete me</strong> below:
            </label>
            <input
              ref={inputRef}
              id="confirm-delete-input"
              type="text"
              autoComplete="off"
              spellCheck="false"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete me"
              disabled={isDeleting}
              className={`modal-input ${confirmText && !isMatch ? "input-mismatch" : ""} ${isMatch ? "input-matched" : ""}`}
            />
            {confirmText && !isMatch && (
              <span className="input-feedback-error">
                Input must exactly match &quot;delete me&quot;
              </span>
            )}
            {isMatch && (
              <span className="input-feedback-success flex items-center gap-1">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Confirmation matches. Ready to proceed.</span>
              </span>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="secondary-button modal-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isMatch || isDeleting}
            className="danger-button modal-delete-btn"
          >
            {isDeleting ? "Deleting account…" : "I understand, delete my account"}
          </button>
        </div>
      </div>
    </div>
  );
}
