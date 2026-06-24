# 01 — Tech Stack Summary (Final Decisions)

> Single source of truth for **what** we will build on. Tag per system: **MVP / Pre-Launch / Future / Enterprise**.

## Backend

| Technology          | Decision | Tag                               | Notes                             |
| ------------------- | -------- | --------------------------------- | --------------------------------- |
| Node.js (LTS)       | ✅ Adopt | Required For MVP                  | 20.x                              |
| Express.js          | ✅ Adopt | Required For MVP                  | Modular monolith                  |
| TypeScript          | ✅ Adopt | Required For MVP                  | Strict mode                       |
| PostgreSQL          | ✅ Adopt | Required For MVP                  | 15+                               |
| Prisma              | ✅ Adopt | Required For MVP                  | With migrations                   |
| Zod                 | ✅ Adopt | Required For MVP                  | Validation (shared client+server) |
| argon2              | ✅ Adopt | Required For MVP                  | Password hashing                  |
| jsonwebtoken        | ✅ Adopt | Required For MVP                  | JWT signing                       |
| Pino                | ✅ Adopt | Required For MVP                  | Structured logs                   |
| Helmet              | ✅ Adopt | Required For MVP                  | Security headers                  |
| express-rate-limit  | ✅ Adopt | Required For MVP                  | Rate limiting                     |
| Redis               | ✅ Adopt | Required For MVP                  | Cache, rate limit, OTP, sessions  |
| BullMQ              | ✅ Adopt | Required For MVP                  | Background jobs (emails, cleanup) |
| Nodemailer          | ✅ Adopt | Required For MVP                  | Email transport                   |
| Swagger (OpenAPI 3) | ✅ Adopt | Required For MVP                  | API docs                          |
| Socket.io           | ⏳ Adopt | Future Enhancement                | Phase 15+                         |
| Redis Pub/Sub       | ⏳ Adopt | Future Enhancement                | Realtime fan-out                  |
| Prometheus client   | ✅ Adopt | Required Before Production Launch | Metrics endpoint                  |
| OpenTelemetry SDK   | ✅ Adopt | Required Before Production Launch | Tracing                           |
| Sentry SDK          | ✅ Adopt | Required Before Production Launch | Errors                            |

## Frontend (all 3 apps)

| Technology      | Decision | Tag                               | Notes                  |
| --------------- | -------- | --------------------------------- | ---------------------- |
| Next.js         | ✅ Adopt | Required For MVP                  | App Router             |
| TypeScript      | ✅ Adopt | Required For MVP                  | Strict                 |
| Tailwind CSS    | ✅ Adopt | Required For MVP                  |                        |
| Shadcn UI       | ✅ Adopt | Required For MVP                  |                        |
| Zustand         | ✅ Adopt | Required For MVP                  | Client state           |
| TanStack Query  | ✅ Adopt | Required For MVP                  | Server state           |
| react-hook-form | ✅ Adopt | Required For MVP                  | Forms                  |
| Lucide React    | ✅ Adopt | Required For MVP                  | Icons                  |
| Recharts        | ✅ Adopt | Required For MVP                  | Admin charts           |
| MSW             | ✅ Adopt | Required For MVP                  | Component test mocking |
| Playwright      | ✅ Adopt | Required Before Production Launch | E2E                    |

## Infrastructure

| Technology                   | Decision | Tag                               | Notes                 |
| ---------------------------- | -------- | --------------------------------- | --------------------- |
| Docker                       | ✅ Adopt | Required For MVP                  | Backend container     |
| Docker Compose               | ✅ Adopt | Required For MVP                  | Local dev             |
| GitHub Actions               | ✅ Adopt | Required For MVP                  | CI                    |
| Nginx                        | ✅ Adopt | Required Before Production Launch | Reverse proxy / TLS   |
| Postgres managed service     | ✅ Adopt | Required For MVP                  | Neon / RDS / Supabase |
| Redis managed service        | ✅ Adopt | Required Before Production Launch | Upstash / ElastiCache |
| S3-compatible object storage | ✅ Adopt | Required For MVP                  | S3 or Cloudflare R2   |
| CDN                          | ✅ Adopt | Required Before Production Launch | Cloudflare            |

## Observability

| Technology    | Decision | Tag                               | Notes |
| ------------- | -------- | --------------------------------- | ----- |
| Pino (app)    | ✅ Adopt | Required For MVP                  |       |
| Sentry        | ✅ Adopt | Required Before Production Launch |       |
| Prometheus    | ✅ Adopt | Required Before Production Launch |       |
| Grafana       | ✅ Adopt | Required Before Production Launch |       |
| OpenTelemetry | ✅ Adopt | Required Before Production Launch |       |

## Search

| Technology                 | Decision    | Tag                          | Notes                     |
| -------------------------- | ----------- | ---------------------------- | ------------------------- |
| Postgres Full-Text Search  | ✅ Adopt    | Required For MVP             | `pg_trgm`, GIN indexes    |
| Meilisearch                | ⏳ Evaluate | Future Enhancement           | If FTS becomes bottleneck |
| OpenSearch / Elasticsearch | ❌ Defer    | Enterprise Scale Requirement | Only at very large scale  |

## Security

| Technology             | Decision | Tag              | Notes |
| ---------------------- | -------- | ---------------- | ----- |
| JWT (HS256 → RS256)    | ✅ Adopt | Required For MVP |       |
| Refresh token rotation | ✅ Adopt | Required For MVP |       |
| Argon2id               | ✅ Adopt | Required For MVP |       |
| Helmet                 | ✅ Adopt | Required For MVP |       |
| CORS allowlist         | ✅ Adopt | Required For MVP |       |
| CSRF (double-submit)   | ✅ Adopt | Required For MVP |       |
| Rate limiting (Redis)  | ✅ Adopt | Required For MVP |       |
| Secrets via env + KMS  | ✅ Adopt | Required For MVP |       |

## Explicitly Rejected

- **Winston** — Pino is faster, structured, lower-overhead. (See [logging.md](logging.md).)
- **express-validator** — Zod is shared, type-safe, and used in tests. (See [validation.md](validation.md).)
- **MongoDB / MySQL** — Postgres chosen for relational integrity and FTS.
- **Elasticsearch at MVP** — Premature; FTS first.
