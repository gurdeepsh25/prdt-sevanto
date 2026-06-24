# 04 — Background Jobs

## Decision: **BullMQ (Redis-backed queues) for all async work.**

**Tag:** Required For MVP (introduced at Phase 1 for emails; expanded over time).

## Why BullMQ, Not Raw Redis Queues

- **Mature** — handles retries, backoff, rate limiting, prioritization, cron.
- **Dashboard** — Bull Board for ops visibility.
- **TypeScript-first** — fits the stack.
- **Lower ops risk** than rolling our own on raw `BLPOP`/`BRPOP`.

## Why Not Other Queue Systems

| Option                       | Verdict   | Reason                                         |
| ---------------------------- | --------- | ---------------------------------------------- |
| Raw Redis (`BLPOP`, `LPUSH`) | ❌        | We'd reinvent BullMQ.                          |
| RabbitMQ                     | ⏳ Future | Worth it only if we outgrow Redis broker.      |
| AWS SQS                      | ⏳ Future | Lock-in; revisit if moving heavy infra to AWS. |
| Kafka                        | ❌        | Wrong tool — event streaming, not jobs.        |

## Queues (Names + Use Cases)

| Queue                    | Producer                                   | Consumer            | Payload                | Retry          | Phase |
| ------------------------ | ------------------------------------------ | ------------------- | ---------------------- | -------------- | ----- |
| `mail`                   | All services that send transactional email | Mail worker         | `{to, template, data}` | 3x exp backoff | 1     |
| `notifications.fanout`   | App events                                 | Notification worker | `{userId, type, data}` | 3x             | 11    |
| `notifications.email`    | Notification worker                        | Mail worker         | `{to, template, data}` | 3x             | 11    |
| `cleanup.soft-deletes`   | Cron (daily)                               | Cleanup worker      | n/a                    | 1x             | 13    |
| `cleanup.expired-tokens` | Cron (hourly)                              | Cleanup worker      | n/a                    | 1x             | 1     |
| `analytics.aggregate`    | On job completed                           | Analytics worker    | `{jobId}`              | 3x             | 14    |
| `search.index.update`    | On create/update of searchable entity      | Index updater       | `{entity, id}`         | 5x             | 12    |
| `reports.daily`          | Cron                                       | Report builder      | n/a                    | 1x             | 14    |
| `media.thumbnail`        | On upload                                  | Image processor     | `{key}`                | 3x             | 3     |
| `chat.delivery`          | New chat message                           | Socket.io gateway   | `{chatId, msg}`        | 3x             | 15    |
| `payments.reconcile`     | Provider webhook                           | Reconciliation      | `{providerEventId}`    | 5x             | 17    |

## Scheduled Jobs (Cron)

Use BullMQ repeatable jobs:

- **Hourly**: purge expired refresh tokens, expired reset/verify tokens.
- **Daily**: purge soft-deleted records > 90 days, recompute daily KPIs.
- **Weekly**: rotate logs, recompute category popularity.

## Priorities

- BullMQ supports per-job priority. Default order:
  1. Mail (transactional UX).
  2. Notifications fanout.
  3. Search index updates.
  4. Analytics aggregates.
  5. Cleanup.

## Retry & Backoff

- Default: 3 attempts with exponential backoff (1s → 5s → 30s).
- Idempotency: every job handler must be idempotent (idempotency key in payload).

## Dead-Letter

- After max attempts, jobs land in `failed` set with reason.
- Bull Board UI lets ops inspect/replay.
- Alert on DLQ growth.

## Operational Concerns

- Bull Board exposed at `/admin/queues` (admin-only) in non-production.
- Worker concurrency: start at 4 per queue; tune per CPU.

## Scaling

- Workers run as separate Node.js processes (`worker.ts` entrypoint).
- Horizontally scalable — Redis broker coordinates.
- Sticky problem: image-processing needs CPU. Pre-launch: separate worker pool with CPU-optimized instances.

## Tagging Summary

| Tech                    | Tag                               |
| ----------------------- | --------------------------------- |
| BullMQ                  | **Required For MVP**              |
| Bull Board              | Required Before Production Launch |
| Separate worker process | Required Before Production Launch |
| RabbitMQ migration      | Future Enhancement                |
