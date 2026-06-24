# Architecture Addendum — Index

> **Purpose**: Capture explicit technology evaluations for every architectural concern that the master plan touches but does not deeply justify. The original docs (00–25) describe _what_; this folder records _why_ and _when_.

|   # | File                                                        | Topic                                                 |
| --: | ----------------------------------------------------------- | ----------------------------------------------------- |
|  01 | [tech-stack-summary.md](architecture/tech-stack-summary.md) | Final technology decisions and required-by-phase tags |
|  02 | [database.md](architecture/database.md)                     | PostgreSQL + Prisma rationale, indexing strategy      |
|  03 | [cache-and-sessions.md](architecture/cache-and-sessions.md) | Redis usage matrix, refresh-token storage decision    |
|  04 | [background-jobs.md](architecture/background-jobs.md)       | BullMQ vs raw Redis queues, use cases                 |
|  05 | [realtime.md](architecture/realtime.md)                     | Socket.io + Redis Pub/Sub scaling                     |
|  06 | [file-storage.md](architecture/file-storage.md)             | AWS S3 vs Cloudflare R2                               |
|  07 | [validation.md](architecture/validation.md)                 | Zod vs express-validator                              |
|  08 | [logging.md](architecture/logging.md)                       | Pino vs Winston, log strategy                         |
|  09 | [monitoring.md](architecture/monitoring.md)                 | Sentry, Prometheus, Grafana                           |
|  10 | [api-documentation.md](architecture/api-documentation.md)   | OpenAPI, versioning                                   |
|  11 | [security.md](architecture/security.md)                     | JWT, hashing, rate limiting, CSRF, XSS, secrets       |
|  12 | [devops.md](architecture/devops.md)                         | Docker, Compose, GH Actions, Nginx, envs              |
|  13 | [search.md](architecture/search.md)                         | Postgres FTS vs OpenSearch/Elasticsearch              |
|  14 | [scalability.md](architecture/scalability.md)               | MVP → 1M users recommendations                        |

## Tagging Convention

Each technology is tagged with one of:

- **Required For MVP** — must be in production by end of Phase 14.
- **Required Before Production Launch** — needed before public launch (Phase 18).
- **Future Enhancement** — planned but not blocking launch.
- **Enterprise Scale Requirement** — only at very high scale.

## Decision Heuristics

- Prefer fewer moving parts in MVP.
- Add infrastructure only when it unlocks a capability or removes a hard limit.
- Each addition must have an operator (runbook / on-call runnable).

> No application code is to be generated until these decisions are approved.
