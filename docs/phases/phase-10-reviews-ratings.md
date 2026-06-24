# Phase 10 — Reviews & Ratings

## Objective

Allow customers and workers to review each other after job completion, and surface aggregated ratings on profiles.

## Business Purpose

- Drive trust across the platform.
- Inform discovery rankings.
- Recognize high-quality workers.

## Database Changes

- **New tables**:
  - `reviews`
- **Indexes**: `reviews(reviewee_id)`, `reviews(job_id)` unique.

## Prisma Changes

- Add `Review` model.
- Migration: `010_reviews`.

## Backend Tasks

- [ ] Prisma migration.
- [ ] `reviews.service.ts` (createReview, listForUser, getMyReviewableJobs).
- [ ] Recompute `WorkerProfile.avgRating` and `totalJobsCompleted` on review create.
- [ ] Prevent duplicate review per job per reviewer.
- [ ] Only allow review after job is COMPLETED and confirmed.
- [ ] Notification to reviewee.

## Customer App Tasks

- [ ] After confirm-completion, prompt to review the worker (rating + comment).
- [ ] Show reviews on `/workers/:id`.

## Worker App Tasks

- [ ] After customer confirms completion, prompt to review the customer.
- [ ] `/reviews` page lists reviews received.

## Admin App Tasks

- [ ] Moderation queue for reported reviews.
- [ ] Ability to hide a review with audit log.

## API Endpoints

| Method | Path                             | Auth                        | Description         |
| ------ | -------------------------------- | --------------------------- | ------------------- |
| POST   | `/api/v1/jobs/:jobId/review`     | Customer or Assigned Worker | Create              |
| GET    | `/api/v1/workers/:id/reviews`    | Public                      | List                |
| PATCH  | `/api/v1/admin/reviews/:id/hide` | ADMIN                       | Hide                |
| GET    | `/api/v1/reviews/me/received`    | Any                         | My received reviews |

## Validation Rules

- `rating`: integer 1–5.
- `comment`: ≤ 2000 chars; sanitized on render.
- One review per (job, reviewer).
- Job must be `COMPLETED`.

## Security Requirements

- Only participants in the job can review each other.
- Hidden reviews excluded from public lists and aggregate ratings.

## Acceptance Criteria

- [ ] Customer can leave a 1–5 rating + comment after confirmation.
- [ ] Worker can leave a 1–5 rating + comment after customer confirmation.
- [ ] Worker public profile shows avgRating and review count.
- [ ] Admin can hide inappropriate reviews.
- [ ] Aggregates update immediately on review post.

## Testing Checklist

- [ ] Unit: aggregate computation.
- [ ] Integration: review create, duplicate prevention.
- [ ] E2E: complete job → review → see rating on profile.

## Deployment Notes

- None.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
