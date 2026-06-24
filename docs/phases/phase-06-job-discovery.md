# Phase 06 — Job Discovery

## Objective

Enable workers to discover open jobs and customers to discover verified workers, with filtering, sorting, and pagination.

## Business Purpose

- Match supply (workers) with demand (jobs).
- Reduce time-to-first-application.
- Foundation for future smart matching.

## Database Changes

- None new. Uses existing `jobs`, `worker_profiles`, `worker_skills`, `categories`.

## Prisma Changes

- None.

## Backend Tasks

- [ ] Public jobs feed endpoint: `GET /jobs` (filterable).
- [ ] Public workers endpoint: `GET /workers` (filterable).
- [ ] Add query filters: `categoryId`, `subcategoryId`, `city`, `minBudget`, `maxBudget`, `minRating`, `urgency`.
- [ ] Sorting: `createdAt:desc`, `budget:desc`, `rating:desc`.
- [ ] Pagination.
- [ ] Cache category list in Redis (post-MVP).

## Customer App Tasks

- [ ] `/jobs` public browse page (optional, but useful for SEO).
- [ ] `/workers` list page (with filter sidebar, sort, pagination).
- [ ] `/workers/:id` public detail.

## Worker App Tasks

- [ ] `/jobs` browse page (filters, sort, pagination).
- [ ] `/jobs/:id` public detail (read-only; apply CTA later).

## Admin App Tasks

- [ ] `/jobs` list (all jobs, status filter).
- [ ] `/workers` list (all workers, verified filter).

## API Endpoints

| Method | Path                  | Auth                                        | Description    |
| ------ | --------------------- | ------------------------------------------- | -------------- |
| GET    | `/api/v1/jobs`        | Public                                      | List open jobs |
| GET    | `/api/v1/jobs/:id`    | Public (if OPEN) / Owner / Assigned / ADMIN | Detail         |
| GET    | `/api/v1/workers`     | Public                                      | List workers   |
| GET    | `/api/v1/workers/:id` | Public                                      | Detail         |

## Validation Rules

- `page ≥ 1`, `pageSize 1–100`.
- `minBudget ≤ maxBudget`.
- `urgency` must be valid enum.

## Security Requirements

- Public endpoints exclude soft-deleted records.
- Worker public profile excludes contact info.

## Acceptance Criteria

- [ ] Worker can browse open jobs with filters and pagination.
- [ ] Customer can browse workers with filters and pagination.
- [ ] Public worker profile excludes email/phone.
- [ ] Admin can see all jobs regardless of status.

## Testing Checklist

- [ ] Unit: query builders, pagination math.
- [ ] Integration: filter combinations, sort behavior.
- [ ] E2E: filter, paginate, open detail.

## Deployment Notes

- None.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
