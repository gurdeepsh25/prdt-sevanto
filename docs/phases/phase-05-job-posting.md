# Phase 05 — Job Posting

## Objective

Allow customers to post jobs with category, description, budget range, schedule, urgency, address, and optional attachments.

## Business Purpose

- Core demand-side action.
- Creates inventory for workers.
- Sets up the entire job lifecycle.

## Database Changes

- **New tables**:
  - `jobs`
  - `job_attachments`
- **Indexes**: `jobs(status)`, `jobs(customer_id)`, `jobs(category_id)`, `jobs(city)`, `jobs(created_at desc)`.

## Prisma Changes

- Add `Job`, `JobAttachment` models.
- Add enums: `JobStatus`, `Urgency`.
- Migration: `005_jobs`.

## Backend Tasks

- [ ] Prisma migration.
- [ ] `jobs.service.ts` (create, get, listMine, update, cancel).
- [ ] Validators (Zod).
- [ ] Job state machine enforcement at service layer.
- [ ] Authorization: only customer can edit/cancel own jobs.
- [ ] Attachments via pre-signed URLs.

## Customer App Tasks

- [ ] `/my-jobs` list (filter by status).
- [ ] `/my-jobs/new` multi-step wizard (Category → Details → Budget/Schedule → Address → Review).
- [ ] `/my-jobs/:id` detail (overview + status timeline).
- [ ] Cancel job CTA.

## Worker App Tasks

- [ ] (Later) Job detail page will use this data; in this phase, no worker-side UI required beyond data exposure.

## Admin App Tasks

- [ ] `/jobs` list (read-only in this phase; full moderation later).

## API Endpoints

| Method | Path                           | Auth                 | Description    |
| ------ | ------------------------------ | -------------------- | -------------- |
| POST   | `/api/v1/jobs`                 | CUSTOMER             | Create job     |
| GET    | `/api/v1/jobs`                 | CUSTOMER             | List my jobs   |
| GET    | `/api/v1/jobs/:id`             | Owner/Assigned/ADMIN | Get            |
| PATCH  | `/api/v1/jobs/:id`             | Owner (DRAFT/OPEN)   | Update         |
| DELETE | `/api/v1/jobs/:id`             | Owner (DRAFT/OPEN)   | Soft delete    |
| POST   | `/api/v1/jobs/:id/cancel`      | Owner/Assigned       | Cancel         |
| POST   | `/api/v1/jobs/:id/attachments` | Owner                | Add attachment |

## Validation Rules

- `title`: 5–120 chars.
- `description`: 20–4000 chars.
- `budgetMin`, `budgetMax`: non-negative ints (minor units); min ≤ max.
- `categoryId`: required and must exist + active.
- `subcategoryId`: optional; must belong to category if provided.
- `addressId`: required; must belong to caller.
- `urgency`: enum.
- `scheduledFor`: optional ISO datetime; if set, must be future.

## Security Requirements

- Only authenticated customers may post.
- Ownership enforced on update/delete/cancel.
- Status transitions validated server-side.

## Acceptance Criteria

- [ ] Customer can post a job via wizard and see it in `/my-jobs`.
- [ ] Customer can edit the job while in `DRAFT` or `OPEN`.
- [ ] Customer can cancel; status changes to `CANCELLED`.
- [ ] Soft-deleted job disappears from `GET /jobs`.

## Testing Checklist

- [ ] Unit: state machine, validators.
- [ ] Integration: CRUD + ownership.
- [ ] E2E: post → list → cancel.

## Deployment Notes

- No external service changes.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
