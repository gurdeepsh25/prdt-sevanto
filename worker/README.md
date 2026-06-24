# Sevanto — Worker App

Next.js 14 worker-facing web app.

## Run

```bash
npm install
npm run dev    # http://localhost:3002
```

## Phase 1 — Auth Pages

- `/` — Worker landing
- `/signup` — Sign up as **WORKER**
- `/login`, `/forgot-password`, `/reset-password`, `/verify-email`
- `/dashboard` — Authenticated landing

## Architecture

Same as `client/`. Uses `@sevanto/shared` for all cross-app types and the API client.

```

```
