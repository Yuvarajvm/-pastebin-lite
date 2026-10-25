import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "./providers";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pastebin Lite — Fast, Private Text & Code Sharing",
  description: "Share plain text and code snippets with instant syntax highlighting, burn-after-read security, and configurable expiry limits."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `try { const stored = localStorage.getItem('pastebin-lite-theme'); if (stored === 'dark' || stored === 'light') { document.documentElement.dataset.theme = stored; document.documentElement.classList.toggle('dark', stored === 'dark'); document.documentElement.style.colorScheme = stored; } } catch {}`;
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Providers>
          <div className="app-layout">
            <div className="app-content">{children}</div>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
