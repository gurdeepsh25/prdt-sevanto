# Phase 07 — Job Applications

## Objective

Allow workers to apply to open jobs with a cover note and optional proposed price; allow customers to view applicants.

## Business Purpose

- Convert open jobs into worker commitments.
- Give customers choice among applicants.
- Initiate notification flows.

## Database Changes

- **New tables**:
  - `job_applications`
- **Indexes**: `job_applications(job_id)`, `job_applications(worker_id)`, `job_applications(status)`.

## Prisma Changes

- Add `JobApplication` model + `ApplicationStatus` enum.
- Migration: `006_applications`.

## Backend Tasks

- [ ] Prisma migration.
- [ ] `applications.service.ts` (apply, withdraw, listForJob, listMine).
- [ ] Validators.
- [ ] Authorization: only workers may apply; only job owner sees applicants.
- [ ] Prevent duplicate applications (unique constraint).
- [ ] Prevent applying to non-OPEN jobs.
- [ ] Trigger notification to job owner on new application.

## Customer App Tasks

- [ ] On `/my-jobs/:id`: "Applicants" tab listing all applications with worker mini-profiles.
- [ ] Accept/Reject buttons (functionality in next phase).

## Worker App Tasks

- [ ] Apply button on `/jobs/:id` (cover note + proposed price modal).
- [ ] `/applications` list with status filter.
- [ ] Withdraw button on PENDING applications.

## Admin App Tasks

- [ ] `/jobs/:id` shows applications (read-only).

## API Endpoints

| Method | Path                                          | Auth                     | Description                |
| ------ | --------------------------------------------- | ------------------------ | -------------------------- |
| POST   | `/api/v1/jobs/:jobId/applications`            | WORKER                   | Apply                      |
| GET    | `/api/v1/jobs/:jobId/applications`            | Customer (owner) / ADMIN | List applicants            |
| POST   | `/api/v1/jobs/:jobId/applications/:id/accept` | Customer (owner)         | Accept (effect in Phase 8) |
| POST   | `/api/v1/jobs/:jobId/applications/:id/reject` | Customer (owner)         | Reject                     |
| POST   | `/api/v1/applications/:id/withdraw`           | Worker (owner)           | Withdraw                   |
| GET    | `/api/v1/applications/me`                     | WORKER                   | My applications            |

## Validation Rules

- `coverNote`: ≤ 1000 chars.
- `proposedPrice`: optional; non-negative int if provided.
- Worker cannot apply to own job.
- Worker cannot apply twice to same job.

## Security Requirements

- Customer must own job to view/manage applicants.
- Worker can only withdraw own applications.
- Public job detail must NOT expose applicant list.

## Acceptance Criteria

- [ ] Worker can apply to an OPEN job.
- [ ] Duplicate application is rejected with 409.
- [ ] Applying to non-OPEN job is rejected with 422.
- [ ] Customer sees applicant list on job detail.
- [ ] Worker can withdraw PENDING application.
- [ ] Job owner receives a notification on new application.

## Testing Checklist

- [ ] Unit: validators, duplicate detection.
- [ ] Integration: apply, list, withdraw.
- [ ] E2E: worker applies → customer sees applicant → worker withdraws.

## Deployment Notes

- Notification worker (Phase 11) needed for the customer-side notification.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
