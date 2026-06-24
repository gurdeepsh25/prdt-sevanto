# Phase 09 — Job Lifecycle

## Objective

Complete the end-to-end job state machine: `ASSIGNED → IN_PROGRESS → COMPLETED → REVIEWED`, with cancellation support throughout.

## Business Purpose

- Track work progress accurately.
- Provide trustworthy completion signals for reviews and analytics.
- Enable cancellation rules.

## Database Changes

- None new (uses existing models + history table from Phase 8).

## Prisma Changes

- None.

## State Machine

```
DRAFT ──▶ OPEN ──▶ ASSIGNED ──▶ IN_PROGRESS ──▶ COMPLETED ──▶ (REVIEWED in Phase 10)
            │           │              │
            └───── CANCELLED ──────────┘   (until IN_PROGRESS; COMPLETED cannot be cancelled)
```

## Backend Tasks

- [ ] `jobs.service.ts` lifecycle actions: `start`, `markComplete`, `confirmCompletion`, `cancel`.
- [ ] Authorization:
  - Start: assigned worker only.
  - Mark complete: assigned worker only.
  - Confirm completion: customer only (this step is part of marking fully reviewed/closed — Phase 10 ties review to confirmation).
  - Cancel: customer (any state before COMPLETED) or assigned worker (only ASSIGNED state).
- [ ] Insert `JobStatusHistory` rows for every transition.
- [ ] Notification triggers.

## Customer App Tasks

- [ ] Status timeline component on `/my-jobs/:id`.
- [ ] Confirm-completion CTA when worker marks complete.

## Worker App Tasks

- [ ] Assigned job detail shows Start / Mark Complete buttons based on status.
- [ ] Cancel CTA on `ASSIGNED`.

## Admin App Tasks

- [ ] `/jobs/:id` shows full status history.

## API Endpoints

| Method | Path                                  | Auth              | Description                                |
| ------ | ------------------------------------- | ----------------- | ------------------------------------------ |
| POST   | `/api/v1/jobs/:id/start`              | Worker (assigned) | ASSIGNED → IN_PROGRESS                     |
| POST   | `/api/v1/jobs/:id/complete`           | Worker (assigned) | IN_PROGRESS → COMPLETED                    |
| POST   | `/api/v1/jobs/:id/confirm-completion` | Customer (owner)  | COMPLETED → REVIEWED (after review posted) |
| POST   | `/api/v1/jobs/:id/cancel`             | Owner or Assigned | → CANCELLED                                |

## Validation Rules

- Action only allowed from valid prior state.
- Customer cancel before COMPLETED.
- Worker cancel only from ASSIGNED.

## Security Requirements

- Authorization double-checked at service layer.
- All transitions write audit log + status history.

## Acceptance Criteria

- [ ] Worker can start an ASSIGNED job.
- [ ] Worker can mark IN_PROGRESS as COMPLETED.
- [ ] Customer can confirm completion.
- [ ] Either party can cancel before work begins; worker cancel only while ASSIGNED.
- [ ] Status history is visible to owner, assigned worker, and admin.
- [ ] Illegal transitions return 422 with clear error code.

## Testing Checklist

- [ ] Unit: state machine table.
- [ ] Integration: each transition + illegal transition.
- [ ] E2E: assigned → started → completed → confirmed.

## Deployment Notes

- None.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
