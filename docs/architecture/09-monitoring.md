# 09 — Monitoring

## Three Layers

1. **Metrics** (numerical time series) → **Prometheus** + **Grafana**.
2. **Traces** (request flows) → **OpenTelemetry** + vendor (e.g., Tempo/Jaeger).
3. **Errors** (exceptions) → **Sentry**.

**Tags:**

- Prometheus + Grafana — **Required Before Production Launch**.
- OpenTelemetry — **Required Before Production Launch**.
- Sentry — **Required Before Production Launch**.

## Metrics (Prometheus)

Custom + standard:

### Application

- `http_requests_total{method,route,status}` — counter.
- `http_request_duration_seconds{method,route}` — histogram.
- `http_requests_in_flight` — gauge.
- `db_query_duration_seconds{op,model}` — histogram (from Prisma middleware).
- `jobs_queue_depth{queue,state}` — gauge (BullMQ).
- `jobs_processed_total{queue,outcome}` — counter.

### Business

- `signups_total{role}` — counter.
- `jobs_posted_total{category}` — counter.
- `jobs_completed_total{category}` — counter.
- `applications_created_total` — counter.
- `reviews_created_total` — counter.
- `active_users_24h` — gauge (computed from Redis presence).
- `notification_send_total{type,channel}` — counter.

### Infra

- `nodejs_eventloop_lag_seconds`.
- `nodejs_heap_size_used_bytes`.
- `nodejs_active_handles`.
- `redis_connected` — gauge.
- `postgres_connections_active` — gauge.

### Endpoint

- `GET /metrics` on backend (admin-internal auth or network ACL).

## SLOs (Initial Targets)

| Indicator                        | Target                            |
| -------------------------------- | --------------------------------- |
| Availability                     | 99.5% (MVP) → 99.9% (post-launch) |
| p95 API latency (list endpoints) | < 300 ms                          |
| p95 API latency (writes)         | < 500 ms                          |
| Error rate (5xx)                 | < 1%                              |

## Tracing (OpenTelemetry)

- SDK on backend; auto-instrumentation for Express, Prisma, Redis, BullMQ.
- Trace context propagated to downstream services (storage SDK, email).
- Sampled at 10% in production (100% for errors).

## Error Tracking (Sentry)

- `Sentry.init({ dsn, environment, release })`.
- Capture: uncaught, manual `captureException`, integration with central error middleware.
- PII scrubbing enabled; never send tokens / passwords.
- Source maps uploaded on deploy.
- Frontends: 3 Sentry projects (customer, worker, admin).

## Alerting

### Severity Levels

- **P0** — page on-call. Production down or data loss.
- **P1** — page within 30 min. Error rate > 5%, latency > 2× SLO.
- **P2** — Slack within business hours. Single-queue DLQ growing.
- **P3** — backlog, weekly review.

### Initial Alert Rules

| Alert           | Condition                                | Severity |
| --------------- | ---------------------------------------- | -------- |
| API 5xx rate    | > 5% over 5 min                          | P1       |
| API p95 latency | > 1s over 10 min                         | P2       |
| Queue backlog   | depth > 1000 for 10 min                  | P2       |
| DLQ growth      | failed jobs > 10 in 5 min                | P1       |
| DB CPU          | > 80% for 15 min                         | P2       |
| Redis CPU       | > 80% for 15 min                         | P2       |
| Disk space      | > 85%                                    | P1       |
| Auth anomaly    | failed logins > 200 in 5 min from one IP | P1       |

## Dashboards (Grafana)

- **API Overview**: RPS, p50/p95/p99, error rate.
- **DB**: connections, slow queries, locks.
- **Redis**: hit rate, memory, connections.
- **Queues**: depth, processed, failed.
- **Business KPIs**: signups, jobs, applications, completions.

## Uptime Monitoring

- External checker (e.g., BetterStack, UptimeRobot) hits `/healthz` from multiple regions.
- Public status page.

## Tagging Summary

| Tech                       | Tag                               |
| -------------------------- | --------------------------------- |
| Prometheus client + scrape | Required Before Production Launch |
| Grafana                    | Required Before Production Launch |
| Sentry                     | Required Before Production Launch |
| OpenTelemetry              | Required Before Production Launch |
| External uptime checker    | Required Before Production Launch |
