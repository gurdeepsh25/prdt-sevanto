# Phase 14 — Reports & Analytics

## Objective

Provide analytics dashboards for admins covering growth, engagement, jobs, and trust metrics.

## Business Purpose

- Inform decisions.
- Identify problem areas.
- Track KPIs over time.

## Database Changes

- None new. May add materialized views in follow-up migration.

## Prisma Changes

- None.

## Backend Tasks

- [ ] `analytics.service.ts` with time-series queries.
- [ ] Endpoints:
  - `GET /admin/analytics/overview` (snapshot).
  - `GET /admin/analytics/signups?from=&to=&granularity=`.
  - `GET /admin/analytics/jobs?from=&to=&granularity=&status=`.
  - `GET /admin/analytics/revenue?from=&to=` (post-payments).
  - `GET /admin/analytics/categories/top?limit=`.
- [ ] Caching (Redis) for expensive queries.

## Admin App Tasks

- [ ] Charts (line, bar, pie) using Recharts.
- [ ] Date range picker + granularity selector.
- [ ] Drill-down on category / city.

## Customer / Worker App Tasks

- [ ] None directly. (Worker-side earnings analytics in future phase.)

## API Endpoints

See Backend Tasks above.

## Validation Rules

- `from`, `to`: ISO dates; `from ≤ to`.
- `granularity`: `day | week | month`.

## Security Requirements

- ADMIN-only.
- Cache keys per admin to avoid leak; consider per-role in future.

## Acceptance Criteria

- [ ] Admin can view signup trend over a date range.
- [ ] Admin can view jobs created/completed trend.
- [ ] Admin can view top categories by job count.
- [ ] Charts load in < 1s on staging data.

## Testing Checklist

- [ ] Unit: date bucket math.
- [ ] Integration: query correctness across small dataset.
- [ ] Performance: cached response < 200ms.

## Deployment Notes

- Optional Redis required.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
