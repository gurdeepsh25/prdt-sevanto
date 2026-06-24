# Sevanto — Server

Backend API for the **Sevanto** hyperlocal workforce marketplace.

## Stack

- Node.js 20 LTS
- Express 4 + TypeScript
- PostgreSQL 15 + Prisma 5
- Redis (rate limiting, session denylist, future queue)
- JWT (HS256) + rotating refresh tokens
- Argon2id password hashing
- Zod validation
- Pino structured logging
- Helmet + CORS + rate limiting
- Swagger / OpenAPI 3.1

## Phase Status

- ✅ **Phase 1 — Authentication** (current)

## Quick Start

```bash
# 1. Install
npm install

# 2. Copy environment
cp .env.example .env
# Edit .env to set DATABASE_URL, JWT secrets, mail, etc.

# 3. Generate Prisma client
npm run prisma:generate

# 4. Run migrations (requires reachable Postgres)
npm run prisma:migrate:dev

# 5. Seed admin
npm run prisma:seed

# 6. Start dev server
npm run dev
```

Server runs on `http://localhost:3000`.

- Health: `GET /healthz`
- API docs: `GET /docs` (Swagger UI)
- OpenAPI JSON: `GET /openapi.json`
- API base: `/api/v1`

## Scripts

| Script                          | Purpose                         |
| ------------------------------- | ------------------------------- |
| `npm run dev`                   | Hot-reload server               |
| `npm run build`                 | Compile to `dist/`              |
| `npm start`                     | Run compiled server             |
| `npm run typecheck`             | TypeScript check                |
| `npm run lint`                  | ESLint                          |
| `npm test`                      | All tests                       |
| `npm run test:unit`             | Unit tests only                 |
| `npm run test:integration`      | Integration tests (requires DB) |
| `npm run prisma:migrate:dev`    | Dev migration                   |
| `npm run prisma:migrate:deploy` | Production migration            |
| `npm run prisma:seed`           | Seed admin user                 |
| `npm run prisma:studio`         | Prisma Studio GUI               |

## Phase 1 Endpoints

| Method | Path                               | Auth   | Description            |
| ------ | ---------------------------------- | ------ | ---------------------- |
| POST   | `/api/v1/auth/signup`              | Public | Create account         |
| POST   | `/api/v1/auth/login`               | Public | Issue access + refresh |
| POST   | `/api/v1/auth/refresh`             | Public | Rotate tokens          |
| POST   | `/api/v1/auth/logout`              | Public | Revoke refresh         |
| GET    | `/api/v1/auth/verify-email?token=` | Public | Confirm verification   |
| POST   | `/api/v1/auth/resend-verification` | Public | Resend link            |
| POST   | `/api/v1/auth/forgot-password`     | Public | Email reset link       |
| POST   | `/api/v1/auth/reset-password`      | Public | Set new password       |
| GET    | `/api/v1/auth/me`                  | Bearer | Current user           |

## Folder Layout

```
server/
├── src/
│   ├── modules/        # auth, users, ... (feature modules)
│   ├── common/         # errors, middlewares, utils, validators
│   ├── infra/          # prisma, redis, mail, logger
│   ├── config/         # env
│   ├── openapi/        # registry + doc builder
│   ├── app.ts          # Express app factory
│   └── server.ts       # entrypoint
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── .env.example
```

## Security

- Argon2id password hashing.
- HS256 JWT access (15 min) + opaque rotating refresh (30 days).
- Refresh tokens hashed at rest (SHA-256).
- Refresh-token **reuse detection** revokes the entire token family.
- Login throttling + 15-min lockout after 5 failed attempts (Redis-backed).
- HTTP-only, Secure, SameSite=Lax cookies (recommended for web clients).
- Helmet + CORS allowlist + per-IP rate limiting.
- Constant-time password comparison via argon2.
- PII redaction in logs.
- No secrets in code or logs.

## Testing

- **23 unit tests** pass out of the box (no DB required).
- Integration tests scaffolded with `describe.skip` — enable after running migrations.
- See `tests/integration/README.md`.

## Notes for Production

- Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to long random values (≥32 chars).
- Configure `MAIL_*` for real SMTP (Postmark / SES / Resend).
- Set `REDIS_URL` for distributed rate-limiting.
- Run `npm run prisma:migrate:deploy` on every deploy.
- Place behind Nginx for TLS termination.
- Enable Sentry SDK in `infra/logger/logger.ts` (already abstracted).
