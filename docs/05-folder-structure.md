# 05 — Folder Structure

## Root

```
sevanto/
├── client/        # Customer web app (Next.js)
├── worker/        # Worker web app (Next.js)
├── admin/         # Admin web app (Next.js)
├── server/        # Backend API (Node.js + Express + TS)
└── docs/          # All planning + implementation docs
```

## server/

```
server/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validators.ts
│   │   │   └── auth.types.ts
│   │   ├── users/
│   │   ├── workers/
│   │   ├── categories/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── reviews/
│   │   ├── notifications/
│   │   ├── search/
│   │   └── admin/
│   ├── common/
│   │   ├── middlewares/   # auth, error, rate-limit, validate
│   │   ├── guards/        # role guards
│   │   ├── utils/         # hash, token, pagination
│   │   ├── errors/        # AppError, NotFoundError, etc.
│   │   └── validators/    # shared zod helpers
│   ├── infra/
│   │   ├── prisma/        # client, seed
│   │   ├── mail/          # nodemailer transport, templates
│   │   ├── storage/       # S3 client, signed urls
│   │   └── logger/        # pino instance
│   ├── config/
│   │   ├── env.ts
│   │   ├── db.ts
│   │   └── cors.ts
│   ├── app.ts             # express app
│   └── server.ts          # entry point
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

## client/ (Customer App)

```
client/
├── src/
│   ├── app/                    # App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   ├── (public)/
│   │   │   ├── page.tsx        # Landing
│   │   │   ├── workers/
│   │   │   ├── categories/
│   │   │   └── jobs/
│   │   ├── (dashboard)/
│   │   │   ├── profile/
│   │   │   ├── my-jobs/
│   │   │   ├── post-job/
│   │   │   └── notifications/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── workers/
│   │   └── shared/
│   ├── hooks/
│   ├── stores/                 # zustand
│   ├── lib/                    # api client
│   ├── types/
│   └── styles/
├── public/
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── package.json
```

## worker/ (Worker App)

Mirrors `client/` structure with worker-specific routes:

- `(dashboard)/profile`, `(dashboard)/applications`, `(dashboard)/assigned-jobs`, `(dashboard)/portfolio`, `(dashboard)/skills`, `(dashboard)/notifications`.

## admin/ (Admin App)

- `(dashboard)/overview`, `(dashboard)/users`, `(dashboard)/workers`, `(dashboard)/jobs`, `(dashboard)/reports`, `(dashboard)/analytics`, `(dashboard)/categories`, `(dashboard)/notifications`, `(dashboard)/settings`.

## docs/

```
docs/
├── 00-project-overview.md
├── 01-product-vision.md
├── 02-business-model.md
├── 03-user-personas.md
├── 04-system-architecture.md
├── 05-folder-structure.md
├── 06-database-schema.md
├── 07-prisma-schema-plan.md
├── 08-api-design.md
├── 09-authentication-design.md
├── 10-role-permission-matrix.md
├── 11-ui-pages-customer.md
├── 12-ui-pages-worker.md
├── 13-ui-pages-admin.md
├── 14-component-architecture.md
├── 15-feature-roadmap.md
├── 16-development-phases.md
├── 17-testing-strategy.md
├── 18-security-checklist.md
├── 19-deployment-strategy.md
├── 20-scaling-plan.md
├── 21-monetization-plan.md
├── 22-launch-plan.md
├── 23-progress-tracker.md
├── 24-backlog.md
├── 25-future-features.md
└── phases/
    ├── phase-01-authentication.md
    ├── phase-02-user-management.md
    └── ... (phase-02 through phase-18)
```

## Naming Conventions

- Folders: kebab-case.
- Files: kebab-case for assets; camelCase or kebab-case for TS files (project standard: kebab-case).
- Components: PascalCase.
- Functions/vars: camelCase.
- DB tables: snake_case (Prisma map).
- API routes: kebab-case paths (`/api/v1/auth/forgot-password`).
