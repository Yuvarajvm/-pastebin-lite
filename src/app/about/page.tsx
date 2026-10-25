import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";
import {
  ZapIcon,
  PaletteIcon,
  ClockIcon,
  FlameIcon,
  UserIcon,
  TerminalIcon,
  MailIcon,
  GitHubIcon,
  ExternalLinkIcon
} from "@/components/icons";

export const metadata: Metadata = {
  title: "About — Pastebin Lite",
  description: "Learn about Pastebin Lite: modern, privacy-focused text and code sharing with instant syntax highlighting, burn-after-read limits, and user dashboards."
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell about-page">
        {/* Page Intro */}
        <section className="about-hero">
          <span className="eyebrow">ABOUT THE PLATFORM</span>
          <h1>Engineered for fast, clean, and private snippet sharing.</h1>
          <p className="about-lead">
            Pastebin Lite is a developer-centric pastebin alternative designed to eliminate bloat, popups, and invasive tracking. Whether sharing quick debugging logs, configuration files, or sensitive credentials, Pastebin Lite provides instant delivery with cryptographic security and granular expiration controls.
          </p>
          <div className="about-hero-actions">
            <Link href="/" className="primary-button">
              Create a paste
            </Link>
            <Link href="/contact" className="secondary-button">
              Contact Developer
            </Link>
            <a
              href="https://github.com/Yuvarajvm/-pastebin-lite"
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-button flex items-center gap-1.5"
            >
              <span>GitHub Repository</span>
              <ExternalLinkIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* Creator Credentials Section */}
        <section className="creator-spotlight">
          <div className="creator-spotlight-content">
            <div className="creator-badge-lg">
              <span>Y</span>
            </div>
            <div className="creator-spotlight-text">
              <span className="creator-role-tag">Creator & Lead Architect</span>
              <h2>Yuvaraj VM</h2>
              <p>
                Full-stack developer building modern web applications with Next.js, TypeScript, and serverless database systems. Pastebin Lite was created to provide a lightweight, reliable, and aesthetically refined utility for programmers and teams.
              </p>
              <div className="creator-meta-links">
                <a href="mailto:yuvarajuab@gmail.com" className="creator-link-pill">
                  <MailIcon className="w-3.5 h-3.5 text-accent" />
                  <span>yuvarajuab@gmail.com</span>
                </a>
                <a
                  href="https://github.com/Yuvarajvm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="creator-link-pill"
                >
                  <GitHubIcon className="w-3.5 h-3.5 text-accent" />
                  <span>@Yuvarajvm on GitHub</span>
                </a>
                <span className="creator-link-pill">
                  <span>Worldwide / Remote</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Core Features Breakdown */}
        <section className="features-section">
          <div className="section-heading">
            <span className="eyebrow">KEY CAPABILITIES</span>
            <h2>Everything you need. Nothing you don&apos;t.</h2>
            <p>Explore the features that power Pastebin Lite&apos;s speed and security.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon flex items-center justify-center w-9 h-9 rounded-md bg-surface-subtle border border-border">
                <ZapIcon className="w-5 h-5 text-accent" />
              </div>
              <h3>Zero Bloat &amp; Clean UI</h3>
              <p>
                No third-party advertising, trackers, or endless popups. Pastebin Lite focuses purely on your content with curated typography, harmonious light and dark modes, and instant load times.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon flex items-center justify-center w-9 h-9 rounded-md bg-surface-subtle border border-border">
                <PaletteIcon className="w-5 h-5 text-accent" />
              </div>
              <h3>Multi-Language Syntax Highlighting</h3>
              <p>
                Includes automatic and manual syntax highlighting for JavaScript, TypeScript, Python, JSON, SQL, HTML, CSS, Markdown, Rust, Go, Bash, and Plain Text with theme-aware color palettes.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon flex items-center justify-center w-9 h-9 rounded-md bg-surface-subtle border border-border">
                <ClockIcon className="w-5 h-5 text-accent" />
              </div>
              <h3>Configurable Expiry Limits</h3>
              <p>
                Set snippet lifetimes to 10 minutes, 1 hour, 1 day, 1 week, 1 month, or keep them forever. Once a paste expires, it is permanently inaccessible and returns a clean 404.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon flex items-center justify-center w-9 h-9 rounded-md bg-surface-subtle border border-border">
                <FlameIcon className="w-5 h-5 text-accent" />
              </div>
              <h3>Burn After Read &amp; View Caps</h3>
              <p>
                Need to share a temporary token or sensitive snippet? Cap total allowed views (e.g., 1 view or 10 views). The moment the threshold is reached, the paste self-destructs.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon flex items-center justify-center w-9 h-9 rounded-md bg-surface-subtle border border-border">
                <UserIcon className="w-5 h-5 text-accent" />
              </div>
              <h3>User Accounts &amp; Dashboard</h3>
              <p>
                Optionally sign up or log in via Neon Auth to maintain an authenticated dashboard at <code>/my-pastes</code>. Access all your created pastes, copy URLs in one click, or delete pastes whenever needed.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon flex items-center justify-center w-9 h-9 rounded-md bg-surface-subtle border border-border">
                <TerminalIcon className="w-5 h-5 text-accent" />
              </div>
              <h3>Developer REST API</h3>
              <p>
                Interact programmatically via <code>POST /api/pastes</code> and <code>GET /api/pastes/:id</code>. Script snippets directly from your terminal, CI/CD pipelines, or deployment workflows.
              </p>
            </div>
          </div>
        </section>

        {/* Architecture & Tech Stack */}
        <section className="tech-architecture-section">
          <div className="section-heading">
            <span className="eyebrow">BEHIND THE SCENES</span>
            <h2>Modern Architecture &amp; Engineering</h2>
            <p>Constructed with production-grade tools designed for scalability and durability.</p>
          </div>

          <div className="architecture-grid">
            <div className="arch-card">
              <h4>Next.js 16 App Router</h4>
              <p>
                Leverages React 19 Server Components for minimal client-side JavaScript, instant rendering, and dynamic edge/server proxying.
              </p>
            </div>

            <div className="arch-card">
              <h4>Neon Serverless PostgreSQL</h4>
              <p>
                Cloud-native Postgres with connection pooling, autoscaling compute, and branch isolation to handle high-throughput read/write traffic seamlessly.
              </p>
            </div>

            <div className="arch-card">
              <h4>Drizzle ORM &amp; Zod</h4>
              <p>
                Strict schema validation and end-to-end TypeScript type-safety protect every query and API transaction from SQL injection and malformed inputs.
              </p>
            </div>

            <div className="arch-card">
              <h4>Argon2 &amp; Encrypted Sessions</h4>
              <p>
                User passwords are protected with memory-hard Argon2 hashing, and sessions utilize secure, encrypted, HttpOnly cookies for enterprise-grade defense.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy & Expiration FAQ */}
        <section className="faq-section">
          <div className="section-heading">
            <span className="eyebrow">FREQUENTLY ASKED QUESTIONS</span>
            <h2>How Expiration &amp; Privacy Work</h2>
          </div>

          <div className="faq-list">
            <div className="faq-item">
              <h3>Are my pastes indexed by search engines?</h3>
              <p>
                No. Individual paste pages use strict <code>noindex</code> and private URL identifiers (generated using high-entropy NanoID strings) so your pastes remain accessible only to those who have the link.
              </p>
            </div>

            <div className="faq-item">
              <h3>What happens when a paste expires or exceeds view limits?</h3>
              <p>
                Every read request executes an atomic transactional check. If the current time exceeds <code>expiresAt</code> or <code>viewsCount &gt;= maxViews</code>, the system flags the paste as expired and immediately returns an HTTP 404 Not Found response.
              </p>
            </div>

            <div className="faq-item">
              <h3>Do I need an account to create a paste?</h3>
              <p>
                No! Anyone can create pastes anonymously. Signing up is completely optional and simply gives you a centralized dashboard (<code>/my-pastes</code>) to track and delete your snippets.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="about-cta">
          <h2>Ready to share your next snippet?</h2>
          <p>Get started instantly without signing up, or create an account to manage your pastes.</p>
          <div className="about-hero-actions">
            <Link href="/" className="primary-button">
              Create a paste now
            </Link>
            <Link href="/contact" className="secondary-button">
              Contact the team
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
