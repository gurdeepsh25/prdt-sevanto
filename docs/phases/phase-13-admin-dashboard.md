# Phase 13 — Admin Dashboard

## Objective

Provide admins with the screens and APIs to manage users, workers, jobs, categories, and reports.

## Business Purpose

- Operational control.
- Trust & safety.
- Day-to-day platform health.

## Database Changes

- **New tables**:
  - `reports`
  - `audit_logs`
- **Indexes**: `reports(status)`, `audit_logs(actor_id, created_at desc)`.

## Prisma Changes

- Add `Report`, `AuditLog` models + enums (`ReportStatus`, `ReportTarget`).
- Migration: `013_admin`.

## Backend Tasks

- [ ] Prisma migration.
- [ ] `admin.service.ts` modules: users, workers, jobs, reports, categories.
- [ ] Endpoints under `/api/v1/admin/*`.
- [ ] Role guard: ADMIN-only.
- [ ] Audit log writes on every mutation.
- [ ] Report intake endpoint also callable from other apps (`POST /reports`).

## Customer App Tasks

- [ ] "Report" button on jobs, worker profiles, reviews.

## Worker App Tasks

- [ ] Same "Report" button.

## Admin App Tasks

- [ ] `/` overview with KPI cards.
- [ ] `/users` list + detail.
- [ ] `/workers` list + verify actions.
- [ ] `/jobs` list.
- [ ] `/reports` queue + detail.
- [ ] `/categories` management.

## API Endpoints

| Method | Path                               | Auth  | Description        |
| ------ | ---------------------------------- | ----- | ------------------ |
| GET    | `/api/v1/admin/overview`           | ADMIN | KPIs               |
| GET    | `/api/v1/admin/users`              | ADMIN | List               |
| GET    | `/api/v1/admin/users/:id`          | ADMIN | Detail             |
| PATCH  | `/api/v1/admin/users/:id`          | ADMIN | Suspend/reactivate |
| POST   | `/api/v1/admin/workers/:id/verify` | ADMIN | Verify             |
| GET    | `/api/v1/admin/reports`            | ADMIN | List               |
| GET    | `/api/v1/admin/reports/:id`        | ADMIN | Detail             |
| PATCH  | `/api/v1/admin/reports/:id`        | ADMIN | Update status      |
| POST   | `/api/v1/reports`                  | Any   | Submit report      |
| GET    | `/api/v1/admin/audit-logs`         | ADMIN | List (read-only)   |

## Validation Rules

- Report `reason`: enum (SPAM, ABUSE, FRAUD, OTHER).
- Admin actions require reason in some cases (suspension).

## Security Requirements

- All admin routes gated by `requireRole('ADMIN')`.
- Every admin write audited.
- Reports can be filed by any authenticated user.

## Acceptance Criteria

- [ ] Admin can list and filter users.
- [ ] Admin can suspend/reactivate users.
- [ ] Admin can verify a worker.
- [ ] Customer can file a report on a worker.
- [ ] Admin can resolve a report with status update.
- [ ] All admin actions visible in audit log.

## Testing Checklist

- [ ] Unit: role guard.
- [ ] Integration: each admin action.
- [ ] E2E: report flow → admin resolves.

## Deployment Notes

- Ensure at least one admin exists (seeded).

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
