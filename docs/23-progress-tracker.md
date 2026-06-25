# 23 — Progress Tracker

> **Rules** (from master plan):
>
> 1. Never start a new phase until the current phase is completed.
> 2. Update this file after every completed task.
> 3. Tasks are marked: `Pending`, `In Progress`, `Completed`.
> 4. Backend implementation precedes frontend.
> 5. Every feature must have API, DB, testing, and acceptance criteria documented.

## Phase Status Overview

| Phase | Title                            | Status    | Started    | Completed  |
| ----: | -------------------------------- | --------- | ---------- | ---------- |
|     0 | Documentation & Planning         | Completed | —          | 2026-06-24 |
|     1 | Authentication                   | Completed | 2026-06-24 | 2026-06-24 |
|     2 | User Management                  | Completed | 2026-06-24 | 2026-06-24 |
|     3 | Worker Profiles                  | Completed | 2026-06-24 | 2026-06-24 |
|     4 | Job Categories                   | Completed | 2026-06-25 | 2026-06-25 |
|     5 | Job Posting                      | Completed | 2026-06-25 | 2026-06-25 |
|     6 | Job Discovery                    | Completed | 2026-06-25 | 2026-06-25 |
|     7 | Job Applications                 | Pending   | —          | —          |
|     8 | Job Assignment                   | Pending   | —          | —          |
|     9 | Job Lifecycle                    | Pending   | —          | —          |
|    10 | Reviews & Ratings                | Pending   | —          | —          |
|    11 | Notifications                    | Pending   | —          | —          |
|    12 | Search & Filters                 | Pending   | —          | —          |
|    13 | Admin Dashboard                  | Pending   | —          | —          |
|    14 | Reports & Analytics              | Pending   | —          | —          |
|    15 | Chat System (future)             | Pending   | —          | —          |
|    16 | Maps & Location (future)         | Pending   | —          | —          |
|    17 | Payments & Monetization (future) | Pending   | —          | —          |
|    18 | Production Launch (future)       | Pending   | —          | —          |

## Phase 0 — Documentation & Planning

| ID  | Task                                              | Owner | Status    |
| --- | ------------------------------------------------- | ----- | --------- |
| 0.1 | Create `docs/` folder structure                   | —     | Completed |
| 0.2 | Author 00–25 planning docs                        | —     | Completed |
| 0.3 | Author phase-01 through phase-18 docs             | —     | Completed |
| 0.4 | Author 15 architecture evaluation docs            | —     | Completed |
| 0.5 | Approval gate (wait for sign-off before any code) | —     | Completed |

## Active Phase

### ✅ Phase 6 — Job Discovery — Completed 2026-06-25

| ID   | Task                                                                                                                                                                     | Component      | Status    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | --------- |
| 6.1  | `publicJobsQuerySchema` — rich filters (category, subcategory, city, urgency, budget range, scheduledAfter, search, sort)                                                | server/api     | Completed |
| 6.2  | `listPublicJobs` service — `OPEN` only, soft-deleted excluded, budget-overlap logic, urgency in-memory sort                                                              | server/api     | Completed |
| 6.3  | `getPublicJob` service — `OPEN` visible to anyone; owner / admin see their non-OPEN jobs                                                                                 | server/api     | Completed |
| 6.4  | Public router at `/api/v1/jobs/public` (list + detail) — anonymous, optional auth-aware                                                                                  | server/api     | Completed |
| 6.5  | Routers wired into `app.ts`                                                                                                                                              | server/app     | Completed |
| 6.6  | Enriched `workerListQuerySchema` — `categoryId`/`categorySlug`/`subcategoryId`/`maxHourlyRate`/`minYearsExperience` + 3 new sort options                                 | server/api     | Completed |
| 6.7  | Updated `listPublicWorkers` service to honor the new filters (skill ↔ category ↔ subcategory)                                                                            | server/api     | Completed |
| 6.8  | OpenAPI registration for 2 new public job endpoints + `PublicJobCard` schema                                                                                             | server/openapi | Completed |
| 6.9  | Unit tests: 18 new `publicJobsQuerySchema` tests (155/155 total)                                                                                                         | server/tests   | Completed |
| 6.10 | Shared package: 3 new types (`PublicJobCard`, `PublicJobListResult`, `PublicJobsQuery`) + 2 ApiClient methods (`listPublicJobs`, `getPublicJob`) + extended worker query | shared         | Completed |
| 6.11 | Worker app: `/jobs` browse + `/jobs/[id]` detail                                                                                                                         | worker         | Completed |
| 6.12 | Customer app: `/jobs` browse + `/jobs/[id]` detail                                                                                                                       | client         | Completed |
| 6.13 | Worker + Customer dashboard nav updated with **Browse Jobs**                                                                                                             | client/worker  | Completed |
| 6.14 | Build + typecheck all packages green                                                                                                                                     | all            | Completed |
| 6.15 | README + tracker updated                                                                                                                                                 | docs           | Completed |

