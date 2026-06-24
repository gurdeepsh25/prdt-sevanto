# 19 — Deployment Strategy

## Environments

| Env          | Purpose            | Stack                       |
| ------------ | ------------------ | --------------------------- |
| `local`      | Developer machines | Docker Compose              |
| `staging`    | Pre-release QA     | Cloud (Vercel + Render/Fly) |
| `production` | Live               | Multi-region cloud          |

## Backend Hosting (MVP)

- **Render** or **Fly.io** or **Railway** (single container or VM).
- Postgres: managed (Neon, Supabase, RDS).
- Migrations run on deploy via `prisma migrate deploy`.
- Health check endpoint `/healthz`.

## Frontend Hosting

- **Vercel** for all three Next.js apps (separate projects).
- Preview deployments per PR.
- Environment variables configured per env.

## CI/CD

- GitHub Actions pipelines:
  - **CI**: lint, typecheck, test, build.
  - **Deploy (staging)**: on merge to `develop`.
  - **Deploy (production)**: on tag/release.

## Containerization

- Backend Dockerfile (`node:20-alpine`).
- Compose file for local (postgres + server).
- Image pushed to registry on release.

## Environment Variables

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`
- `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`
- `APP_BASE_URL_CLIENT`, `APP_BASE_URL_WORKER`, `APP_BASE_URL_ADMIN`
- `CORS_ORIGINS`
- `NODE_ENV`

## Database Migrations

- Versioned via Prisma.
- Backward-compatible changes preferred.
- For destructive changes: multi-step migration (add new column → backfill → switch → drop).

## Rollback Plan

- Blue/green or rolling deploys (platform-dependent).
- DB migrations have down scripts where possible.
- Feature flags for risky rollouts.

## DNS & TLS

- Custom domain per app.
- TLS via hosting platform (auto).
- DNS managed on Cloudflare.

## Release Process

1. Cut release branch.
2. Run full test + E2E.
3. Manual smoke.
4. Tag release.
5. Auto-deploy to production.
6. Monitor for 1h post-deploy.

## Post-Deploy

- Smoke scripts run automatically.
- Status page updated.
- Slack notification on success/failure.
