# 02 — Database

## Decision: **PostgreSQL + Prisma** ✅

**Tag:** Required For MVP.

## Why PostgreSQL

- **Relational integrity** — jobs, applications, reviews, users form a heavily related graph; FK constraints prevent data corruption.
- **Mature ecosystem** — battle-tested, predictable at scale.
- **Full-Text Search** — `tsvector`, `pg_trgm`, GIN indexes cover search in MVP without external infra.
- **JSONB** — flexible columns (`Notification.data`, `AuditLog.metadata`) without losing schema discipline.
- **Transactions** — strong guarantees needed for job assignment + payment intents.

## Why Prisma

- **Type-safe queries** — aligns with TypeScript stack.
- **Single source of truth** — `schema.prisma` drives DB schema, types, and migrations.
- **Migrations** — `prisma migrate` for versioned, reviewable schema changes.
- **Prisma Client** — connection pooling, prepared statements (SQL injection prevention).

## Version

- PostgreSQL **15+** (latest LTS in our window).
- Prisma **5.x**.

## Schema Strategy

- One schema in `server/prisma/schema.prisma`.
- Migrations versioned under `prisma/migrations/`.
- Seed script (`prisma/seed.ts`) for categories, skills, admin user.

## Indexing Strategy (covers MVP)

| Table              | Index                                     | Purpose               |
| ------------------ | ----------------------------------------- | --------------------- | --- | --- | -------------- | --- |
| `users`            | `(email)` unique                          | Login lookup          |
| `users`            | `(role)`                                  | Admin filters         |
| `worker_profiles`  | `(user_id)` unique                        | 1:1 lookup            |
| `worker_profiles`  | `(is_verified)`                           | Verified-only filters |
| `worker_profiles`  | `(city)`                                  | Locality search       |
| `jobs`             | `(status)`                                | Discovery queries     |
| `jobs`             | `(category_id)`                           | Category filters      |
| `jobs`             | `(city)`                                  | Locality              |
| `jobs`             | `(created_at DESC)`                       | Recent jobs           |
| `jobs`             | `gin(to_tsvector('english', title         |                       | ' ' |     | description))` | FTS |
| `job_applications` | `(job_id)`, `(worker_id)`, `(status)`     | List ops              |
| `reviews`          | `(reviewee_id)`, `(job_id)` unique        | Aggregates            |
| `notifications`    | `(user_id, read_at)`, `(created_at DESC)` | Bell queries          |
| `reports`          | `(status)`                                | Admin queue           |
| `audit_logs`       | `(actor_id, created_at DESC)`             | Admin view            |

## Search Columns (FTS-ready)

- `jobs.title`, `jobs.description` — combined `tsvector`.
- `worker_profiles.headline`, `worker_profiles.bio` — combined.
- `skills.name`, `categories.name` — for autocomplete.

Enable extension:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

## Connection Pooling

- Application-level pooling via Prisma.
- At higher scale, introduce **PgBouncer** in front of Postgres (transaction pooling). Required at **10K+ users** tier.

## Backups

- Automated daily snapshots via managed Postgres.
- Point-in-Time Recovery (PITR) enabled.
- Quarterly restore drills.

## Disaster Recovery

- RPO ≤ 15 min, RTO ≤ 1 hour at MVP.
- Tighten at enterprise scale.

## What PostgreSQL Is Not

- **Not a search engine at scale.** FTS is fine for MVP. Migrate to Meilisearch/OpenSearch if query latency exceeds SLA or result quality requires fuzzy/typo-tolerant matching at volume.
- **Not a queue.** Use BullMQ + Redis for async work.

## Alternative Considered

| Option  | Verdict | Reason                                        |
| ------- | ------- | --------------------------------------------- |
| MySQL   | ❌      | Weaker FTS, weaker JSONB.                     |
| MongoDB | ❌      | Job graph is highly relational.               |
| SQLite  | ❌      | Single-writer, no concurrency for production. |
