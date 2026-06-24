# 04 — System Architecture

## High-Level Diagram

```
                    ┌────────────────────┐
                    │   Customer Web     │
                    │   (Next.js)        │
                    └─────────┬──────────┘
                              │ HTTPS (REST)
                              ▼
┌──────────────┐      ┌────────────────────┐       ┌──────────────┐
│  Worker Web  │─────▶│   API Server       │◀──────│  Admin Web   │
│  (Next.js)   │      │   (Express + TS)   │       │  (Next.js)   │
└──────────────┘      └─────────┬──────────┘       └──────────────┘
                               │ Prisma ORM
                               ▼
                    ┌────────────────────┐
                    │   PostgreSQL       │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  Object Storage    │
                    │  (S3-compatible)   │
                    └────────────────────┘

              ┌──────────────────────────┐
              │  Email Provider (SMTP)  │
              └──────────────────────────┘
```

## Layered Architecture

1. **Presentation Layer** — Three Next.js apps.
2. **API Layer** — Express REST endpoints, JWT auth, validation.
3. **Service Layer** — Business logic, organized by domain.
4. **Data Access Layer** — Prisma client, repositories.
5. **Persistence Layer** — PostgreSQL.
6. **Cross-cutting** — Logging, error handling, rate limiting, caching.

## Architectural Style

- **Monolith first** (modular monolith) — single deployable backend, internally modular.
- **Three frontends** — separate Next.js apps, sharing UI primitives via shared patterns.
- **Stateless API** — JWT + refresh tokens, no server-side sessions.
- **Repository pattern** — controllers call services, services use repositories.

## Backend Module Structure

```
server/src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── workers/
│   ├── jobs/
│   ├── categories/
│   ├── applications/
│   ├── reviews/
│   ├── notifications/
│   ├── search/
│   └── admin/
├── common/
│   ├── middlewares/
│   ├── guards/
│   ├── utils/
│   ├── errors/
│   └── validators/
├── infra/
│   ├── prisma/
│   ├── mail/
│   ├── storage/
│   └── logger/
├── config/
├── app.ts
└── server.ts
```

## Frontend Architecture (Each App)

- **Next.js App Router**.
- **Pages/Routes** — feature-grouped.
- **Components** — shared UI (Shadcn) + feature components.
- **Hooks** — domain logic wrappers.
- **Stores** — Zustand for client state.
- **Queries** — TanStack Query for server state.
- **Lib** — API client, helpers.
- **Types** — generated from backend types.

## Cross-Cutting Concerns

| Concern          | Approach                                         |
| ---------------- | ------------------------------------------------ |
| Auth             | JWT access + refresh; HttpOnly cookies (refresh) |
| Validation       | Zod schemas (shared client + server)             |
| Errors           | Centralized error middleware, typed errors       |
| Logging          | Pino (server), structured JSON                   |
| CORS             | Per-app allowlist                                |
| Rate limiting    | express-rate-limit                               |
| Security headers | Helmet                                           |
| File uploads     | S3-compatible pre-signed URLs                    |
| Email            | SMTP via Nodemailer                              |
| Background jobs  | BullMQ + Redis (later)                           |

## Future Architectural Additions

- Socket.io gateway for realtime chat/notifications.
- Redis for caching and pub/sub.
- CDN for static + uploaded assets.
- Separate worker process for emails and jobs.
- Microservice split only when modules warrant it.
