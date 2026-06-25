# Sevanto

> **Trusted local workforce, on demand.**
>
> A hyperlocal workforce and services marketplace that connects customers with verified, skilled workers in their neighborhood. Built as a startup-grade, monorepo, TypeScript-first application.

---

## 📑 Table of Contents

- [What is Sevanto?](#what-is-sevanto)
- [Phase Status](#phase-status)
- [Repository Layout](#repository-layout)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Phase 1 — Authentication](#phase-1--authentication)
- [Phase 2 — User Management](#phase-2--user-management)
- [Phase 3 — Worker Profiles](#phase-3--worker-profiles)
- [Phase 4 — Job Categories](#phase-4--job-categories)
- [Phase 5 — Job Posting](#phase-5--job-posting)
- [Phase 6 — Job Discovery](#phase-6--job-discovery)
- [API Surface](#api-surface)
- [Architecture](#architecture)
- [Security](#security)
- [Testing](#testing)
- [Documentation](#documentation)
- [Scripts Reference](#scripts-reference)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)

---

## What is Sevanto?

Sevanto is a multi-sided marketplace for local services (home repair, cleaning, plumbing, electrical, tutoring, beauty, fitness, tech help, etc.). It supports three first-class applications:

| App         | Audience      | Purpose                                        |
| ----------- | ------------- | ---------------------------------------------- |
| **client/** | Customers     | Discover workers, post jobs, review            |
| **worker/** | Workers       | Maintain profile, apply to jobs, complete work |
| **admin/**  | Sevanto staff | Moderate, verify, analyze                      |
| **server/** | —             | Single Node.js + Express + Prisma API          |

The repo follows an **MVP-first**, **backend-first**, **modular monolith** architecture with strict separation of concerns. Every feature ships with DB schema, API, tests, security review, and three frontends.

---

## Phase Status

| Phase | Title                      | Status       | Started    | Completed  |
| ----: | -------------------------- | ------------ | ---------- | ---------- |
|     0 | Documentation & Planning   | ✅ Completed | 2026-06-24 | 2026-06-24 |
|     1 | Authentication             | ✅ Completed | 2026-06-24 | 2026-06-24 |
|     2 | User Management            | ✅ Completed | 2026-06-24 | 2026-06-24 |
|     3 | Worker Profiles            | ✅ Completed | 2026-06-24 | 2026-06-24 |
|     4 | Job Categories             | ✅ Completed | 2026-06-25 | 2026-06-25 |
|     5 | Job Posting                | ✅ Completed | 2026-06-25 | 2026-06-25 |
|     6 | Job Discovery              | ✅ Completed | 2026-06-25 | 2026-06-25 |
|     7 | Job Applications           | 🟡 Pending   | —          | —          |
|     8 | Job Assignment             | 🟡 Pending   | —          | —          |
|     9 | Job Lifecycle              | 🟡 Pending   | —          | —          |
|    10 | Reviews & Ratings          | 🟡 Pending   | —          | —          |
|    11 | Notifications              | 🟡 Pending   | —          | —          |
|    12 | Search & Filters           | 🟡 Pending   | —          | —          |
|    13 | Admin Dashboard            | 🟡 Pending   | —          | —          |
|    14 | Reports & Analytics        | 🟡 Pending   | —          | —          |
|    15 | Chat System (future)       | 🟡 Pending   | —          | —          |
|    16 | Maps & Location (future)   | 🟡 Pending   | —          | —          |
|    17 | Payments (future)          | 🟡 Pending   | —          | —          |
|    18 | Production Launch (future) | 🟡 Pending   | —          | —          |

Full task-level status: see [docs/23-progress-tracker.md](docs/23-progress-tracker.md).

---

## Repository Layout

```
sevanto/
├── README.md                  ← you are here
├── package.json               ← npm workspaces (server, client, worker, admin, packages/*)
├── .gitignore
│
├── docs/                      ← all planning & implementation docs
│   ├── 00-project-overview.md
│   ├── 01-product-vision.md
│   ├── 02-business-model.md
│   ├── 03-user-personas.md
│   ├── 04-system-architecture.md
│   ├── 05-folder-structure.md
│   ├── 06-database-schema.md
│   ├── 07-prisma-schema-plan.md
│   ├── 08-api-design.md
│   ├── 09-authentication-design.md
│   ├── 10-role-permission-matrix.md
│   ├── 11-ui-pages-customer.md
│   ├── 12-ui-pages-worker.md
│   ├── 13-ui-pages-admin.md
│   ├── 14-component-architecture.md
│   ├── 15-feature-roadmap.md
│   ├── 16-development-phases.md
│   ├── 17-testing-strategy.md
│   ├── 18-security-checklist.md
│   ├── 19-deployment-strategy.md
│   ├── 20-scaling-plan.md
│   ├── 21-monetization-plan.md
│   ├── 22-launch-plan.md
│   ├── 23-progress-tracker.md  ← phase status (live)
│   ├── 24-backlog.md
│   ├── 25-future-features.md
│   ├── architecture/          ← technology evaluations
│   │   ├── 00-index.md
│   │   ├── 01-tech-stack-summary.md
│   │   ├── 02-database.md
│   │   ├── 03-cache-and-sessions.md
│   │   ├── 04-background-jobs.md
│   │   ├── 05-realtime.md
│   │   ├── 06-file-storage.md
│   │   ├── 07-validation.md
│   │   ├── 08-logging.md
│   │   ├── 09-monitoring.md
│   │   ├── 10-api-documentation.md
│   │   ├── 11-security.md
│   │   ├── 12-devops.md
│   │   ├── 13-search.md
│   │   └── 14-scalability.md
│   └── phases/                ← phase implementation specs
│       ├── phase-01-authentication.md
│       ├── phase-02-user-management.md
│       └── ... phase-18-production-launch.md
│
├── packages/
│   └── shared/                ← shared types, validators, ApiClient, auth store
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── types.ts
│           ├── validators.ts
│           ├── api-client.ts
│           └── auth-store.ts
│
├── server/                    ← Node.js + Express + Prisma backend
│   ├── README.md              ← backend-specific docs
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma      ← User, RefreshToken, PasswordReset, EmailVerification,
│   │   │                        UserAddress, WorkerProfile, Skill, WorkerSkill, PortfolioItem
│   │   └── seed.ts
│   ├── src/
│   │   ├── server.ts          ← entry point
│   │   ├── app.ts             ← Express app factory
│   │   ├── config/env.ts      ← strict env validation (Zod)
│   │   ├── common/
│   │   │   ├── errors/AppError.ts
│   │   │   ├── middlewares/   ← auth, role, validate, error, rate limit
│   │   │   ├── utils/         ← password (argon2id), jwt, tokens, login throttle
│   │   │   └── validators/
│   │   ├── infra/
│   │   │   ├── prisma/        ← Prisma client singleton
│   │   │   ├── redis/         ← Redis client (rate limit, denylist)
│   │   │   ├── mail/          ← Nodemailer + verify/reset templates
│   │   │   └── logger/        ← Pino structured logging
│   │   ├── modules/
│   │   │   ├── auth/          ← Phase 1
│   │   │   ├── users/         ← Phase 2
│   │   │   ├── workers/       ← Phase 3 (public + self-service + admin verify)
│   │   │   ├── categories/    ← Phase 4 (taxonomy + admin CRUD)
│   │   │   ├── jobs/          ← Phase 5 customer CRUD + Phase 6 public feed
│   │   │   └── health.routes.ts
│   │   └── openapi/registry.ts
│   ├── tests/
│   │   ├── setup.ts
│   │   ├── unit/              ← 155 passing tests
│   │   └── integration/       ← scaffolded (Supertest)
│   └── smoke.js               ← runtime smoke test
│
├── client/                    ← Customer Next.js 14 app (port 3001)
│   ├── README.md
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx                      ← landing
│       │   ├── globals.css
│       │   ├── (auth)/                       ← unauthenticated routes
│       │   │   ├── login/page.tsx
│       │   │   ├── signup/page.tsx
│       │   │   ├── forgot-password/page.tsx
│       │   │   ├── reset-password/page.tsx
│       │   │   └── verify-email/page.tsx
│       │   └── (dashboard)/                  ← authenticated routes
│       │       ├── layout.tsx                ← sidebar nav + auth guard
│       │       ├── dashboard/page.tsx
│       │       ├── profile/page.tsx          ← Phase 2 (with address CRUD)
│       │       ├── settings/page.tsx         ← Phase 2 (change password / delete)
│       │       ├── workers/                  ← Phase 3 (public worker directory)
│       │       │   ├── page.tsx              ← list + filters (city, skill, rating, verified)
│       │       │   └── [id]/page.tsx         ← public profile detail (bio, skills, portfolio)
│       │       ├── categories/               ← Phase 4
│       │       │   ├── page.tsx              ← grid of active categories
│       │       │   └── [slug]/page.tsx       ← category detail + subcategory list
│       │       ├── my-jobs/                  ← Phase 5 (customer-only)
│       │       │   ├── page.tsx              ← list with status filter pills
│       │       │   ├── new/page.tsx          ← 5-step wizard
│       │       │   └── [id]/page.tsx         ← detail + status timeline + cancel/delete
│       │       └── jobs/                     ← Phase 6 (public discovery)
│       │           ├── page.tsx              ← open-jobs feed (filters + sort + paging)
│       │           └── [id]/page.tsx         ← public job detail
│       ├── components/
│       │   ├── auth/                         ← AuthShell, AuthForm
│       │   └── ui/                           ← Button, Input, FormField
│       ├── hooks/use-api.ts
│       ├── stores/auth.ts                    ← Zustand + persist
│       └── lib/                              ← utils, api, guard
│
├── worker/                    ← Worker Next.js 14 app (port 3002)
│   └── src/                   ← mirrors client/ structure
│       └── app/
│           ├── (auth)/signup/page.tsx        ← role=WORKER preset
│           └── (dashboard)/
│               ├── layout.tsx                ← worker role guard
│               ├── dashboard/page.tsx
│               ├── profile/page.tsx          ← Phase 2 (name, phone) + Phase 3 worker fields
│               │                                       (headline, bio, rate, radius, city)
│               ├── settings/page.tsx         ← Phase 2 (change password / delete)
│               ├── skills/page.tsx           ← Phase 3 + Phase 4 category-filter chips
│               ├── portfolio/page.tsx        ← Phase 3: add/remove portfolio items by URL
│               └── jobs/                     ← Phase 6 (public job discovery)
│                   ├── page.tsx              ← open-jobs feed (filters + sort + paging)
│                   └── [id]/page.tsx         ← public job detail
│
└── admin/                     ← Admin Next.js 14 app (port 3003)
    └── src/
        └── app/
            ├── (auth)/login/page.tsx         ← admin-only (rejects non-ADMIN)
            └── (dashboard)/
                ├── layout.tsx                ← admin role guard
                ├── dashboard/page.tsx
                ├── users/                    ← Phase 2: list users
                │   ├── page.tsx
                │   └── [id]/page.tsx         ← detail + suspend/reactivate
                ├── workers/                  ← Phase 3
                │   └── pending/page.tsx      ← verification queue + verify action
                ├── categories/               ← Phase 4: category tree mgmt + CRUD
                │   └── page.tsx
                └── jobs/                     ← Phase 5: read-only jobs list
                    └── page.tsx
```

---

## Technology Stack

| Layer        | Technology                 | Notes                                     |
| ------------ | -------------------------- | ----------------------------------------- |
| **Backend**  | Node.js 20 LTS             |                                           |
|              | Express 4                  | modular monolith                          |
|              | TypeScript 5               | strict mode                               |
|              | PostgreSQL 15              | managed (Neon / RDS / Supabase)           |
|              | Prisma 5                   | migrations + generated client             |
|              | Zod                        | request validation (shared client+server) |
|              | argon2id                   | password hashing                          |
|              | jsonwebtoken               | HS256 JWT                                 |
|              | Redis 7                    | rate limiting, denylist, future jobs      |
|              | Nodemailer                 | transactional email                       |
|              | Pino                       | structured JSON logging                   |
|              | Helmet + CORS + rate-limit | security middleware                       |
|              | Swagger / OpenAPI 3.1      | API documentation                         |
| **Frontend** | Next.js 14 (App Router)    | all 3 apps                                |
|              | TypeScript 5               | strict                                    |
|              | Tailwind CSS               |                                           |
|              | Shadcn-style primitives    | Button, Input, FormField                  |
|              | Zustand + persist          | client auth state                         |
|              | react-hook-form            | forms (Phase 3+)                          |
| **Tooling**  | Vitest                     | unit + integration tests                  |
|              | Supertest                  | HTTP integration tests                    |
|              | Prisma Migrate             | schema migrations                         |
|              | tsc strict                 | type safety across all packages           |

Full tech-stack evaluations and rationale: see [docs/architecture/](docs/architecture/).

---

## Quick Start

### Prerequisites

- **Node.js 20 LTS** or newer
- **PostgreSQL 15+** (or use Docker — see below)
- **Redis 7+** (optional for Phase 1/2; required for rate limiting in production)
- **npm 10+** (or pnpm / yarn)

### Option A — Native install

```bash
# 1. Install all workspaces
npm install

# 2. Configure environment
cd server
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT secrets, MAIL_*, etc.

# 3. Generate Prisma client
npm run prisma:generate

# 4. Run migrations
npm run prisma:migrate:dev

# 5. Seed admin user (admin@sevanto.app / ChangeMe123!)
npm run prisma:seed

# 6. Start backend
npm run dev    # → http://localhost:3000
# Swagger UI:    http://localhost:3000/docs
# OpenAPI JSON:  http://localhost:3000/openapi.json

# 7. In separate terminals, start the frontends
cd ../client && npm run dev    # → http://localhost:3001
cd ../worker && npm run dev    # → http://localhost:3002
cd ../admin  && npm run dev    # → http://localhost:3003
```

### Option B — Docker Compose (recommended for local)

```yaml
# docker-compose.yml (sample)
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: sevanto
      POSTGRES_PASSWORD: sevanto
      POSTGRES_DB: sevanto
    ports: ["5432:5432"]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
  mailhog:
    image: mailhog/mailhog
    ports: ["1025:1025", "8025:8025"]
```

### Option C — Quick demo (no DB)

The shared package and frontends can be developed in isolation by pointing `NEXT_PUBLIC_API_BASE_URL` at a mock. Backend tests run without a DB (155/155 unit tests pass with zero infra).

---

## Phase 1 — Authentication

**Status**: ✅ Complete

Email-based auth with JWT access tokens + rotating refresh tokens.

### Backend endpoints (8/8)

| Method | Path                               | Auth            | Purpose                             |
| ------ | ---------------------------------- | --------------- | ----------------------------------- |
| `POST` | `/api/v1/auth/signup`              | public          | Create account (CUSTOMER or WORKER) |
| `POST` | `/api/v1/auth/login`               | public          | Issue access + refresh tokens       |
| `POST` | `/api/v1/auth/refresh`             | public (cookie) | Rotate tokens; reuse detection      |
| `POST` | `/api/v1/auth/logout`              | public          | Revoke refresh token family         |
| `GET`  | `/api/v1/auth/verify-email`        | public          | Confirm email via token             |
| `POST` | `/api/v1/auth/resend-verification` | public          | Resend verification email           |
| `POST` | `/api/v1/auth/forgot-password`     | public          | Send password reset link            |
| `POST` | `/api/v1/auth/reset-password`      | public          | Set new password with token         |

### Security highlights

- **Argon2id** password hashing (memory 19 MB, time 2, parallelism 1)
- **JWT HS256** access tokens, 15-minute TTL
- **Opaque refresh tokens** (256-bit random), SHA-256 hashed at rest, 30-day sliding TTL
- **Refresh-token reuse detection** — presenting a revoked token revokes the entire token family
- **Login throttling** — 5 failed attempts → 15-minute lockout (Redis-backed)
- **Rate limiting** on `/auth/*` (5 req/min per IP)
- **Email enumeration prevention** on forgot-password and resend endpoints
- **HttpOnly, Secure, SameSite=Lax** refresh cookie (recommended)
- **Structured logging** with PII redaction (`req.headers.authorization`, `*.password`, `*.token`, etc.)

### Frontend pages

- **Customer** (`client/`): `/login`, `/signup`, `/forgot-password`, `/reset-password?token=…`, `/verify-email?token=…`
- **Worker** (`worker/`): same flows, with `role=WORKER` preset on signup
- **Admin** (`admin/`): `/login` only (admin accounts provisioned out-of-band)

---

## Phase 2 — User Management

**Status**: ✅ Complete

Profile editing, address CRUD, password change, account deletion, and admin user management.

### Backend endpoints (12/12)

| Method   | Path                             | Auth  | Purpose                                    |
| -------- | -------------------------------- | ----- | ------------------------------------------ |
| `GET`    | `/api/v1/users/me`               | any   | Current user profile                       |
| `PATCH`  | `/api/v1/users/me`               | any   | Update name, phone, avatar                 |
| `POST`   | `/api/v1/users/me/password`      | any   | Change password (revokes all sessions)     |
| `POST`   | `/api/v1/users/me/delete`        | any   | Soft-delete (anonymize PII, revoke tokens) |
| `POST`   | `/api/v1/users/me/avatar`        | any   | Issue avatar upload ticket                 |
| `GET`    | `/api/v1/users/me/addresses`     | any   | List addresses                             |
| `POST`   | `/api/v1/users/me/addresses`     | any   | Create address                             |
| `PATCH`  | `/api/v1/users/me/addresses/:id` | any   | Update address                             |
| `DELETE` | `/api/v1/users/me/addresses/:id` | any   | Delete (promotes new default if needed)    |
| `GET`    | `/api/v1/users`                  | ADMIN | List users (paginated, filterable)         |
| `GET`    | `/api/v1/users/:id`              | ADMIN | User detail                                |
| `PATCH`  | `/api/v1/users/:id`              | ADMIN | Suspend / reactivate                       |

### Validation rules

- **Phone**: E.164 format (e.g., `+919876543210`)
- **Password**: 8–128 chars, letters + numbers, not in common blocklist
- **Address**: required `line1`, `city`, `state`, `postalCode`; optional lat/lng (-90..90 / -180..180)
- **Admin suspend**: cannot suspend self or other admins

### Frontend pages

- **Customer**: `/profile` (name, phone, addresses CRUD modal), `/settings` (change password, delete account)
- **Worker**: `/profile` (name, phone), `/settings` (change password, delete account)
- **Admin**: `/users` (paginated table + search/filter), `/users/[id]` (detail + suspend/reactivate)

---

## Phase 3 — Worker Profiles

**Status**: ✅ Complete

Workers build a rich profile (headline, bio, hourly rate, service radius, skills with proficiency levels, and portfolio images). Customers discover verified workers through a public directory. Admins vet new workers through a verification queue.

### Backend endpoints (12/12)

#### Public — worker directory & skill catalog

| Method | Path                  | Auth   | Purpose                                                                                |
| ------ | --------------------- | ------ | -------------------------------------------------------------------------------------- |
| `GET`  | `/api/v1/workers`     | public | List workers (filters: `city`, `skill`, `minRating`, `verifiedOnly`, pagination, sort) |
| `GET`  | `/api/v1/workers/:id` | public | Worker detail (bio, skills, portfolio, stats — **no contact info**)                    |
| `GET`  | `/api/v1/skills`      | public | Active skill catalog (id, name, slug)                                                  |

#### Worker self-service (WORKER role)

| Method   | Path                               | Auth   | Purpose                                                         |
| -------- | ---------------------------------- | ------ | --------------------------------------------------------------- |
| `GET`    | `/api/v1/workers/me`               | WORKER | My profile + completeness % + skills + portfolio                |
| `PUT`    | `/api/v1/workers/me`               | WORKER | Create-or-replace profile (full upsert)                         |
| `PATCH`  | `/api/v1/workers/me`               | WORKER | Partial profile update (at least 1 field required)              |
| `PUT`    | `/api/v1/workers/me/skills`        | WORKER | Replace my skills list (atomic — validate skill IDs are active) |
| `GET`    | `/api/v1/workers/me/portfolio`     | WORKER | List my portfolio items (sorted by `sortOrder`)                 |
| `POST`   | `/api/v1/workers/me/portfolio`     | WORKER | Add portfolio item (image URL + optional caption)               |
| `DELETE` | `/api/v1/workers/me/portfolio/:id` | WORKER | Remove portfolio item (owner-scoped)                            |

#### Admin — verification queue

| Method | Path                               | Auth  | Purpose                                             |
| ------ | ---------------------------------- | ----- | --------------------------------------------------- |
| `GET`  | `/api/v1/admin/workers/pending`    | ADMIN | Unverified, active worker profiles (oldest first)   |
| `POST` | `/api/v1/admin/workers/:id/verify` | ADMIN | Set `isVerified` (admin is the only path to `true`) |

### Validation rules

- **`headline`**: 5–100 characters
- **`bio`**: 10–2000 characters (≥ 50 chars counts toward completeness)
- **`yearsExperience`**: integer 0–70
- **`hourlyRate`**: non-negative integer in **minor units** (e.g. paise); `null` to hide
- **`city`**: 1–80 characters
- **`serviceRadiusKm`**: 1–100 (km)
- **Skills**: max 30 per worker; `level ∈ {BEGINNER, INTERMEDIATE, EXPERT}`
- **Portfolio**: max **12** images per worker; `imageUrl` must be a valid `http(s)` URL ≤ 2048 chars; caption ≤ 280 chars

### Completeness score

Used to drive the "fill out your profile" meter in the worker UI:

```
checks = [
  headline present (≥ 5 chars),
  bio present (≥ 50 chars),
  hourlyRate set (> 0),
  city set,
  skills.length ≥ 1,
  portfolio.length ≥ 1,
]
score = round(passed / 6 * 100)
```

### Security highlights

- **Workers only modify their own profile** (`requireAuth` + `requireRole('WORKER')` + ownership check on portfolio deletes)
- **`isVerified` can only be flipped by an admin** through `/admin/workers/:id/verify` (no worker-self-service path)
- **Public detail excludes contact info** — only name, city, headline, bio, skills, portfolio, and aggregate stats
- **Skill IDs validated as active** before persisting worker skills (rejects stale/deactivated skills with `NOT_FOUND`)
- **Portfolio limit enforced at the service layer** — `BusinessRuleError` if count ≥ 12

### Frontend pages

- **Customer** (`client/`):
  - `/workers` — paginated directory with filter controls (skill, city, min rating, verified-only)
  - `/workers/[id]` — public profile detail (bio, skills, portfolio, rating)
- **Worker** (`worker/`):
  - `/profile` — worker fields (headline, bio, hourly rate, city, service radius) with **completeness bar** + verified badge
  - `/skills` — toggle skills from catalog + pick proficiency level (BEGINNER / INTERMEDIATE / EXPERT)
  - `/portfolio` — add (image URL + caption) and remove portfolio items (≤ 12)
- **Admin** (`admin/`):
  - `/workers/pending` — verification queue table (name, email, city, headline, experience, rate, completeness, joined date) with **Verify** action

---

## Phase 4 — Job Categories

**Status**: ✅ Complete

A managed taxonomy (`Category → Subcategory → Skill`) that powers filtering, discovery, and worker matching. The initial tree is seeded by `npm run prisma:seed` and can be edited from the admin app.

### Backend endpoints (12/12)

#### Public — categories & subcategories

(filterable by category / subcategory) |
| **Workers (self)** | get-my, upsert, patch, replace-skills, list/add/delete-portfolio |
| **Workers (admin)** | pending, verify |
| **Categories (public)** | list, get-by-slug, subcategories-for-category |
| **Categories (admin)** | list, create, update, add-subcategory, update-subcategory |
| **Skills (admin)** | create, update |
| **Jobs (customer)** | create, list-mine, get-mine, update, delete, cancel, add-attachment, delete-attachment |
| **Jobs (admin)** | list |
| **Jobs (public)** | list-open, detail-open |
| **Health** | `/healthz`, `/readyz`, `/version` |

**Total**: 55 endpoints across 13 modules.

---

#### Admin — categories

| Method  | Path                                         | Auth  | Purpose                                         |
| ------- | -------------------------------------------- | ----- | ----------------------------------------------- |
| `GET`   | `/api/v1/admin/categories`                   | ADMIN | All categories (incl. inactive) + subcategories |
| `POST`  | `/api/v1/admin/categories`                   | ADMIN | Create category                                 |
| `PATCH` | `/api/v1/admin/categories/:id`               | ADMIN | Update / activate / deactivate                  |
| `POST`  | `/api/v1/admin/categories/:id/subcategories` | ADMIN | Add subcategory                                 |
| `PATCH` | `/api/v1/admin/subcategories/:id`            | ADMIN | Update subcategory (name / order / isActive)    |

#### Admin — skills

| Method  | Path                       | Auth  | Purpose                                           |
| ------- | -------------------------- | ----- | ------------------------------------------------- |
| `POST`  | `/api/v1/admin/skills`     | ADMIN | Create skill (optionally linked to a subcategory) |
| `PATCH` | `/api/v1/admin/skills/:id` | ADMIN | Update / relink / deactivate                      |

### Validation rules

- **`name`**: 2–60 characters (category, subcategory, skill)
- **`slug`**: kebab-case, lowercase, max 80 chars (auto-generated from `name` when omitted)
- **`description`**: ≤ 500 characters
- **`iconKey`**: ≤ 40 characters (UI hint)
- **`sortOrder`**: non-negative integer (lower = first)
- **`isActive`**: defaults `true`; deactivating hides from all public reads

### Seed tree

The initial taxonomy is seeded automatically and includes:

```
Home Services      → Plumbing, Electrical, Carpentry, Painting, Appliance Repair
Cleaning           → Home Cleaning, Office Cleaning, Deep Cleaning
Tutoring           → School Subjects, Languages, Music
Beauty & Wellness  → Salon at Home, Spa & Massage, Makeup
Fitness            → Personal Trainer, Yoga
Tech Help          → Computer Repair, Mobile Repair, Smart Home Setup
Other              → Miscellaneous
```

### Security highlights

- **Public reads exclude inactive records** — `isActive=false` is never returned to non-admin callers
- **Admin-only mutations** — every `POST` / `PATCH` requires `ADMIN` role via `requireRole('ADMIN')`
- **Slug uniqueness enforced** at the DB layer; collisions throw `ConflictError` (HTTP 409)
- **Subcategory / skill lookups validated** — linking to a non-existent parent returns `NOT_FOUND`

### Frontend pages

- **Customer** (`client/`):
  - `/categories` — grid of active categories (icon key + subcategory count)
  - `/categories/[slug]` — category detail + subcategory list
  - Dashboard nav updated to include **Categories**
- **Worker** (`worker/`):
  - `/skills` — now grouped by **category pills** at the top; selecting a category filters the visible skills
- **Admin** (`admin/`):
  - `/categories` — create categories, toggle active/inactive, add subcategories inline, toggle subcategory active state

---

## Phase 5 — Job Posting

**Status**: ✅ Complete

Customers can post jobs (via a 5-step wizard), edit / cancel / soft-delete them while they are still in `DRAFT` or `OPEN`, attach reference images by URL, and track their progress through the lifecycle.

### Backend endpoints (9 total: 8 customer + 1 admin)

#### Customer — `/api/v1/jobs`

| Method   | Path                                         | Auth     | Purpose                                             |
| -------- | -------------------------------------------- | -------- | --------------------------------------------------- |
| `POST`   | `/api/v1/jobs`                               | CUSTOMER | Create a job (defaults to `OPEN`, optional `DRAFT`) |
| `GET`    | `/api/v1/jobs`                               | CUSTOMER | List my jobs (filters: `status`, pagination, sort)  |
| `GET`    | `/api/v1/jobs/:id`                           | CUSTOMER | Job detail (owner / admin only)                     |
| `PATCH`  | `/api/v1/jobs/:id`                           | CUSTOMER | Update — only allowed in `DRAFT` / `OPEN`           |
| `DELETE` | `/api/v1/jobs/:id`                           | CUSTOMER | Soft-delete — only allowed in `DRAFT` / `OPEN`      |
| `POST`   | `/api/v1/jobs/:id/cancel`                    | CUSTOMER | Cancel (sets status `CANCELLED` + reason)           |
| `POST`   | `/api/v1/jobs/:id/attachments`               | CUSTOMER | Add attachment (URL + optional caption)             |
| `DELETE` | `/api/v1/jobs/:id/attachments/:attachmentId` | CUSTOMER | Remove attachment (only in `DRAFT` / `OPEN`)        |

#### Admin — `/api/v1/admin/jobs` (read-only)

| Method | Path                 | Auth  | Purpose                                         |
| ------ | -------------------- | ----- | ----------------------------------------------- |
| `GET`  | `/api/v1/admin/jobs` | ADMIN | All jobs (incl. customer name + email, filters) |

### Validation rules

- **`title`**: 5–120 chars
- **`description`**: 20–4000 chars
- **`budgetMin` / `budgetMax`**: non-negative integers in **minor units** (e.g. paise); `min ≤ max`; either may be `null` for open budget
- **`categoryId`**: required, must be an **active** category
- **`subcategoryId`**: optional; when provided, must belong to the chosen category and be active
- **`addressId`**: required, must **belong to the caller** (ownership enforced)
- **`urgency`**: `LOW | NORMAL | HIGH | URGENT` (default `NORMAL`)
- **`scheduledFor`**: optional ISO datetime; if set, must be in the future
- **`status` on create**: `DRAFT` | `OPEN` (default `OPEN`)

### State machine

```
   ┌─────┐  publish   ┌──────┐  assign   ┌──────────┐  start   ┌────────────┐  complete   ┌───────────┐
   │DRAFT│ ─────────▶ │ OPEN │ ────────▶ │ ASSIGNED │ ───────▶ │ IN_PROGRESS│ ──────────▶ │ COMPLETED │
   └─────┘            └──────┘           └──────────┘          └────────────┘             └───────────┘
       │                 │                    │                     │
       └─────────────────┴────────────────────┴─────────────────────┴─▶ cancelJob() ──▶ CANCELLED
```

- **Customer edits** allowed only in `DRAFT` / `OPEN`
- **Customer soft-deletes** allowed only in `DRAFT` / `OPEN`
- **Cancellation** allowed in `DRAFT | OPEN | ASSIGNED | IN_PROGRESS`
- `completed` / `cancelled` / `expired` are terminal

### Security highlights

- **`requireRole('CUSTOMER')`** gates every job-creation / mutation route
- **Address ownership** is verified server-side (`ForbiddenError` if a customer tries to use another user's address)
- **Subcategory integrity** — subcategory must belong to the chosen category
- **Soft-delete** hides the job from all reads (`deletedAt IS NULL` filter on every list / get)
- **Admin read-only** in Phase 5 — admins cannot yet mutate jobs (moderation arrives in a later phase)

### Frontend pages

- **Customer** (`client/`):
  - `/my-jobs` — paginated list of your jobs with **status filter pills** (All / Draft / Open / Assigned / In Progress / Completed / Cancelled)
  - `/my-jobs/new` — **5-step wizard** (Category → Details → Budget → Address → Review) with optional save-as-draft
  - `/my-jobs/[id]` — full job detail with status timeline, attachment list (add / remove in editable states), cancel CTA, soft-delete CTA
- **Admin** (`admin/`):
  - `/jobs` — read-only table of all jobs (filterable by status) with customer name + email

---

## Phase 6 — Job Discovery

**Status**: ✅ Complete

Workers can browse the public feed of open jobs and customers can see what other people are requesting. The public worker feed gained richer filters (category, subcategory, max hourly rate, min experience).

### Backend endpoints (2 new + enriched existing)

#### Public — `/api/v1/jobs/public` (new in Phase 6)

| Method | Path                      | Auth   | Purpose                                                           |
| ------ | ------------------------- | ------ | ----------------------------------------------------------------- |
| `GET`  | `/api/v1/jobs/public`     | public | List **OPEN** jobs with rich filters + pagination + sorting       |
| `GET`  | `/api/v1/jobs/public/:id` | public | Detail; `OPEN` jobs visible to anyone, owners/admin see their own |

#### Public workers — enriched filters (Phase 6)

`GET /api/v1/workers` now also accepts:

- `categoryId`, `categorySlug`, `subcategoryId` — filter by taxonomy
- `maxHourlyRate` — include workers at or below the rate (or with no rate set)
- `minYearsExperience` — filter by experience floor
- Sort: `hourlyRate:asc|desc`, `yearsExperience:desc`, `totalJobsCompleted:desc`

### Validation rules

- **`page ≥ 1`**, **`pageSize 1–100`**
- **`minBudget ≤ maxBudget`** (otherwise 400)
- **`urgency`** must be one of `LOW | NORMAL | HIGH | URGENT`
- **`scheduledAfter`** must be ISO-8601 if provided
- **`search`** matches title or description (case-insensitive `contains`)

### Sort options

| `sort=`            | Behavior                                  |
| ------------------ | ----------------------------------------- |
| `createdAt:desc`   | **default** — newest first                |
| `createdAt:asc`    | oldest first                              |
| `scheduledFor:asc` | jobs scheduled soonest first (nulls last) |
| `budgetMax:desc`   | highest top-end budget first              |
| `budgetMax:asc`    | lowest top-end budget first               |
| `urgency:desc`     | `URGENT → HIGH → NORMAL → LOW`            |

`urgency` sort is performed in-memory after Prisma pagination to honor the stable ordering on the enum.

### Budget range filter

When `minBudget` and/or `maxBudget` are provided, only jobs whose budget interval **overlaps** with the requested range are returned:

- Job has `budgetMin` + `budgetMax` → overlap test `budgetMax ≥ min && budgetMin ≤ max`
- Job has only `budgetMax` → `budgetMax ≥ min`
- Job has only `budgetMin` → `budgetMin ≤ max`
- Job has neither → included (open budget)

### Security highlights

- **Public read-only** — `GET /jobs/public/*` never mutates state
- **Status visibility** — only `OPEN` jobs are returned in the public list; non-OPEN jobs are returned by `GET /jobs/public/:id` **only** to their owner or an admin (others get `404`)
- **Soft-deleted jobs excluded** from every public read (`deletedAt IS NULL`)
- **Worker public profile already excludes** contact info (Phase 3) — phone/email never leak

### Frontend pages

- **Worker** (`worker/`):
  - `/jobs` — paginated browse with search, city, category, urgency, budget range, sort
  - `/jobs/[id]` — public detail with description + attachments + "apply" placeholder (Phase 7 ships applications)
- **Customer** (`client/`):
  - `/jobs` — same public browse so customers can see open demand
  - `/jobs/[id]` — public detail
- Both dashboard navs now include **Browse Jobs**

---

## API Surface

| Resource                | Endpoints                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| **Auth**                | signup, login, refresh, logout, verify-email, resend-verification, forgot-password, reset-password |
| **Users (me)**          | get, update, change-password, delete, avatar-ticket                                                |
| **Users (addresses)**   | list, create, update, delete                                                                       |
| **Users (admin)**       | list, get, update                                                                                  |
| **Workers (public)**    | list (rich filters), detail                                                                        |
| **Skills (public)**     | catalog (filterable by category / subcategory)                                                     |
| **Workers (self)**      | get-my, upsert, patch, replace-skills, list/add/delete-portfolio                                   |
| **Workers (admin)**     | pending, verify                                                                                    |
| **Categories (public)** | list, get-by-slug, subcategories-for-category                                                      |
| **Categories (admin)**  | list, create, update, add-subcategory, update-subcategory                                          |
| **Skills (admin)**      | create, update                                                                                     |
| **Jobs (customer)**     | create, list-mine, get-mine, update, delete, cancel, add-attachment, delete-attachment             |
| **Jobs (admin)**        | list                                                                                               |
| **Jobs (public)**       | list-open, detail-open                                                                             |
| **Health**              | `/healthz`, `/readyz`, `/version`                                                                  |

**Total**: 55 endpoints across 13 modules.

**OpenAPI**: served at `GET /openapi.json` (OpenAPI 3.1) and visualized at `/docs` (Swagger UI).

---

## Architecture

### Backend layering

```
HTTP Request
    ↓
Express middleware (helmet, cors, rate-limit, pino-http)
    ↓
Auth + role middleware
    ↓
Validate (Zod) middleware
    ↓
Controller (thin HTTP wrapper)
    ↓
Service (business logic)
    ↓
Prisma repository
    ↓
PostgreSQL
```

### Frontend layering

```
Next.js App Router page
    ↓
Component (using UI primitives)
    ↓
Hook (useApi → ApiClient)
    ↓
@sevanto/shared ApiClient
    ↓
HTTP fetch with auth header + silent refresh
```

### Shared package

All three frontends import `@sevanto/shared` which provides:

- **Types**: `User`, `Address`, `Role`, API envelopes, input types
- **Validators**: client-side equivalents of server Zod schemas
- **`ApiClient` class**: typed REST client with silent refresh on 401
- **`createAuthStore`**: Zustand store factory with localStorage persistence

This eliminates type drift and validation-rule mismatches between server and clients.

---

## Security

Sevanto follows defense-in-depth at every layer. The full checklist lives in [docs/18-security-checklist.md](docs/18-security-checklist.md). Highlights:

| Control          | Implementation                                               |
| ---------------- | ------------------------------------------------------------ |
| Password hashing | argon2id (memory 19 MB, time 2)                              |
| Access tokens    | JWT HS256, 15-min TTL, in-memory on client                   |
| Refresh tokens   | opaque random 256-bit, SHA-256 hashed, rotated on refresh    |
| Refresh reuse    | detected → entire family revoked                             |
| Login throttling | 5 fails → 15-min lockout (Redis)                             |
| Rate limiting    | per-IP + per-user on sensitive routes                        |
| CORS             | allowlist per app origin                                     |
| Headers          | Helmet + CSP + HSTS                                          |
| PII redaction    | in logs (`*.password`, `*.token`, `*.passwordHash`)          |
| Soft-delete      | anonymizes email/name; revokes tokens; sets `isActive=false` |
| Admin guard      | suspends cannot target self or other admins                  |
| Secrets          | env-var only; never in code or logs                          |

---

## Testing

### Current coverage

| Suite                                      |                                            Tests | Status          |
| ------------------------------------------ | -----------------------------------------------: | --------------- |
| `tests/unit/jwt.test.ts`                   |                                                6 | ✅              |
| `tests/unit/password.test.ts`              |                                                3 | ✅              |
| `tests/unit/tokens.test.ts`                |                                                2 | ✅              |
| `tests/unit/errors.test.ts`                |                                                2 | ✅              |
| `tests/unit/validators.test.ts`            |                                               10 | ✅              |
| `tests/unit/users.validators.test.ts`      |                                               19 | ✅              |
| `tests/unit/workers.validators.test.ts`    |                                               24 | ✅              |
| `tests/unit/workers.service.test.ts`       |                                                7 | ✅              |
| `tests/unit/categories.validators.test.ts` |                                               27 | ✅              |
| `tests/unit/jobs.validators.test.ts`       |                                               37 | ✅              |
| `tests/unit/jobs.publicQuery.test.ts`      |                                               18 | ✅              |
| **Total unit**                             |                                          **155** | **✅ all pass** |
| `tests/integration/auth.test.ts`           | scaffolded (Supertest, gated by `describe.skip`) |

### Running tests

```bash
# All unit tests
npm --prefix server run test:unit

# Watch mode
npm --prefix server run test

# Integration (requires DATABASE_URL to a throwaway DB)
npm --prefix server run prisma:migrate:dev   # apply schema
npm --prefix server run test:integration
```

### Adding tests

Place `*.test.ts` files in `server/tests/unit/` or `server/tests/integration/`. Vitest is configured via `server/vitest.config.ts`.

---

## Documentation

### Top-level ([docs/](docs/))

| File                                                              | Purpose                                          |
| ----------------------------------------------------------------- | ------------------------------------------------ |
| [00-project-overview.md](docs/00-project-overview.md)             | What Sevanto is, monorepo layout, MVP scope      |
| [01-product-vision.md](docs/01-product-vision.md)                 | North-star metric, principles, anti-goals        |
| [02-business-model.md](docs/02-business-model.md)                 | Stakeholders, future monetization, risks         |
| [03-user-personas.md](docs/03-user-personas.md)                   | Priya (Customer), Ramesh (Worker), Aisha (Admin) |
| [04-system-architecture.md](docs/04-system-architecture.md)       | High-level diagram, layering                     |
| [08-api-design.md](docs/08-api-design.md)                         | REST conventions, envelopes, error codes         |
| [09-authentication-design.md](docs/09-authentication-design.md)   | Token strategy, flows, password rules            |
| [10-role-permission-matrix.md](docs/10-role-permission-matrix.md) | Customer / Worker / Admin access matrix          |
| [11/12/13-ui-pages-\*.md](docs/)                                  | UI page inventory for each app                   |
| [16-development-phases.md](docs/16-development-phases.md)         | Phase overview + dependency graph                |
| [18-security-checklist.md](docs/18-security-checklist.md)         | Security controls and sign-off                   |
| [23-progress-tracker.md](docs/23-progress-tracker.md)             | **Live phase status**                            |

### Architecture evaluations ([docs/architecture/](docs/architecture/))

15 documents covering every technology choice with rationale, alternatives considered, and tagging (**MVP / Pre-Launch / Future / Enterprise**).

### Phase specs ([docs/phases/](docs/phases/))

One file per phase (1–18) with all required sections: objective, DB changes, Prisma changes, backend/frontend tasks per app, API endpoints, validation rules, security requirements, acceptance criteria, testing checklist, deployment notes.

---

## Scripts Reference

### Root

```bash
npm install                              # install all workspaces
npm run dev:server                       # backend in dev mode
npm run dev:client                       # customer app
npm run dev:worker                       # worker app
npm run dev:admin                        # admin app
npm run build:server                     # tsc compile backend
npm run typecheck                        # typecheck server + shared
npm test                                 # run server unit tests
```

### Server ([server/](server/))

```bash
npm run dev                  # tsx watch src/server.ts
npm run build                # tsc → dist/
npm start                    # node dist/server.js
npm run typecheck            # tsc --noEmit
npm run lint                 # eslint
npm test                     # vitest run all
npm run test:unit            # vitest tests/unit
npm run test:integration     # vitest tests/integration
npm run prisma:generate      # prisma generate
npm run prisma:migrate:dev   # dev migrations
npm run prisma:migrate:deploy# prod migrations
npm run prisma:seed          # seed admin user
npm run prisma:studio        # Prisma Studio
node smoke.js                # runtime smoke test
```

### Client / Worker / Admin

```bash
npm run dev                  # next dev (port 3001 / 3002 / 3003)
npm run build                # next build
npm start                    # next start
npm run typecheck            # tsc --noEmit
npm run lint                 # next lint
```

---

## Environment Variables

### Server ([server/.env.example](server/.env.example))

| Var                                                  | Required | Default                          | Purpose                                 |
| ---------------------------------------------------- | -------- | -------------------------------- | --------------------------------------- |
| `NODE_ENV`                                           | yes      | `development`                    | `development` / `test` / `production`   |
| `PORT`                                               | no       | `3000`                           | HTTP port                               |
| `LOG_LEVEL`                                          | no       | `info`                           | Pino log level                          |
| `DATABASE_URL`                                       | **yes**  | —                                | PostgreSQL connection string            |
| `REDIS_URL`                                          | no       | —                                | Redis for rate limit, denylist          |
| `JWT_ACCESS_SECRET`                                  | **yes**  | —                                | HS256 secret (≥32 chars)                |
| `JWT_REFRESH_SECRET`                                 | **yes**  | —                                | opaque-token signing secret (≥32 chars) |
| `JWT_ACCESS_TTL`                                     | no       | `15m`                            | access token TTL                        |
| `JWT_REFRESH_TTL`                                    | no       | `30d`                            | refresh token TTL                       |
| `MAIL_HOST`                                          | no       | `localhost`                      | SMTP host                               |
| `MAIL_PORT`                                          | no       | `1025`                           | SMTP port                               |
| `MAIL_USER` / `MAIL_PASS`                            | no       | —                                | SMTP creds                              |
| `MAIL_FROM`                                          | no       | `Sevanto <no-reply@sevanto.app>` | From address                            |
| `APP_BASE_URL_CLIENT`                                | no       | `http://localhost:3001`          | For email links                         |
| `APP_BASE_URL_WORKER`                                | no       | `http://localhost:3002`          | For email links                         |
| `APP_BASE_URL_ADMIN`                                 | no       | `http://localhost:3003`          | For email links                         |
| `CORS_ORIGINS`                                       | no       | 3 local URLs                     | Comma-separated origin allowlist        |
| `RATE_LIMIT_WINDOW_MS`                               | no       | `60000`                          | Global window                           |
| `RATE_LIMIT_MAX`                                     | no       | `100`                            | Global req/window                       |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_FULL_NAME` | for seed | —                                | Seed admin user                         |

### Frontends

| Var                        | Required | Default                 | Purpose     |
| -------------------------- | -------- | ----------------------- | ----------- |
| `NEXT_PUBLIC_API_BASE_URL` | no       | `http://localhost:3000` | Backend URL |

---

## Roadmap

### MVP (Phases 1–14) — building

- ✅ Phase 1 — Authentication
- ✅ Phase 2 — User Management
- ✅ Phase 3 — Worker Profiles (skills, portfolio, admin verification queue)
- ✅ Phase 4 — Job Categories (managed taxonomy: Category → Subcategory → Skill)
- ✅ Phase 5 — Job Posting (customer wizard, status machine, attachments, admin read-only)
- ✅ Phase 6 — Job Discovery (public job feed, public job detail, enriched worker filters)
- 🟡 Phase 7 — Job Applications
- 🟡 Phase 8 — Job Assignment
- 🟡 Phase 9 — Job Lifecycle
- 🟡 Phase 10 — Reviews & Ratings
- 🟡 Phase 11 — Notifications
- 🟡 Phase 12 — Search & Filters
- 🟡 Phase 13 — Admin Dashboard
- 🟡 Phase 14 — Reports & Analytics

### Post-MVP (Phases 15–18)

- 🔮 Phase 15 — Realtime Chat (Socket.io + Redis Pub/Sub)
- 🔮 Phase 16 — Maps & Location-based Discovery
- 🔮 Phase 17 — Payments & Monetization (Stripe / Razorpay)
- 🔮 Phase 18 — Production Launch Hardening

See [docs/15-feature-roadmap.md](docs/15-feature-roadmap.md) and [docs/25-future-features.md](docs/25-future-features.md) for the long-term vision (mobile apps, push notifications, premium workers, subscriptions, contractor accounts, etc.).

---

## License

Proprietary — internal Sevanto codebase.

---

## Contributing

Each phase follows this workflow (per [docs/16-development-phases.md](docs/16-development-phases.md)):

1. Update progress tracker (`Pending → In Progress`)
2. **Backend first**: schema → migration → API → tests
3. **Frontend**: implement in all three apps
4. Integration verification (typecheck + build across all packages)
5. Update tracker (`Completed`)
6. Never start a new phase until the current is `Completed`

Every feature ships with: DB schema, API documentation, validators, security review, tests, and three frontend implementations.

---

**Built with care. Phase 6 complete — 55/55 endpoints live, 155/155 tests green, ready for Job Applications.**
