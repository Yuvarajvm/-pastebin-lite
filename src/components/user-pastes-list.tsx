"use client";

import Link from "next/link";
import { useState } from "react";
import type { Paste } from "@/lib/db/schema";
import { getAppOrigin } from "@/lib/api";
import { FileTextIcon } from "@/components/icons";

type UserPastesListProps = {
  initialPastes: Paste[];
};

export function UserPastesList({ initialPastes }: UserPastesListProps) {
  const [pastes, setPastes] = useState<Paste[]>(initialPastes);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function copyLink(id: string) {
    const origin = getAppOrigin();
    const url = `${origin}/p/${id}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/pastes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to delete paste.");
      }
      setPastes((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not delete paste.");
    } finally {
      setDeletingId(null);
    }
  }

  if (pastes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon flex justify-center">
          <FileTextIcon className="w-10 h-10 text-muted" size={40} />
        </div>
        <h2>No pastes found</h2>
        <p>You haven&apos;t created any pastes yet while logged in.</p>
        <Link href="/" className="primary-button">
          Create your first paste
        </Link>
      </div>
    );
  }

  return (
    <div className="pastes-container">
      {errorMessage && (
        <div role="alert" className="notice notice-error mb-4">
          {errorMessage}
        </div>
      )}
      <div className="pastes-grid">
        {pastes.map((paste) => {
          const now = new Date();
          const isExpired = paste.expiresAt ? new Date(paste.expiresAt) <= now : false;
          const isViewLimitReached = paste.maxViews ? paste.viewsCount >= paste.maxViews : false;
          const isUnavailable = isExpired || isViewLimitReached;

          let statusLabel = "Active";
          let statusClass = "status-active";
          if (isViewLimitReached) {
            statusLabel = "View limit reached";
            statusClass = "status-expired";
          } else if (isExpired) {
            statusLabel = "Expired";
            statusClass = "status-expired";
          }

          return (
            <div key={paste.id} className="paste-card">
              <div className="paste-card-header">
                <div>
                  <h2 className="paste-card-title">
                    <Link href={`/p/${paste.id}`}>{paste.title}</Link>
                  </h2>
                  <div className="paste-card-meta">
                    <span className="lang-tag">{paste.language}</span>
                    <span>Created {new Date(paste.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
              </div>

              <div className="paste-card-stats">
                <div className="stat-item">
                  <span className="stat-label">Views</span>
                  <span className="stat-val">
                    {paste.viewsCount}
                    {paste.maxViews ? ` / ${paste.maxViews}` : " (unlimited)"}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Expires</span>
                  <span className="stat-val">
                    {paste.expiresAt ? new Date(paste.expiresAt).toLocaleString() : "Never"}
                  </span>
                </div>
              </div>

              <div className="paste-card-actions">
                <Link href={`/p/${paste.id}`} className="card-action-link">
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => copyLink(paste.id)}
                  className="card-action-btn"
                  title="Copy share link"
                >
                  {copiedId === paste.id ? "Copied!" : "Copy link"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(paste.id, paste.title)}
                  disabled={deletingId === paste.id}
                  className="card-action-btn delete-btn"
                  title="Delete paste"
                >
                  {deletingId === paste.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
