# 03 — Cache & Session Layer (Redis)

## Decision: **Redis is Required For MVP.**

Redis is a single, well-understood primitive that solves many problems at once. We adopt it from Phase 1.

## What Redis Is Used For

| Use Case                                  | Data                              | TTL                  | Phase  |
| ----------------------------------------- | --------------------------------- | -------------------- | ------ |
| Rate limiting counters                    | counters per IP/email/user        | window-based         | 1      |
| OTP storage (future)                      | hashed OTP + attempts             | 5 min                | Future |
| Email verification tokens                 | token → userId, used flag         | 1 hour               | 1      |
| Password reset tokens                     | token → userId, used flag         | 15 min               | 1      |
| Refresh-token denylist (revoked families) | token family id                   | until expiry         | 1      |
| Session-active cache                      | last-seen user → ts               | sliding              | 1      |
| Hot list cache                            | category tree, popular categories | 5–60 min             | 4+     |
| Job search results cache                  | query hash → result               | 60 s                 | 6+     |
| Worker profile cache                      | workerId → profile JSON           | 5 min                | 3+     |
| Realtime presence                         | userId → socket ids               | sliding              | 15     |
| Pub/Sub for realtime fan-out              | channel messages                  | n/a                  | 15     |
| Job queue backing store (BullMQ)          | jobs                              | persistent + delayed | 1      |

## Decision: Where to Store Refresh Tokens

**Recommendation: PostgreSQL (source of truth) + Redis (revocation cache).**

### Reasoning

| Option                        | Pros                                                                                                         | Cons                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| **Postgres only**             | Single source of truth; joins with `users`; durable.                                                         | Per-request revocation check costs a query.                       |
| **Redis only**                | Fast revocation; native TTL.                                                                                 | Risk of data loss if not persisted; can't easily join with users. |
| **Postgres + Redis (chosen)** | Postgres is source of truth (durable, auditable). Redis holds denylist for revoked families for O(1) reject. | Slightly more code.                                               |

### Implementation

- `refresh_tokens` table in Postgres (token hash, userId, expiresAt, revokedAt, familyId, ua, ip).
- On every `/auth/refresh`:
  1. Verify token hash exists in Postgres.
  2. Check Redis denylist (`sess:revoked:<familyId>`) — reject if present.
  3. Rotate: insert new row, mark old `revokedAt`.
  4. On reuse of revoked token: write entire family id to denylist, revoke all rows in Postgres.

### When to Use Redis Only

- After we add sliding-session expiry and need very high RPS on `/auth/refresh`. Not in MVP.

## Decision: OTP Storage

- Hashed OTP + attempt counter in Redis with 5-minute TTL.
- Used by future passwordless flows (email OTP, phone OTP).
- Postgres alternative would require cleanup cron — Redis TTL handles it natively.

## Decision: Email Verification + Password Reset Tokens

- Postgres is the durable store (audit, admin can revoke).
- Optional Redis cache of "is this token already used" for fast lookups — not required in MVP.
- **Keep Postgres-only** for MVP; add Redis cache if it shows up in profiling.

## Decision: Session Storage

- **Stateless access JWTs + rotating refresh tokens** is the model.
- We do **not** use server-side session storage.
- "Session" is a logical construct = (refresh-token family id + last activity).
- Redis tracks "last activity" for analytics/UX (e.g., "active now" badges) only.

## Decision: Rate Limiting

- `express-rate-limit` with **Redis store** (`rate-limit-redis`).
- Allows global limits across multiple backend instances.
- Per-IP, per-email, per-user buckets.

## Decision: Job Queues

- BullMQ (built on Redis) — see [background-jobs.md](background-jobs.md).
- Redis acts as the broker.

## Decision: Realtime Presence

- Tracked in Redis with sliding TTL keyed by userId.
- Updated on socket connect/disconnect/heartbeat.
- Used for "online now" indicators in future phases.

## Redis Configuration

- Version: Redis 7.x.
- Persistence: AOF + RDB (managed service provides this).
- Eviction: `allkeys-lru` for cache; `noeviction` for queue keys (separate DB).
- Memory: start with 256 MB; autoscale at higher tiers.

## High Availability

- MVP: single managed Redis.
- Pre-launch: managed Redis with replication (primary + replica).
- Enterprise: Redis Cluster + Sentinel / managed equivalent.

## Alternative Considered

| Option                    | Verdict | Reason                                                          |
| ------------------------- | ------- | --------------------------------------------------------------- |
| Memcached                 | ❌      | No persistence, no lists/streams, no pub/sub needed for BullMQ. |
| In-memory (process-local) | ❌      | Doesn't work with multiple instances.                           |
| Hazelcast                 | ❌      | Operational overhead unjustified at our scale.                  |
