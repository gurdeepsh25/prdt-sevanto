# Sevanto — Customer App

Next.js 14 customer-facing web app.

## Stack

- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Zustand (auth state)
- Shadcn-style primitives (button, input, form-field)
- `@sevanto/shared` (types, validators, API client, auth store factory)

## Run

```bash
npm install
npm run dev    # http://localhost:3001
```

## Phase 1 — Auth Pages

- `/` — Landing
- `/signup` — Sign up as Customer (default) or Worker
- `/login` — Email + password
- `/forgot-password` — Send reset link
- `/reset-password?token=...` — Set new password
- `/verify-email?token=...` — Confirm email
- `/dashboard` — Authenticated landing

## Architecture

- `src/app/(auth)/...` — Auth pages (no header chrome)
- `src/app/(dashboard)/...` — Authenticated routes
- `src/components/auth/` — `AuthShell`, `AuthForm`
- `src/components/ui/` — `Button`, `Input`, `FormField`
- `src/hooks/use-api.ts` — Memoized `ApiClient` wired to Zustand
- `src/stores/auth.ts` — Persisted auth store
- `src/lib/`, `src/types/` — Local helpers (use `@sevanto/shared` for shared types)

## Environment

`NEXT_PUBLIC_API_BASE_URL` — defaults to `http://localhost:3000`.

```

```
