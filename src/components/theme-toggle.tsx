"use client";

export function ThemeToggle() {
  function toggle() {
    const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("pastebin-lite-theme", next);
  }
  return <button type="button" onClick={toggle} aria-label="Toggle light and dark theme" className="theme-toggle" title="Toggle appearance"><span className="theme-icon" aria-hidden="true">◐</span><span className="theme-label">Theme</span></button>;
}
