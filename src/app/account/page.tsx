"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { authClient } from "@/lib/neon-auth/client";
import { DeleteAccountModal } from "@/components/delete-account-modal";
import { ShieldCheckIcon, DeviceMobileIcon, FileTextIcon, UserIcon } from "@/components/icons";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/auth/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user) {
    return (
      <>
        <SiteHeader />
        <main className="shell composer-page">
          <div className="page-intro">
            <span className="eyebrow">ACCOUNT SETTINGS</span>
            <h1>Account</h1>
            <p>Loading your account details…</p>
          </div>
        </main>
      </>
    );
  }

  const user = session.user;
  const displayName = user.name || (user.email ? user.email.split("@")[0] : "User");

  return (
    <>
      <SiteHeader />
      <main className="shell composer-page">
        <div className="page-intro">
          <span className="eyebrow">ACCOUNT SETTINGS</span>
          <h1>Account &amp; Security</h1>
          <p>Manage your profile, active devices, and security preferences.</p>
        </div>

        {/* Profile Details Card */}
        <div className="account-card" style={{ marginBottom: "24px" }}>
          <div className="account-card-header">
            <div className="creator-avatar" style={{ width: "46px", height: "46px", fontSize: "20px" }}>
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px" }}>
                {displayName}
              </h2>
              <span style={{ color: "var(--muted)", fontSize: "14px" }}>{user.email}</span>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span className="status-badge status-active flex items-center gap-1">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Account Active</span>
              </span>
            </div>
          </div>

          <div className="account-grid" style={{ marginTop: "20px" }}>
            <div className="account-prop">
              <span className="prop-label">Email Address</span>
              <span className="prop-val">{user.email || "Not specified"}</span>
            </div>
            <div className="account-prop">
              <span className="prop-label">User ID</span>
              <span className="prop-val" style={{ fontFamily: "monospace", fontSize: "12px" }}>
                {user.id}
              </span>
            </div>
            <div className="account-prop">
              <span className="prop-label">Free Trial Status</span>
              <span className="prop-val">
                <span className="trial-perk-badge">Standard Account</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="account-card" style={{ marginBottom: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 680, margin: "0 0 16px" }}>
            Account Management
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            <Link
              href="/profile"
              className="quick-link-card"
            >
              <div className="creator-avatar" style={{ width: "40px", height: "40px", background: "var(--surface-subtle)", color: "var(--text)", border: "1px solid var(--border)" }}>
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <strong>User Profile &amp; Password</strong>
                <p>View full credentials and update password with OTP verification.</p>
              </div>
            </Link>

            <Link
              href="/account/sessions"
              className="quick-link-card"
            >
              <div className="creator-avatar" style={{ width: "40px", height: "40px", background: "var(--surface-subtle)", color: "var(--text)", border: "1px solid var(--border)" }}>
                <DeviceMobileIcon className="w-5 h-5" />
              </div>
              <div>
                <strong>Active Sessions &amp; Devices</strong>
                <p>View currently connected devices and revoke unauthorized tokens.</p>
              </div>
            </Link>

            <Link
              href="/my-pastes"
              className="quick-link-card"
            >
              <div className="creator-avatar" style={{ width: "40px", height: "40px", background: "var(--surface-subtle)", color: "var(--text)", border: "1px solid var(--border)" }}>
                <FileTextIcon className="w-5 h-5" />
              </div>
              <div>
                <strong>My Pastes Dashboard</strong>
                <p>Manage, share, and review stats on all your created pastes.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="danger-zone-card">
          <div className="danger-zone-header">
            <div>
              <h3>Danger Zone</h3>
              <p>
                Permanently deactivate your account. To protect against free-trial loopholes, your email will remain flagged to prevent repeat trial claims.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="danger-button-outline"
            >
              Delete account
            </button>
          </div>
        </div>

        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          userEmail={user.email}
        />
      </main>
    </>
  );
}
