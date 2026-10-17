"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/neon-auth/client";

export function UserNav() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await authClient.signOut().catch(() => {});
    } catch {
      // Continue even if client signOut fails
    }

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
    } catch {
      // Continue even if network request fails
    }

    window.location.href = "/";
  }

  if (isPending) {
    return <div className="account-nav-placeholder" aria-hidden="true" />;
  }

  if (session?.user) {
    const user = session.user;
    const displayName = user.name || (user.email ? user.email.split("@")[0] : "User");
    const avatarLetter = displayName.slice(0, 1).toUpperCase();

    return (
      <div className="account-nav logged-in">
        <Link href="/my-pastes" className="user-badge" title="View your pastes">
          <span className="user-avatar" aria-hidden="true">
            {avatarLetter}
          </span>
          <span className="username-text">{displayName}</span>
        </Link>
        <Link
          href="/account/sessions"
          className="login-link"
          style={{ fontSize: "12px", padding: "6px 8px" }}
          title="Manage active devices and sessions"
        >
          Sessions
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="logout-button"
          title="Sign out of your account"
        >
          {loggingOut ? "…" : "Log out"}
        </button>
      </div>
    );
  }

  return (
    <div className="account-nav">
      <Link href="/auth/sign-in" className="login-link">
        Log in
      </Link>
      <Link href="/auth/sign-up" className="signup-link">
        Sign up
      </Link>
    </div>
  );
}
