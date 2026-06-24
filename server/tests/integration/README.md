# 🧪 Phase 1 — Backend Integration Tests

The integration suite in `tests/integration/` is **scaffolded** with `describe.skip`
blocks so unit tests can run in any environment. To enable it:

## Setup

1. Start a Postgres database reachable via `DATABASE_URL`.
2. Run `npx prisma migrate dev` to create the schema.
3. Optionally start MailHog or any SMTP on port 1025 to capture emails.
4. Run `npm run test:integration`.

The suite uses **supertest** to hit a real Express app and a real Prisma client.

## Recommended approach for CI

Spin up ephemeral Postgres via GitHub Actions service containers or testcontainers:

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: sevanto
      POSTGRES_PASSWORD: sevanto
      POSTGRES_DB: sevanto
    ports: ["5432:5432"]
    options: --health-cmd pg_isready --health-interval 10s
```

`tests/integration/auth.test.ts` covers the full signup → verify → login → refresh → logout flow.