### Verification (all green)

| Check                                        | Result                                                                      |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| `npm run typecheck` (server, shared, 3 apps) | ✅ no errors                                                                |
| `npm run build` (server)                     | ✅ compiles to `dist/`                                                      |
| `npm run build` (client)                     | ✅ 19 routes (incl. `/jobs`, `/jobs/[id]`)                                  |
| `npm run build` (worker)                     | ✅ 14 routes (incl. `/jobs`, `/jobs/[id]`)                                  |
| `npm run build` (admin)                      | ✅ 10 routes (unchanged — admin sees jobs at `/admin/jobs` from Phase 5)    |
| `npm run test:unit` (server)                 | ✅ **155 / 155** tests pass (18 new for Phase 6)                            |
| Phase 6 endpoints                            | ✅ 2 new (`GET /jobs/public`, `GET /jobs/public/:id`) + enriched `/workers` |

### ✅ Phase 5 — Job Posting — Completed 2026-06-25

| ID   | Task                                                                                                                                                 | Component      | Status    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | --------- |
| 5.1  | Prisma: add `Job` + `JobAttachment` models + `JobStatus` / `JobUrgency` enums; reverse relations on `User`, `Category`, `Subcategory`, `UserAddress` | server/db      | Completed |
| 5.2  | Migration `005_jobs` (PostgreSQL enum + tables + indexes + CHECK constraints) + `prisma generate`                                                    | server/db      | Completed |
| 5.3  | `jobs.validators.ts` — Zod schemas (create / update / cancel / attachment / query) + state-machine constants                                         | server/api     | Completed |
| 5.4  | `jobs.service.ts` — CRUD + cancel + attachments + ownership / state-machine enforcement                                                              | server/api     | Completed |
| 5.5  | `jobs.controller.ts` + customer router + admin router (`/api/v1/admin/jobs`)                                                                         | server/api     | Completed |
| 5.6  | Routers wired into `app.ts`                                                                                                                          | server/app     | Completed |
| 5.7  | OpenAPI registration for all 8 customer + 1 admin endpoints (incl. `JobSummary` / `JobDetail` schemas)                                               | server/openapi | Completed |
| 5.8  | Unit tests: 37 new validator tests (137/137 total)                                                                                                   | server/tests   | Completed |
| 5.9  | Customer app: `/my-jobs` list with status filter                                                                                                     | client         | Completed |
| 5.10 | Customer app: `/my-jobs/new` 5-step wizard (Category → Details → Budget → Address → Review)                                                          | client         | Completed |
| 5.11 | Customer app: `/my-jobs/[id]` detail with status timeline + attach / cancel / delete                                                                 | client         | Completed |
| 5.12 | Admin app: `/jobs` read-only table (status filter, customer info)                                                                                    | admin          | Completed |
| 5.13 | Shared package: types + 7 ApiClient methods (CRUD + cancel + attachments + admin list)                                                               | shared         | Completed |
| 5.14 | Build + typecheck all packages green                                                                                                                 | all            | Completed |
| 5.15 | README + tracker updated                                                                                                                             | docs           | Completed |

### Verification (all green)

