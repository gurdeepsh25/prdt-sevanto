# Phase 08 — Job Assignment

## Objective

Allow customer to accept one application, automatically rejecting others, transitioning the job to `ASSIGNED` and notifying the assigned worker.

## Business Purpose

- Convert application into commitment.
- Lock the job to a single worker.
- Trigger worker-side onboarding to the job.

## Database Changes

- **New tables**:
  - `job_status_history`
- **Changes to `jobs`**: existing `assignedWorkerId` field used.
- **Changes to `job_applications`**: status transitions.

## Prisma Changes

- Add `JobStatusHistory` model.
- Migration: `008_assignment`.

## Backend Tasks

- [ ] Prisma migration.
- [ ] `applications.service.ts` enhancements: accept (transactional).
- [ ] Transaction: mark chosen application `ACCEPTED`; mark others `REJECTED`; update job `assignedWorkerId` and status to `ASSIGNED`; insert status history.
- [ ] Notification to assigned worker + rejected workers.
- [ ] Prevent re-assignment (job not in OPEN).

## Customer App Tasks

- [ ] Accept/Reject buttons enabled on `/my-jobs/:id` Applicants tab.
- [ ] Confirmation dialog before accept.

## Worker App Tasks

- [ ] `/applications` shows `ACCEPTED`/`REJECTED` statuses.
- [ ] Assigned worker sees job in `/assigned-jobs`.

## Admin App Tasks

- [ ] Audit log entries for assignments.

## API Endpoints

| Method | Path                                          | Auth             | Description                                            |
| ------ | --------------------------------------------- | ---------------- | ------------------------------------------------------ |
| POST   | `/api/v1/jobs/:jobId/applications/:id/accept` | Customer (owner) | Accept (effects in this phase)                         |
| POST   | `/api/v1/jobs/:jobId/applications/:id/reject` | Customer (owner) | Reject one (already existed in Phase 7; now persisted) |

## Validation Rules

- Job must be `OPEN`.
- Application must be `PENDING`.
- Customer must own job.

## Security Requirements

- All status changes wrapped in DB transaction.
- Authorization enforced at multiple layers.
- Notification side-effects wrapped in try/catch with audit log on failure.

## Acceptance Criteria

- [ ] Accepting an application sets job to `ASSIGNED`.
- [ ] All other applications are marked `REJECTED`.
- [ ] Assigned worker receives notification.
- [ ] Rejected workers receive notification.
- [ ] Job status history records the transition.
- [ ] Attempting to accept on a non-OPEN job returns 422.

## Testing Checklist

- [ ] Unit: state transitions.
- [ ] Integration: transactional accept + concurrent attempts.
- [ ] E2E: apply → accept → others see REJECTED.

## Deployment Notes

- None.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
