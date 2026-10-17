# Pastebin Lite — Pastebin-Inspired UI and Core Features

## Summary

Redesign the app as an original, editor-first Pastebin-style experience with a compact header, large paste editor, optional settings panel, and persisted light/dark theme. Add functional titles, language-aware syntax highlighting, expiry presets, and burn-after-read behavior while retaining the existing atomic expiry/view-count guarantees.

## Implementation Changes

- Replace the current landing page with a responsive two-column paste composer:
  - Header with product mark, lightweight navigation labels, “New paste” action, and accessible theme toggle.
  - Large editor with title field, line-number presentation, character count, language selector, and “syntax highlighting” control.
  - Optional settings: expiry preset (`Never`, 10 minutes, 1 hour, 1 day, 1 week, custom seconds), maximum views, and burn-after-read.
  - Burn-after-read sets `max_views` to `1`, disables the competing maximum-view control, and is communicated clearly before submission.
  - Success state shows the share URL, copy feedback, selected limits, and a create-another-paste action.
- Add a client-side theme provider:
  - Default from the operating-system color preference.
  - Allow light/dark switching from the header.
  - Persist the selected theme in `localStorage`, apply it before visible paint where possible, and use semantic CSS variables so every page—including unavailable states—updates consistently.
- Extend paste persistence, validation, API responses, and migration:
  - Add non-null `title` with a default of `Untitled`, capped at 120 characters.
  - Add non-null `language` with `text` as the default; accept only the supported values: plain text, JavaScript, TypeScript, JSON, Python, HTML, CSS, SQL, and Bash.
  - Keep `expires_at`, `max_views`, and atomic `views_count` consumption unchanged.
  - Extend `POST /api/pastes` to accept optional `title` and `language`; retain the existing response fields and add title/language where the client requires them.
  - Extend `GET /api/pastes/:id` to return title/language with the consumed paste.
- Update the shared paste page:
  - Render title, language badge, creation/expiry/view metadata, copy action, and source text in a readable code panel.
  - Apply server-safe language highlighting for supported languages; fall back safely to escaped plain text for unknown/legacy values.
  - Keep the page dynamic and invoke the shared consume service exactly once.

## Test Plan

- Update validation tests for default title/language, title length, supported-language enforcement, expiry presets/custom TTL conversion, and burn-after-read mapping.
- Add service/API integration coverage confirming title/language persistence and that a burn-after-read paste permits exactly one successful retrieval under concurrent access.
- Add component-level tests for theme preference restoration, accessible theme switching, disabled max-views behavior while burn-after-read is active, and successful copy feedback.
- Run lint, unit tests, PostgreSQL integration tests with `TEST_DATABASE_URL`, and a production build after migration generation.

## Assumptions

- The reference screenshots guide layout density and dark styling only; no Pastebin branding, public-paste feed, tags, categories, accounts, folders, social login, advertising, cookie prompts, password protection, or visibility modes will be added.
- “Burn after read” means exactly one successful page or API retrieval, using the existing retained-but-unavailable record model rather than deleting the row.
- Existing records receive `Untitled` and `text` through migration defaults so current shared links remain compatible.
