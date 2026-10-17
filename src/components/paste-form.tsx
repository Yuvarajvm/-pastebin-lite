"use client";

import { FormEvent, useMemo, useState } from "react";

type CreateResult = { url: string; title: string; language: string };
const expiryOptions = [{ label: "Never", value: "" }, { label: "10 minutes", value: "600" }, { label: "1 hour", value: "3600" }, { label: "1 day", value: "86400" }, { label: "1 week", value: "604800" }, { label: "Custom", value: "custom" }];
const languages = [["text", "Plain text"], ["javascript", "JavaScript"], ["typescript", "TypeScript"], ["json", "JSON"], ["python", "Python"], ["html", "HTML"], ["css", "CSS"], ["sql", "SQL"], ["bash", "Bash"]] as const;

export function PasteForm() {
  const [title, setTitle] = useState(""); const [content, setContent] = useState(""); const [language, setLanguage] = useState("text");
  const [expiry, setExpiry] = useState(""); const [customTtl, setCustomTtl] = useState(""); const [maxViews, setMaxViews] = useState("");
  const [burnAfterRead, setBurnAfterRead] = useState(false); const [result, setResult] = useState<CreateResult | null>(null);
  const [error, setError] = useState<string | null>(null); const [pending, setPending] = useState(false); const [copied, setCopied] = useState(false);
  const characterCount = useMemo(() => new TextEncoder().encode(content).byteLength, [content]);
  const ttl = expiry === "custom" ? customTtl : expiry;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null); setResult(null); setPending(true);
    const body: Record<string, unknown> = { title, content, language };
    if (ttl) body.ttl_seconds = Number(ttl);
    if (burnAfterRead) body.max_views = 1; else if (maxViews) body.max_views = Number(maxViews);
    try {
      const response = await fetch("/api/pastes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json() as CreateResult & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not create paste.");
      setResult(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create paste."); }
    finally { setPending(false); }
  }
  async function copyLink() { if (result) { await navigator.clipboard.writeText(result.url); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } }

  return <form onSubmit={submit} className="composer">
    <div className="composer-bar"><label>Paste title <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Untitled" /></label>
      <label>Language <select value={language} onChange={(e) => setLanguage(e.target.value)}>{languages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
    <div className="editor-wrap"><div className="editor-heading"><span>New paste</span><span>{characterCount.toLocaleString()} / 1,048,576 bytes</span></div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={18} maxLength={1_048_576} spellCheck="false" className="paste-editor" placeholder="Write or paste your text here…" /></div>
    <fieldset className="paste-settings"><legend>Optional paste settings</legend><div className="settings-grid">
      <label>Paste expiration <select value={expiry} onChange={(e) => setExpiry(e.target.value)}>{expiryOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}</select></label>
      {expiry === "custom" && <label>Custom seconds <input type="number" min="1" max="31536000" value={customTtl} onChange={(e) => setCustomTtl(e.target.value)} required placeholder="1–31,536,000" /></label>}
      <label>Maximum views <input type="number" min="1" max="1000000" value={burnAfterRead ? "1" : maxViews} disabled={burnAfterRead} onChange={(e) => setMaxViews(e.target.value)} placeholder="Unlimited" /></label>
      <label className="checkbox-row"><input type="checkbox" checked={burnAfterRead} onChange={(e) => setBurnAfterRead(e.target.checked)} /><span><strong>Burn after read</strong><small>Allow exactly one successful view.</small></span></label>
    </div></fieldset>
    <div className="form-actions"><button disabled={pending} className="primary-button">{pending ? "Creating…" : "Create new paste"}</button><span>Limits are enforced server-side.</span></div>
    {error && <p role="alert" className="notice notice-error">{error}</p>}
    {result && <section className="notice notice-success" aria-live="polite"><strong>{result.title} is ready to share.</strong><div><input readOnly value={result.url} aria-label="Share URL" /><button type="button" onClick={copyLink}>{copied ? "Copied" : "Copy link"}</button></div></section>}
  </form>;
}