| Check                                        | Result                                                           |
| -------------------------------------------- | ---------------------------------------------------------------- |
| `prisma generate`                            | ✅ Job + JobAttachment + JobStatus + JobUrgency compiled         |
| `npm run typecheck` (server, shared, 3 apps) | ✅ no errors                                                     |
| `npm run build` (server)                     | ✅ compiles to `dist/`                                           |
| `npm run build` (client)                     | ✅ 17 routes (incl. `/my-jobs`, `/my-jobs/new`, `/my-jobs/[id]`) |
| `npm run build` (worker)                     | ✅ 12 routes (no UI change required by spec)                     |
| `npm run build` (admin)                      | ✅ 10 routes (incl. `/jobs`)                                     |
| `npm run test:unit` (server)                 | ✅ **137 / 137** tests pass (37 new for Phase 5)                 |
| Phase 5 endpoints registered                 | ✅ 8 customer + 1 admin = 9 new endpoints                        |

### ✅ Phase 4 — Job Categories — Completed 2026-06-25

| ID   | Task                                                                         | Component      | Status    |
| ---- | ---------------------------------------------------------------------------- | -------------- | --------- |
| 4.1  | Prisma: add `Category` + `Subcategory` models; link `Skill` to `Subcategory` | server/db      | Completed |
| 4.2  | Migration `004_job_categories` + `prisma generate`                           | server/db      | Completed |
| 4.3  | `categories.validators.ts` (Zod schemas)                                     | server/api     | Completed |
| 4.4  | `categories.service.ts` — public reads + admin CRUD + skills filter          | server/api     | Completed |
| 4.5  | `categories.controller.ts` + routes (public + admin)                         | server/api     | Completed |
| 4.6  | Admin skills CRUD wired into router                                          | server/api     | Completed |
| 4.7  | OpenAPI registration for new endpoints                                       | server/openapi | Completed |
| 4.8  | Wire new routers into `app.ts`                                               | server/app     | Completed |
| 4.9  | Unit tests: 27 new validator tests (100/100 total)                           | server/tests   | Completed |
| 4.10 | Initial taxonomy seeded via `npm run prisma:seed`                            | server/seed    | Completed |
| 4.11 | Customer app: `/categories` grid + `/categories/[slug]` detail               | client         | Completed |
| 4.12 | Worker app: `/skills` filterable by category pills                           | worker         | Completed |
| 4.13 | Admin app: `/categories` tree mgmt (CRUD + activate/deactivate)              | admin          | Completed |
| 4.14 | Shared package: types + ApiClient methods for categories / skills            | shared         | Completed |
| 4.15 | Build + typecheck all packages green                                         | all            | Completed |
| 4.16 | README + tracker updated                                                     | docs           | Completed |

### Verification (all green)

| Check                                        | Result                                                                                                     |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `prisma generate`                            | ✅ Category + Subcategory + Skill (with subcategory link) compiled                                         |
| `npm run typecheck` (server, shared, 3 apps) | ✅ no errors                                                                                               |
| `npm run build` (server)                     | ✅ compiles to `dist/`                                                                                     |
| `npm run build` (client)                     | ✅ 14 routes (incl. `/categories`, `/categories/[slug]`)                                                   |
| `npm run build` (worker)                     | ✅ 12 routes (skills page now category-filtered)                                                           |
| `npm run build` (admin)                      | ✅ 9 routes (incl. `/categories`)                                                                          |
| `npm run test:unit` (server)                 | ✅ **100 / 100** tests pass (27 new for Phase 4)                                                           |
| Phase 4 endpoints registered                 | ✅ 12 new endpoints (3 public + 4 admin categories + 1 admin subs + 2 admin skills + 2 already in /skills) |

### ✅ Phase 3 — Worker Profiles — Completed 2026-06-24

