"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { authClient } from "@/lib/neon-auth/client";
import { PasswordChangeForm } from "@/components/password-change-form";
import { DeleteAccountModal } from "@/components/delete-account-modal";
import {
  UserIcon,
  MailIcon,
  ShieldCheckIcon,
  ClockIcon,
  FileTextIcon,
  DeviceMobileIcon,
  ExternalLinkIcon
} from "@/components/icons";

export default function UserProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [pasteCount, setPasteCount] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/auth/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/pastes")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data?.pastes)) {
            setPasteCount(data.pastes.length);
          } else {
            setPasteCount(0);
          }
        })
        .catch(() => setPasteCount(0));
    }
  }, [session]);

  if (isPending || !session?.user) {
    return (
      <>
        <SiteHeader />
        <main className="shell composer-page">
          <div className="page-intro">
            <span className="eyebrow">USER PROFILE</span>
            <h1>Profile &amp; Settings</h1>
            <p>Loading profile information…</p>
          </div>
        </main>
      </>
    );
  }

  const user = session.user;
  const displayName = user.name || (user.email ? user.email.split("@")[0] : "User");
  const avatarLetter = displayName.slice(0, 1).toUpperCase();
  const memberSince = (user as any).createdAt
    ? new Date((user as any).createdAt).toLocaleDateString()
    : "Current Session";

  return (
    <>
      <SiteHeader />
      <main className="shell profile-page" style={{ paddingBlock: "50px 80px" }}>
        {/* Intro */}
        <div className="page-intro flex justify-between items-start flex-wrap gap-4">
          <div>
            <span className="eyebrow">ACCOUNT PROFILE</span>
            <h1>User Profile &amp; Security</h1>
            <p>View your account credentials, security status, and manage password settings.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/my-pastes"
              className="secondary-button"
              style={{ fontSize: "13px" }}
            >
              <FileTextIcon className="w-4 h-4 mr-1.5" />
              My Pastes
            </Link>
            <Link
              href="/account/sessions"
              className="secondary-button"
              style={{ fontSize: "13px" }}
            >
              <DeviceMobileIcon className="w-4 h-4 mr-1.5" />
              Active Sessions
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="account-card" style={{ marginBottom: "28px" }}>
          <div className="account-card-header flex items-center gap-4 flex-wrap">
            <div className="creator-avatar" style={{ width: "52px", height: "52px", fontSize: "22px" }}>
              {avatarLetter}
            </div>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 750, margin: "0 0 4px" }}>
                {displayName}
              </h2>
              <div className="flex items-center gap-2 text-muted" style={{ fontSize: "13px" }}>
                <MailIcon className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <span className="status-badge status-active flex items-center gap-1.5">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Account Active</span>
              </span>
            </div>
          </div>

          <div className="account-grid" style={{ marginTop: "24px" }}>
            <div className="account-prop">
              <span className="prop-label flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5" /> Username
              </span>
              <span className="prop-val">{displayName}</span>
            </div>

            <div className="account-prop">
              <span className="prop-label flex items-center gap-1">
                <MailIcon className="w-3.5 h-3.5" /> Primary Email
              </span>
              <span className="prop-val">{user.email || "Not specified"}</span>
            </div>

            <div className="account-prop">
              <span className="prop-label flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5" /> Member Since
              </span>
              <span className="prop-val">{memberSince}</span>
            </div>

            <div className="account-prop">
              <span className="prop-label flex items-center gap-1">
                <FileTextIcon className="w-3.5 h-3.5" /> Pastes Stored
              </span>
              <span className="prop-val">
                {pasteCount !== null ? pasteCount : "Loading…"}
              </span>
            </div>

            <div className="account-prop">
              <span className="prop-label">User ID</span>
              <span className="prop-val font-mono" style={{ fontSize: "12px" }}>
                {user.id}
              </span>
            </div>

            <div className="account-prop">
              <span className="prop-label">Free Trial Entitlement</span>
              <span className="prop-val">
                <span className="trial-perk-badge">Standard Tier</span>
              </span>
            </div>
          </div>
        </div>

        {/* Password Management & Security Section */}
        <div className="account-card" style={{ marginBottom: "28px" }}>
          <PasswordChangeForm userEmail={user.email} />
        </div>

        {/* Quick Navigation Cards */}
        <div className="account-card" style={{ marginBottom: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 680, margin: "0 0 16px" }}>
            Connected Services &amp; Activity
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            <Link href="/my-pastes" className="quick-link-card">
              <div className="creator-avatar" style={{ width: "40px", height: "40px", background: "var(--surface-subtle)", color: "var(--text)", border: "1px solid var(--border)" }}>
                <FileTextIcon className="w-5 h-5" />
              </div>
              <div>
                <strong>My Pastes Dashboard</strong>
                <p>Browse, review view limits, and manage your stored snippets.</p>
              </div>
            </Link>

            <Link href="/account/sessions" className="quick-link-card">
              <div className="creator-avatar" style={{ width: "40px", height: "40px", background: "var(--surface-subtle)", color: "var(--text)", border: "1px solid var(--border)" }}>
                <DeviceMobileIcon className="w-5 h-5" />
              </div>
              <div>
                <strong>Active Sessions &amp; Devices</strong>
                <p>Inspect active login tokens and revoke unauthorized devices.</p>
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
                Permanently deactivate your account. To protect against free-trial loopholes, your email will remain recorded to prevent repeat trial claims.
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
