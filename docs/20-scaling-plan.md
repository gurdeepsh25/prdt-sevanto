# 20 — Scaling Plan

## Phase Gates (Indicative)

| Scale Trigger | Action                                                  |
| ------------- | ------------------------------------------------------- |
| 1k DAU        | Single backend instance, single DB                      |
| 10k DAU       | Add connection pooler (PgBouncer), enable read replicas |
| 50k DAU       | Add Redis cache + queue, split workers                  |
| 100k DAU      | Multi-region, CDN, dedicated image service              |
| 500k DAU      | Microservice split candidate                            |

## Backend Scaling

- Stateless API → horizontal scaling behind load balancer.
- Long-running tasks (emails, image processing) → background workers.
- DB: connection pooling (PgBouncer), read replicas, partitioning by `created_at` for hot tables (`jobs`, `notifications`).
- Caching: Redis for category list, worker summary cards.

## Frontend Scaling

- ISR/SSG for public pages (worker profiles, categories).
- CDN edge for static assets.
- Image optimization via Next/Image + CDN.
- Code-splitting per route.

## Data Scaling

- Archival strategy: jobs older than 1y archived to cold storage.
- Soft-deletes purged after 90 days.
- Index maintenance quarterly (REINDEX, ANALYZE).

## Observability

- **Metrics**: Prometheus + Grafana.
- **Logs**: Loki / cloud-native log sink.
- **Tracing**: OpenTelemetry → Jaeger/Tempo.
- **Errors**: Sentry.

## Cost Watch

- Daily cost dashboards.
- Auto-scaling with min instances to control cold start cost.

## Team Scaling

- Backend platform team: shared libraries across modules.
- Frontend platform team: shared component library.
- Data team (when introduced): owns analytics schema.

## Single Points of Failure

- Eliminate by redundancy at each layer.
- DB failover via managed Postgres HA.
- Email provider: secondary provider with failover (future).
