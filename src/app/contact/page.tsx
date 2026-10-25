import { SiteHeader } from "@/components/site-header";
import { ContactForm } from "@/components/contact-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Pastebin Lite",
  description: "Get in touch with creator Yuvaraj VM and the Pastebin Lite team for bug reports, feature requests, or support."
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell contact-page">
        {/* Intro */}
        <section className="contact-hero">
          <span className="eyebrow">SUPPORT &amp; INQUIRIES</span>
          <h1>Contact the Team</h1>
          <p className="contact-lead">
            Whether you ran into a bug, want to suggest a new capability, or have security questions, we want to hear from you. Use our pre-formatted email generator or reach out directly.
          </p>
        </section>

        {/* Two-Column Grid: Direct Info on Left, Form on Right */}
        <div className="contact-layout">
          {/* Left Column: Creator & Direct Info */}
          <aside className="contact-info-panel">
            <div className="info-card developer-card">
              <span className="card-badge">DIRECT CONTACT</span>
              <h2>Yuvaraj VM</h2>
              <p className="card-sub">Creator &amp; Maintainer of Pastebin Lite</p>

              <div className="contact-channels">
                <div className="channel-item">
                  <div className="channel-icon">✉️</div>
                  <div>
                    <span className="channel-label">Direct Email</span>
                    <a href="mailto:yuvarajuab@gmail.com" className="channel-value">
                      yuvarajuab@gmail.com
                    </a>
                  </div>
                </div>

                <div className="channel-item">
                  <div className="channel-icon">🐙</div>
                  <div>
                    <span className="channel-label">GitHub Profile</span>
                    <a
                      href="https://github.com/Yuvarajvm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="channel-value"
                    >
                      github.com/Yuvarajvm ↗
                    </a>
                  </div>
                </div>

                <div className="channel-item">
                  <div className="channel-icon">📁</div>
                  <div>
                    <span className="channel-label">GitHub Repository</span>
                    <a
                      href="https://github.com/Yuvarajvm/-pastebin-lite"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="channel-value"
                    >
                      Yuvarajvm/-pastebin-lite ↗
                    </a>
                  </div>
                </div>

                <div className="channel-item">
                  <div className="channel-icon">🐛</div>
                  <div>
                    <span className="channel-label">Public Bug Tracker</span>
                    <a
                      href="https://github.com/Yuvarajvm/-pastebin-lite/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="channel-value"
                    >
                      Open a GitHub Issue ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card guidelines-card">
              <h3>Expected Response Times</h3>
              <p>
                We typically review and respond to inquiries within <strong>24 to 48 hours</strong>. For critical bugs or security disclosures, please include <code>[Security]</code> in your subject line for expedited triage.
              </p>
              <ul className="guidelines-list">
                <li>Provide reproducible code steps for bug reports.</li>
                <li>Never include live production database secrets or real passwords in unencrypted emails.</li>
                <li>Include your browser and operating system details if reporting visual issues.</li>
              </ul>
            </div>
          </aside>

          {/* Right Column: Pre-formatted Email Form */}
          <section className="contact-form-panel">
            <div className="panel-header">
              <h2>Send a Pre-Formatted Message</h2>
              <p>
                Select your category below to automatically generate an email template ready to send or copy.
              </p>
            </div>
            <ContactForm />
          </section>
        </div>
      </main>
    </>
  );
}
