"use client";

import { useState } from "react";
import { MailIcon, ClipboardCopyIcon, CheckIcon } from "@/components/icons";

const ISSUE_CATEGORIES = [
  { id: "bug", label: "Bug Report", subjectPrefix: "[Bug]" },
  { id: "feature", label: "Feature Request", subjectPrefix: "[Feature]" },
  { id: "security", label: "Security Vulnerability", subjectPrefix: "[Security]" },
  { id: "account", label: "Account & Authentication", subjectPrefix: "[Account]" },
  { id: "general", label: "General Inquiry & Feedback", subjectPrefix: "[Inquiry]" }
];

export function ContactForm() {
  const recipientEmail = "yuvarajuab@gmail.com";
  const [category, setCategory] = useState("bug");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const selectedCategory = ISSUE_CATEGORIES.find((c) => c.id === category) || ISSUE_CATEGORIES[0];

  function buildFormattedBody() {
    return [
      `Hello Yuvaraj / Pastebin Lite Team,`,
      ``,
      `--- ISSUE / CONTACT DETAILS ---`,
      `Category: ${selectedCategory.label}`,
      `From: ${name ? name : "Anonymous / Not specified"}`,
      `Sender Email: ${email ? email : "Not specified"}`,
      `Timestamp: ${new Date().toISOString()}`,
      ``,
      `--- MESSAGE CONTENT ---`,
      message.trim() || "[No description provided]",
      ``,
      `-------------------------------`,
      `Sent from Pastebin Lite Contact Form`
    ].join("\n");
  }

  function getMailtoUrl() {
    const fullSubject = `${selectedCategory.subjectPrefix} ${subject.trim() || "Pastebin Lite Feedback"}`;
    const fullBody = buildFormattedBody();
    return `mailto:${recipientEmail}?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(fullBody)}`;
  }

  async function handleCopyTemplate() {
    const textToCopy = `To: ${recipientEmail}\nSubject: ${selectedCategory.subjectPrefix} ${subject.trim() || "Pastebin Lite Feedback"}\n\n${buildFormattedBody()}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  }

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(recipientEmail);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2500);
    } catch {
      // Fallback
    }
  }

  return (
    <div className="contact-form-card">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = getMailtoUrl();
        }}
        className="contact-form"
      >
        <div className="form-group">
          <label htmlFor="issue-category">Issue Category</label>
          <select
            id="issue-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="contact-select"
          >
            {ISSUE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-grid-two">
          <div className="form-group">
            <label htmlFor="contact-name">Your Name</label>
            <input
              id="contact-name"
              type="text"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="contact-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-email">Your Email Address</label>
            <input
              id="contact-email"
              type="email"
              placeholder="e.g. jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="contact-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="contact-subject">Subject / Summary</label>
          <input
            id="contact-subject"
            type="text"
            required
            placeholder="Brief summary of the issue or inquiry"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="contact-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact-message">Detailed Message / Description</label>
          <textarea
            id="contact-message"
            required
            rows={7}
            placeholder="Explain the issue in detail, steps to reproduce, or suggestions for the team..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="contact-textarea"
          ></textarea>
        </div>

        {/* Live Email Preview Box */}
        <div className="email-preview-box">
          <div className="preview-header">
            <span>Pre-formatted Email Preview</span>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="preview-copy-btn flex items-center gap-1"
            >
              {emailCopied ? (
                <>
                  <CheckIcon className="w-3 h-3 text-emerald-500" />
                  <span>Email Copied</span>
                </>
              ) : (
                "Copy Recipient Email"
              )}
            </button>
          </div>
          <pre className="preview-content">
            {`To: ${recipientEmail}\n`}
            {`Subject: ${selectedCategory.subjectPrefix} ${subject || "(Your Subject)"}\n\n`}
            {buildFormattedBody()}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="contact-actions">
          <button type="submit" className="primary-button email-send-btn flex items-center gap-2">
            <MailIcon className="w-4 h-4" />
            <span>Open in Mail Client</span>
          </button>

          <button
            type="button"
            onClick={handleCopyTemplate}
            className="secondary-button flex items-center gap-2"
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4 text-emerald-500" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <ClipboardCopyIcon className="w-4 h-4" />
                <span>Copy Formatted Text</span>
              </>
            )}
          </button>
        </div>

        <p className="contact-help-text">
          Clicking &quot;Open in Mail Client&quot; launches your default email client (Gmail, Apple Mail, Outlook) pre-filled with this structured template. You can also copy the template to paste into any webmail.
        </p>
      </form>
    </div>
  );
}