| ID   | Task                                                                    | Component      | Status    |
| ---- | ----------------------------------------------------------------------- | -------------- | --------- |
| 3.1  | Prisma: add Skill + WorkerProfile + WorkerSkill + PortfolioItem models  | server/db      | Completed |
| 3.2  | Migration (`003_worker_profiles`) + `prisma generate`                   | server/db      | Completed |
| 3.3  | `workers.validators.ts` (Zod schemas)                                   | server/api     | Completed |
| 3.4  | `workers.service.ts` — profile CRUD + skills + portfolio + completeness | server/api     | Completed |
| 3.5  | `workers.controller.ts` + routes (`/api/v1/workers/*`)                  | server/api     | Completed |
| 3.6  | Admin verify endpoint                                                   | server/api     | Completed |
| 3.7  | OpenAPI registration for new endpoints                                  | server/openapi | Completed |
| 3.8  | Unit tests (validators + completeness)                                  | server/tests   | Completed |
| 3.9  | Customer app: `/workers` list + `/workers/:id` detail                   | client         | Completed |
| 3.10 | Worker app: `/profile` (worker fields) + `/skills` + `/portfolio`       | worker         | Completed |
| 3.11 | Admin app: `/workers/pending` queue + verify/reject actions             | admin          | Completed |
| 3.12 | Build + typecheck all packages green                                    | all            | Completed |
| 3.13 | Mark Phase 3 Completed                                                  | docs           | Completed |

### Verification (all green)

| Check                                         | Result                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------- |
| `prisma generate`                             | ✅ WorkerProfile + Skill + WorkerSkill + PortfolioItem compiled                     |
| `npm run typecheck` (server, shared, 3 apps)  | ✅ no errors                                                                        |
| `npm run build` (server)                      | ✅ compiles to `dist/`                                                              |
| `npm run build` (client)                      | ✅ 13 routes (incl. `/workers`, `/workers/[id]`)                                    |
| `npm run build` (worker)                      | ✅ 14 routes (incl. `/profile`, `/skills`, `/portfolio`)                            |
| `npm run build` (admin)                       | ✅ 8 routes (incl. `/workers/pending`)                                              |
| `npm run test:unit` (server)                  | ✅ **73 / 73** tests pass (31 new for Phase 3)                                      |
| Endpoint audit (`scripts/audit-endpoints.js`) | ✅ **32 / 32** endpoints implemented (Phase 1: 8/8, Phase 2: 12/12, Phase 3: 12/12) |

### ✅ Phase 2 — User Management — Completed 2026-06-24

| ID   | Task                                                                 | Component      | Status    |
| ---- | -------------------------------------------------------------------- | -------------- | --------- |
| 2.1  | Add `phone`, `avatarUrl`, `deletedAt` to `User`; add `UserAddress`   | server/db      | Completed |
| 2.2  | Prisma migration + `npx prisma generate`                             | server/db      | Completed |
| 2.3  | `users.service.ts` — getMe, updateMe, changePassword, softDelete     | server/api     | Completed |
| 2.4  | `addresses.service.ts` — CRUD (with default-address promotion)       | server/api     | Completed |
| 2.5  | `users.validators.ts` (Zod schemas)                                  | server/api     | Completed |
| 2.6  | Controllers + routes (`/api/v1/users/*`)                             | server/api     | Completed |
| 2.7  | Admin endpoints: list users, get/suspend/reactivate                  | server/api     | Completed |
| 2.8  | Soft-delete: anonymize PII + revoke refresh tokens + Redis denylist  | server/api     | Completed |
| 2.9  | Avatar upload endpoint (ticket contract)                             | server/api     | Completed |
| 2.10 | OpenAPI registration for new endpoints                               | server/openapi | Completed |
| 2.11 | Unit tests: 19 new validator tests (42/42 pass total)                | server/tests   | Completed |
| 2.12 | Customer app: `/profile` + addresses CRUD + change-password + delete | client         | Completed |
| 2.13 | Worker app: `/profile` + change-password + delete                    | worker         | Completed |
| 2.14 | Admin app: `/users` list + `/users/[id]` detail + suspend action     | admin          | Completed |
| 2.15 | Build + typecheck all packages green                                 | all            | Completed |
| 2.16 | Phase 2 tracker marked Completed                                     | docs           | Completed |

### Verification (all green)

