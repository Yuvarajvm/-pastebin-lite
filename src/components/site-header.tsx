import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">P</span>
          <span>paste<span className="brand-muted">bin</span></span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/">New paste</Link>
          <Link href="/my-pastes">My pastes</Link>
          <Link href="/#how-it-works">About</Link>
        </nav>
        <div className="header-actions">
          <UserNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

