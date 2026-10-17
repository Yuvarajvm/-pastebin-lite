# Pastebin Lite

A Next.js paste-sharing application with persistent PostgreSQL storage, optional expiry/view limits, burn-after-read, title/language metadata, syntax highlighting, user authentication (login, signup, session management), a user paste dashboard, and a persisted light/dark theme.

## Local setup

1. Copy `.env.example` to `.env.local` and provide a direct Neon `DATABASE_URL`. Optionally provide `DATABASE_URL_POOLED` for local/Vercel request traffic; Drizzle continues using the direct URL for migrations.
2. Install dependencies: `npm.cmd install` (on PowerShell systems where `npm` is blocked by execution policy).
3. Review generated changes with `npm.cmd run db:generate`, then apply pending migrations with `npm.cmd run db:migrate`.
4. Start the app: `npm.cmd run dev`.

The committed migrations are incremental:
- `0000`: creates the original `pastes` table.
- `0001`: adds `title` and `language` with defaults.
- `0002`: adds `users`, `sessions` tables, and associates pastes with `user_id`.

Do not edit a migration that may already have been applied; make a new migration for every later schema change.

## User Authentication & Dashboard

- **Sign up (`/signup`, `POST /api/auth/signup`)**: Register with username, email, and Argon2-hashed password.
- **Log in (`/login`, `POST /api/auth/login`)**: Log in with either username or email. Secure `httpOnly` 30-day session cookies.
- **Current User (`GET /api/auth/me`)**: Returns active session user (supports both custom sessions and Neon Auth sessions).
- **Log out (`POST /api/auth/logout`)**: Destroys session and clears cookie.
- **My Pastes (`/my-pastes`, `GET /api/user/pastes`)**: Authenticated dashboard to view, copy, and delete user-created pastes.
- **Delete Paste (`DELETE /api/pastes/:id`)**: Allows authenticated owners to delete their own pastes.

## Neon Auth (Managed Better Auth)

- **SDK Package**: `@neondatabase/auth`
- **Server Singleton**: `src/lib/neon-auth/server.ts` (`createNeonAuth`)
- **Client SDK**: `src/lib/neon-auth/client.ts` (`createAuthClient`)
- **Route Handler**: `src/app/api/auth/[...path]/route.ts` proxies Better Auth requests directly to your Neon Auth instance.
- **Environment Variables**:
  - `NEON_AUTH_BASE_URL`: Neon managed auth instance endpoint.
  - `NEXT_PUBLIC_NEON_AUTH_BASE_URL`: Browser-accessible Neon auth instance endpoint.
  - `NEON_AUTH_COOKIE_SECRET`: Secret key for session cookie signing (minimum 32 characters).

## Tests

`npm.cmd test` runs unit, auth validation, and password hashing tests. Set `TEST_DATABASE_URL` to a dedicated database, apply migrations to it, then run `npm.cmd run test:integration` to verify PostgreSQL behaviour and concurrent consumption. Never point this setting at production.

## Deployment handoff

Create a Neon database or branch, configure `DATABASE_URL`, and run `npm.cmd run db:migrate`. Confirm the database has `users`, `sessions`, and `pastes` tables. Set the same server-side variable in Vercel, deploy, then verify `GET /api/healthz`, user signup/login, paste creation, highlighting, theme switching, page reads, expiry, and burn-after-read behavior at the public URL.