| Check                                        | Result                                               |
| -------------------------------------------- | ---------------------------------------------------- |
| `prisma generate`                            | ✅ User fields + UserAddress compiled                |
| `npm run typecheck` (server, shared, 3 apps) | ✅ no errors                                         |
| `npm run build` (server)                     | ✅ compiles to `dist/`                               |
| `npm run build` (client)                     | ✅ 12 routes prerendered                             |
| `npm run build` (worker)                     | ✅ 12 routes prerendered                             |
| `npm run build` (admin)                      | ✅ 7 routes prerendered (with dynamic `/users/[id]`) |
| `npm run test:unit` (server)                 | ✅ **42 / 42** tests pass                            |

| ID   | Task                                                               | Component      | Status      |
| ---- | ------------------------------------------------------------------ | -------------- | ----------- |
| 2.1  | Add `phone`, `avatarUrl`, `deletedAt` to `User`; add `UserAddress` | server/db      | In Progress |
| 2.2  | Prisma migration (`002_user_management`)                           | server/db      | Pending     |
| 2.3  | `users.service.ts` — getMe, updateMe, changePassword, softDelete   | server/api     | Pending     |
| 2.4  | `addresses.service.ts` — CRUD                                      | server/api     | Pending     |
| 2.5  | `users.validators.ts` (Zod schemas)                                | server/api     | Pending     |
| 2.6  | Controllers + routes (`/api/v1/users/*`)                           | server/api     | Pending     |
| 2.7  | Admin module: list users, get/suspend/reactivate                   | server/admin   | Pending     |
| 2.8  | Soft-delete: anonymize PII + revoke refresh tokens                 | server/api     | Pending     |
| 2.9  | Avatar upload endpoint (returns key + URL to client)               | server/api     | Pending     |
| 2.10 | OpenAPI registration for new endpoints                             | server/openapi | Pending     |
| 2.11 | Unit tests (validators)                                            | server/tests   | Pending     |

### ✅ Phase 1 — Authentication — Completed 2026-06-24

| ID   | Task                                                                  | Component      | Status    |
| ---- | --------------------------------------------------------------------- | -------------- | --------- |
| 1.1  | Schema: User, RefreshToken, PasswordReset, EmailVerification          | server/db      | Completed |
| 1.2  | Prisma migration generated (`prisma generate`)                        | server/db      | Completed |
| 1.3  | Auth module: signup (service + controller + routes + validators)      | server/api     | Completed |
| 1.4  | Auth module: login + refresh (rotation + reuse detection)             | server/api     | Completed |
| 1.5  | Auth module: logout (revokes family)                                  | server/api     | Completed |
| 1.6  | Auth module: forgot/reset password (single-use tokens)                | server/api     | Completed |
| 1.7  | Auth module: email verification + resend                              | server/api     | Completed |
| 1.8  | Middleware: `requireAuth`, `requireRole`, `validate`, `errorHandler`  | server/common  | Completed |
| 1.9  | Email service (Nodemailer) + verify/reset templates (HTML + text)     | server/infra   | Completed |
| 1.10 | Login throttling (5 fails → 15-min lockout) via Redis                 | server/common  | Completed |
| 1.11 | Refresh-token denylist in Redis                                       | server/common  | Completed |
| 1.12 | Rate limiting on `/auth/*` (express-rate-limit)                       | server/common  | Completed |
| 1.13 | OpenAPI registry + Swagger UI at `/docs`                              | server/openapi | Completed |
| 1.14 | Argon2id password hashing utility                                     | server/common  | Completed |
| 1.15 | Pino structured logger + request logging                              | server/infra   | Completed |
| 1.16 | Admin seed script                                                     | server/seed    | Completed |
| 1.17 | Helmet + CORS allowlist                                               | server/app     | Completed |
| 1.18 | Unit tests: 23 tests pass (jwt, password, tokens, validators, errors) | server/tests   | Completed |
| 1.19 | Integration tests scaffold (supertest, gated by `describe.skip`)      | server/tests   | Completed |
| 1.20 | TypeScript strict typecheck passes (server, shared, all 3 apps)       | all            | Completed |
| 1.21 | Production build succeeds (server + 3 Next.js apps)                   | all            | Completed |
| 1.22 | `packages/shared` workspace (types, validators, API client, store)    | shared         | Completed |
| 1.23 | Customer app: Next.js + 5 auth pages + dashboard + landing            | client         | Completed |
| 1.24 | Worker app: Next.js + 5 auth pages + dashboard (role=WORKER preset)   | worker         | Completed |
| 1.25 | Admin app: Next.js + login page + dashboard (login-only)              | admin          | Completed |
| 1.26 | Auth guard: admin rejects non-ADMIN roles client-side                 | admin          | Completed |
| 1.27 | Suspense boundaries for `useSearchParams` pages                       | client/worker  | Completed |
| 1.28 | E2E smoke (Playwright) — deferred (no DB in this iteration)           | tests/e2e      | Pending   |
| 1.29 | Phase 1 tracker marked Completed                                      | docs           | Completed |

