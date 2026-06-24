# 14 — Scalability

Concrete recommendations per scale tier.

## Tier 0 — MVP (< 10K users)

| Concern         | Recommendation                                                 |
| --------------- | -------------------------------------------------------------- |
| Compute         | Single backend container (1–2 vCPU, 2–4 GB RAM) on Render/Fly. |
| Database        | Single managed Postgres (small instance, ~$30–50/mo).          |
| Redis           | Single managed Redis (small, ~$15/mo).                         |
| Object storage  | Cloudflare R2 (pay-as-you-go).                                 |
| Frontends       | Vercel (free/pro).                                             |
| Background jobs | Same container or tiny separate process.                       |
| Search          | Postgres FTS.                                                  |
| Rate limit      | Redis-backed.                                                  |
| Realtime        | Not yet active.                                                |

**Capacity:** ~5k DAU comfortably.

## Tier 1 — 10K+ users

| Concern         | Recommendation                                                                   |
| --------------- | -------------------------------------------------------------------------------- |
| Compute         | 2–3 backend containers behind Nginx LB.                                          |
| Database        | Postgres with **PgBouncer** (transaction pooling) + 1 read replica.              |
| Redis           | Managed Redis with replica. Separate logical DBs for cache vs queue vs presence. |
| Object storage  | R2 + Cloudflare CDN caching.                                                     |
| Background jobs | Separate worker process (1–2 instances).                                         |
| Search          | Postgres FTS + materialized views. Re-evaluate Meilisearch.                      |
| Rate limit      | Redis (already in place) — tune limits.                                          |
| Realtime        | Not yet (or limited socket.io single-node).                                      |

**Capacity:** ~20–30k DAU.

## Tier 2 — 100K+ users

| Concern         | Recommendation                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| Compute         | 4–8 backend containers, autoscale.                                                                       |
| Database        | Postgres HA (primary + 2 replicas). PgBouncer. Partition `notifications`, `audit_logs`, `jobs` by month. |
| Redis           | Managed Redis cluster (3 nodes) with replica.                                                            |
| Object storage  | R2 + aggressive CDN caching.                                                                             |
| Background jobs | Multiple specialized worker pools (mail, notifications, media, analytics).                               |
| Search          | **Migrate to Meilisearch**.                                                                              |
| Realtime        | Socket.io with **Redis adapter**; sticky sessions.                                                       |
| Observability   | Full Prometheus + Grafana + Sentry + OpenTelemetry.                                                      |

**Capacity:** ~80–120k DAU.

## Tier 3 — 1M+ users

| Concern         | Recommendation                                                            |
| --------------- | ------------------------------------------------------------------------- |
| Compute         | Multi-region, autoscaling 10+ nodes per service.                          |
| Database        | Postgres + Citus / sharded by tenant (city). PITR, cross-region replicas. |
| Redis           | Redis cluster, multi-AZ.                                                  |
| Object storage  | Multi-region R2 + CDN.                                                    |
| Background jobs | Region-aware queues; per-region BullMQ.                                   |
| Search          | OpenSearch cluster (multi-language, analytics).                           |
| Realtime        | Dedicated realtime cluster (Socket.io) + dedicated presence service.      |
| Caching         | Per-route response caching; CDN for HTML where safe.                      |
| Microservices   | Consider extracting notifications, search, media into separate services.  |
| Observability   | Distributed tracing essential; APM tool (Datadog/New Relic).              |

## Tech Tag Recap by Tier

| Technology         | Tier                                        |
| ------------------ | ------------------------------------------- |
| Postgres + Prisma  | All tiers                                   |
| Redis              | All tiers                                   |
| BullMQ             | Tier 0+                                     |
| Socket.io          | Tier 1+ (if realtime enabled)               |
| Redis Pub/Sub      | Tier 1+                                     |
| Prometheus/Grafana | Tier 1+ (Required Before Production Launch) |
| Sentry             | Tier 0+                                     |
| OpenTelemetry      | Tier 1+                                     |
| PgBouncer          | Tier 1+                                     |
| Read replicas      | Tier 1+                                     |
| Meilisearch        | Tier 2                                      |
| OpenSearch         | Tier 3                                      |
| Kubernetes (k8s)   | Tier 3 (optional earlier)                   |
| Multi-region       | Tier 3                                      |

## Anti-Patterns to Avoid

- Premature microservices (start modular monolith).
- Sharding before vertical scaling is exhausted.
- Caching everything (cache invalidation is hard).
- Heavy ORMs in hot loops (use raw SQL only where measured).

## Decision Triggers (When to Move Up)

- CPU > 60% sustained → scale out.
- p95 latency > SLO → optimize or scale.
- DB connections near limit → PgBouncer.
- DB write IOPS near limit → replica offload reads.
- Queue backlog growing → more workers.
- Search latency > SLO → Meilisearch.
