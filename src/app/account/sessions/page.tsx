"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { authClient } from "@/lib/neon-auth/client";

interface ActiveSession {
  id: string;
  token?: string;
  userId?: string;
  createdAt?: string | Date;
  expiresAt?: string | Date;
  userAgent?: string | null;
  ipAddress?: string | null;
  isCurrent?: boolean;
}

export default function AccountSessionsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [sessions, setSessions] = useState<ActiveSession[] | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const loading = isPending || (Boolean(session?.user) && sessions === null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/auth/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    let active = true;
    if (!session?.user) {
      return;
    }

    const fetchSessions = async () => {
      try {
        if (typeof authClient.listSessions === "function") {
          const res: any = await authClient.listSessions();
          if (!active) return;
          if (res?.data) {
            const list = Array.isArray(res.data) ? res.data : [res.data];
            setSessions(
              list.map((s: any) => ({
                id: s.id || s.token || "session-active",
                token: s.token,
                userId: s.userId,
                createdAt: s.createdAt,
                expiresAt: s.expiresAt,
                userAgent: s.userAgent,
                ipAddress: s.ipAddress,
                isCurrent: s.id === session?.session?.id || s.token === session?.session?.token || true
              }))
            );
            return;
          }
        }
      } catch {
        if (!active) return;
        if (session?.session) {
          setSessions([
            {
              id: session.session.id || "current",
              expiresAt: session.session.expiresAt,
              createdAt: session.session.createdAt,
              isCurrent: true
            }
          ]);
          return;
        }
      }
      if (active) {
        setSessions([]);
      }
    };

    Promise.resolve().then(fetchSessions);

    return () => {
      active = false;
    };
  }, [session, isPending, refreshIndex]);

  async function handleRevoke(sessionId: string, token?: string) {
    setRevokingId(sessionId);
    setMessage(null);
    setError(null);
    try {
      if (typeof authClient.revokeSession === "function") {
        await authClient.revokeSession({ token: token || sessionId });
      }
      setMessage("Session revoked successfully.");
      setRefreshIndex((idx) => idx + 1);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke session.");
    } finally {
      setRevokingId(null);
    }
  }

  async function handleRevokeOthers() {
    setRevokingOthers(true);
    setMessage(null);
    setError(null);
    try {
      if (typeof authClient.revokeOtherSessions === "function") {
        await authClient.revokeOtherSessions();
      }
      setMessage("All other sessions revoked successfully.");
      setRefreshIndex((idx) => idx + 1);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke other sessions.");
    } finally {
      setRevokingOthers(false);
    }
  }

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="shell composer-page">
          <div className="page-intro">
            <span className="eyebrow">ACCOUNT</span>
            <h1>Active Sessions</h1>
            <p>Loading session information…</p>
          </div>
        </main>
      </>
    );
  }

  const sessionList = sessions ?? [];

  return (
    <>
      <SiteHeader />
      <main className="shell composer-page">
        <div className="page-intro flex justify-between items-start">
          <div>
            <span className="eyebrow">SECURITY & ACCESS</span>
            <h1>Active Sessions</h1>
            <p>
              Manage devices and active sessions authenticated via Neon Auth for{" "}
              <strong>{session?.user?.email}</strong>.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/my-pastes" className="primary-button" style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border)" }}>
              ← My Pastes
            </Link>
          </div>
        </div>

        {message && (
          <div role="status" className="notice notice-success" style={{ margin: "0 0 20px" }}>
            {message}
          </div>
        )}

        {error && (
          <div role="alert" className="notice notice-error" style={{ margin: "0 0 20px" }}>
            {error}
          </div>
        )}

        <div className="composer" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "680", margin: "0 0 4px" }}>
                Active Devices &amp; Tokens
              </h2>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                Revoking a session will immediately sign out that device.
              </span>
            </div>
            {sessionList.length > 1 && (
              <button
                type="button"
                onClick={handleRevokeOthers}
                disabled={revokingOthers}
                className="logout-button"
                style={{ borderColor: "var(--border)", padding: "7px 12px" }}
              >
                {revokingOthers ? "Revoking…" : "Revoke all other sessions"}
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sessionList.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--muted)" }}>
                <p>Current session is active via Neon Auth.</p>
              </div>
            ) : (
              sessionList.map((s, index) => (
                <div
                  key={s.id || index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    borderRadius: "8px",
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--border)"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 650, fontSize: "14px" }}>
                        {s.userAgent ? s.userAgent.slice(0, 48) : "Active Web Session"}
                      </span>
                      {s.isCurrent && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: "12px",
                            background: "var(--accent)",
                            color: "var(--surface)"
                          }}
                        >
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", display: "flex", gap: "12px" }}>
                      {s.createdAt && (
                        <span>Started: {new Date(s.createdAt).toLocaleDateString()}</span>
                      )}
                      {s.expiresAt && (
                        <span>Expires: {new Date(s.expiresAt).toLocaleDateString()}</span>
                      )}
                      {s.ipAddress && <span>IP: {s.ipAddress}</span>}
                    </div>
                  </div>

                  {!s.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(s.id, s.token)}
                      disabled={revokingId === s.id}
                      className="logout-button"
                      style={{ color: "#a23b3b", borderColor: "#f1c9c9" }}
                    >
                      {revokingId === s.id ? "Revoking…" : "Revoke"}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