### Verification (all green)

| Check                                        | Result                    |
| -------------------------------------------- | ------------------------- |
| `npm install` (workspace)                    | ✅ 4 workspaces linked    |
| `npm run typecheck` (server, shared, 3 apps) | ✅ no errors              |
| `npm run build` (server)                     | ✅ compiles to `dist/`    |
| `npm run build` (client)                     | ✅ 8 routes prerendered   |
| `npm run build` (worker)                     | ✅ 8 routes prerendered   |
| `npm run build` (admin)                      | ✅ 4 routes prerendered   |
| `npm run test:unit` (server)                 | ✅ **23 / 23** tests pass |
| `prisma generate`                            | ✅ client generated       |

## Decisions Log

| Date | Decision                         | Rationale                         |
| ---- | -------------------------------- | --------------------------------- |
| —    | Use modular monolith for backend | Faster MVP, clean split later     |
| —    | Three separate Next.js apps      | Different UX, different audiences |
| —    | Postgres + Prisma                | Strong typing, mature ecosystem   |
| —    | TanStack Query + Zustand         | Best-of-breed data + client state |

## Change Log

- 2026-06-24 — Initial roadmap + 26 planning docs + 15 architecture evaluation docs.
- 2026-06-24 — **Phase 1 complete**: backend + 3 Next.js apps (Customer, Worker, Admin) with auth pages.
- 2026-06-24 — **Phase 2 complete**: user profile + addresses CRUD + change password + soft-delete; admin user management (list, detail, suspend/reactivate). 42/42 tests pass. All 3 apps build green.
- 2026-06-24 — **Audit & cleanup**:
  - Removed dead `/auth/me` route + `me` controller + import (canonical endpoint is `/users/me` per Phase 2 spec).
  - Removed orphaned `/auth/me` OpenAPI registration.
  - Added missing `/auth/resend-verification` OpenAPI registration.
  - Verified endpoint coverage: **20/20** spec endpoints implemented (8 auth + 12 user).
  - Verified runtime: server boots, `/healthz` 200, `/openapi.json` 200 (17 paths), 404 envelope correct.
  - Cleaned duplicate Phase 2 task table in tracker.
- 2026-06-24 — **Phase 3 complete**: backend (12 worker endpoints + Skill catalog + admin verify queue) + 3 frontends (customer `/workers` list + detail, worker `/profile` + `/skills` + `/portfolio`, admin `/workers/pending`). 73/73 unit tests pass. Endpoint audit shows 32/32 implemented (12 new worker routes added).
- 2026-06-25 — **Phase 4 complete**: backend (Category + Subcategory + Skill taxonomy, 12 new endpoints) + 3 frontends (customer `/categories` + `/categories/[slug]`, worker `/skills` filterable by category, admin `/categories` management). 100/100 unit tests pass (27 new). README + tracker updated.
- 2026-06-25 — **Phase 5 complete**: backend (Job + JobAttachment + state machine, 9 new endpoints) + 3 frontends (customer `/my-jobs` list + `/my-jobs/new` 5-step wizard + `/my-jobs/[id]` detail, admin `/jobs` read-only). 137/137 unit tests pass (37 new). README + tracker updated. (Total: 53 endpoints across 12 modules.)
- 2026-06-25 — **Phase 6 complete**: backend (public job feed + public job detail with rich filters; enriched public worker filters). 3 frontends (worker + customer `/jobs` browse + `/jobs/[id]` detail). 155/155 unit tests pass (18 new). README + tracker updated. (Total: 55 endpoints across 13 modules.)
