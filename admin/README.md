# Sevanto — Admin App

Next.js 14 admin dashboard. Login-only (no public signup; admin accounts provisioned out-of-band).

## Run

```bash
npm install
npm run dev    # http://localhost:3003
```

## Phase 1 — Auth Pages

- `/` — Landing
- `/login` — Admin sign-in (rejects non-ADMIN roles)
- `/dashboard` — Authenticated dashboard shell

## Architecture

Same shared package as the other apps. The login form explicitly rejects non-`ADMIN` user roles client-side; the server `requireRole('ADMIN')` guard is the source of truth.

```

```
