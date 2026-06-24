# 12 — DevOps

## Tooling

| Tool           | Tag                               | Purpose                  |
| -------------- | --------------------------------- | ------------------------ |
| Docker         | Required For MVP                  | Backend containerization |
| Docker Compose | Required For MVP                  | Local dev orchestration  |
| GitHub Actions | Required For MVP                  | CI/CD                    |
| Nginx          | Required Before Production Launch | Reverse proxy + TLS      |

## 12.1 Local Development Architecture

```
docker-compose up
├─ postgres       (5432)
├─ redis          (6379)
├─ mailhog        (1025 SMTP, 8025 UI)
├─ minio          (S3-compatible, optional for local file uploads)
└─ server         (3000, hot reload via tsx)
```

Frontend apps run via `pnpm dev` on host (ports 3001/3002/3003) so HMR is fast.

### Volumes

- `postgres_data` — persistent.
- `redis_data` — persistent.
- Source mounted for hot reload.

### Bootstrap Script

- `pnpm bootstrap` → install, copy envs, `prisma migrate dev`, `prisma db seed`.

### .env.example

Lists every required variable with placeholder values.

## 12.2 Staging Architecture

```
[Vercel] customer.staging.sevanto.app ──┐
[Vercel] worker.staging.sevanto.app  ──┼──▶ [Render/Fly] api.staging.sevanto.app
[Vercel] admin.staging.sevanto.app   ──┘            │
                                                     ├── Postgres (managed)
                                                     ├── Redis (managed)
                                                     └── Mail provider (test mode)
```

- Single backend instance (autoscaling on).
- Single managed Postgres (small).
- Single managed Redis (small).
- Sentry project: `sevanto-staging`.
- Logs shipped to log sink.
- Auto-deploy from `develop` branch.

## 12.3 Production Architecture

```
[Cloudflare] cdn.sevanto.app
     │
     ├── /client/*  → Vercel (customer)
     ├── /worker/*  → Vercel (worker)
     └── /admin/*   → Vercel (admin)
                     │
                     └── [Nginx LB] api.sevanto.app
                          │
                          ├──▶ [API node 1] ──┐
                          ├──▶ [API node 2] ──┼──▶ Postgres (primary + replica)
                          └──▶ [API node N] ──┤   ├── Redis (primary + replica)
                                                 └── BullMQ worker pool
```

### Components

| Component      | Provider (Recommended)        | Notes                               |
| -------------- | ----------------------------- | ----------------------------------- |
| Postgres       | Neon / Supabase / RDS         | Automated backups, PITR             |
| Redis          | Upstash / ElastiCache         | Replication                         |
| Object storage | Cloudflare R2                 | CDN-served                          |
| Email          | Postmark / SES / Resend       | SPF/DKIM/DMARC                      |
| Frontends      | Vercel                        | Edge cache                          |
| Backend        | Render / Fly.io / ECS         | Dockerized                          |
| LB             | Nginx (in front of API)       | TLS termination, rate limit at edge |
| CDN            | Cloudflare                    | WAF, DDoS                           |
| Secrets        | Doppler / AWS Secrets Manager | Rotated                             |

### Why Nginx at Edge

- Cheap rate limiting before hitting app.
- TLS termination.
- Request size limits.
- Header normalization.

### Why Vercel for Frontends

- Edge cache for static + ISR pages.
- Native Next.js.
- Preview URLs per PR.

### Why BullMQ Workers Separate

- Independent scaling.
- Different instance type (CPU-optimized) for image processing.
- Avoids contention with API.

## 12.4 CI/CD Pipelines (GitHub Actions)

### CI (`on: pull_request`)

1. Lint (ESLint).
2. Typecheck (tsc --noEmit).
3. Unit tests.
4. Integration tests (Postgres + Redis service containers).
5. Build (backend + each frontend).
6. Coverage upload.

### Deploy Staging (`on: push to develop`)

1. CI passes.
2. `prisma migrate deploy` on staging DB.
3. Build + push Docker image.
4. Deploy to Render/Fly staging.
5. Run E2E smoke (Playwright).

### Deploy Production (`on: tag v*.*.*`)

1. CI passes.
2. Manual approval gate.
3. `prisma migrate deploy` on production DB.
4. Build + push image with tag.
5. Deploy with rolling restart.
6. Smoke tests + synthetic monitor.
7. Notify Slack.

## 12.5 Environments & Promotion

| Stage       | Branch     | Auto-Deploy |
| ----------- | ---------- | ----------- |
| Dev (local) | feature/\* | manual      |
| Staging     | develop    | yes         |
| Production  | tag        | gated       |

## 12.6 Backup & DR

- Postgres: daily snapshot + PITR (7 days retention at MVP, 30 days at scale).
- Object storage: versioned (R2 versioning enabled).
- Quarterly restore drills.
- Documented RTO/RPO.

## 12.7 Tagging Summary

| Tech                   | Tag                               |
| ---------------------- | --------------------------------- |
| Docker                 | Required For MVP                  |
| Docker Compose         | Required For MVP                  |
| GitHub Actions         | Required For MVP                  |
| Nginx                  | Required Before Production Launch |
| Managed Postgres       | Required For MVP                  |
| Managed Redis          | Required Before Production Launch |
| Cloudflare (CDN + WAF) | Required Before Production Launch |
| Worker pool (separate) | Required Before Production Launch |
