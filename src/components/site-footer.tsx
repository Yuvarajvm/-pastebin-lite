import Link from "next/link";
import { ExternalLinkIcon } from "@/components/icons";

export function SiteFooter() {
  const currentYear = 2026;

  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-top">
          {/* Creator & Brand Summary */}
          <div className="footer-brand-col">
            <Link href="/" className="brand">
              <span className="brand-mark">P</span>
              <span>paste<span className="brand-muted">bin</span></span>
            </Link>
            <p className="footer-tagline">
              A minimalist, privacy-first text and code snippet sharing service with instant syntax highlighting, ephemeral expiry, and burn-after-read controls.
            </p>
            <div className="creator-card">
              <div className="creator-avatar">Y</div>
              <div className="creator-info">
                <span className="creator-label">Created & Developed by</span>
                <span className="creator-name">Yuvaraj VM</span>
                <a
                  href="mailto:yuvarajuab@gmail.com"
                  className="creator-email"
                >
                  yuvarajuab@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="footer-nav-col">
            <h3>Navigation</h3>
            <ul>
              <li><Link href="/">Create Paste</Link></li>
              <li><Link href="/my-pastes">My Dashboard</Link></li>
              <li><Link href="/profile">User Profile</Link></li>
              <li><Link href="/about">About Pastebin Lite</Link></li>
              <li><Link href="/contact">Contact & Support</Link></li>
            </ul>
          </div>

          {/* Developer & Social */}
          <div className="footer-nav-col">
            <h3>Developer & Links</h3>
            <ul>
              <li>
                <a
                  href="https://github.com/Yuvarajvm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <span>GitHub Profile (@Yuvarajvm)</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Yuvarajvm/-pastebin-lite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <span>Source Repository</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Yuvarajvm/-pastebin-lite/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <span>Report an Issue</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="mailto:yuvarajuab@gmail.com" className="flex items-center gap-1">
                  <span>Direct Email Inquiry</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Architecture / Tech Stack */}
          <div className="footer-nav-col">
            <h3>Stack & Security</h3>
            <ul>
              <li><span className="tech-badge">Next.js 16 App Router</span></li>
              <li><span className="tech-badge">Neon Serverless Postgres</span></li>
              <li><span className="tech-badge">Drizzle ORM & TypeScript</span></li>
              <li><span className="tech-badge">Argon2 & Neon Auth</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and metadata */}
        <div className="footer-bottom">
          <p>© {currentYear} Pastebin Lite. Designed & Engineered by <strong>Yuvaraj VM</strong>.</p>
          <div className="footer-badges">
            <span className="status-indicator">
              <span className="status-dot"></span> Neon DB Active
            </span>
            <span className="footer-license">MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
