# Phase 18 — Production Launch

## Objective

Harden the platform for public launch: observability, performance, security, compliance, and operational readiness.

## Business Purpose

- Reduce risk of public launch.
- Ensure platform can handle real traffic.
- Establish support / on-call processes.

## Database Changes

- None new. May add indexes based on production query patterns.

## Prisma Changes

- None (or follow-up index migration).

## Backend Tasks

- [ ] Add structured logging everywhere (Pino).
- [ ] Add OpenTelemetry tracing.
- [ ] Configure Sentry for server + frontends.
- [ ] Add health checks + readiness probes.
- [ ] Rate limiting tuned per route.
- [ ] Add DB connection pooling (PgBouncer).
- [ ] Add Redis for caching hot endpoints.
- [ ] Background jobs via BullMQ.
- [ ] Backup + restore drill.
- [ ] Pen test remediation.
- [ ] Finalize legal docs (ToS, Privacy, Cookies).

## Frontend Tasks

- [ ] Lighthouse pass for all 3 apps (≥ 90 perf, ≥ 95 a11y).
- [ ] SEO meta tags + sitemap.
- [ ] Error boundaries.
- [ ] PWA manifest for worker app (optional).
- [ ] Analytics SDK integration (privacy-respecting).

## Operational Tasks

- [ ] Runbooks per major incident type.
- [ ] On-call rotation.
- [ ] Status page.
- [ ] Support email + escalation.
- [ ] Launch comms plan.

## Monitoring & Alerts

- [ ] Latency, error rate, saturation dashboards.
- [ ] Alerts on: 5xx > 1%, p95 > 1s, DB CPU > 80%, queue backlog growing.

## Load Testing

- [ ] k6 scripts for top 10 endpoints.
- [ ] Sustained 2x peak for 30 min.

## Compliance

- [ ] GDPR data export + delete.
- [ ] Cookie consent banner.
- [ ] Data processing agreements with vendors.

## Acceptance Criteria

- [ ] All MVP acceptance criteria (Phases 1–14) met.
- [ ] No P0/P1 bugs open.
- [ ] Pen test report clean.
- [ ] Load test passed.
- [ ] Monitoring live with alert thresholds tuned.
- [ ] Backup + restore verified.

## Testing Checklist

- [ ] Disaster recovery drill.
- [ ] Chaos test: kill one region, verify failover.

## Deployment Notes

- Final DNS cutover planned.
- Rollback plan documented and rehearsed.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
- [ ] **Production Launched 🚀**
