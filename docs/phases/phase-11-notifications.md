# Phase 11 — Notifications

## Objective

Deliver in-app and email notifications for key events (new application, assignment, status changes, reviews).

## Business Purpose

- Reduce latency in user reactions.
- Increase engagement.
- Foundation for future push + realtime.

## Database Changes

- **New tables**:
  - `notifications`

## Prisma Changes

- Add `Notification` model + `NotificationType` enum.
- Migration: `011_notifications`.

## Notification Types (MVP)

- `APPLICATION_RECEIVED` → customer.
- `APPLICATION_ACCEPTED` → worker.
- `APPLICATION_REJECTED` → worker.
- `JOB_ASSIGNED` → worker (alias of accepted).
- `JOB_STARTED` → customer.
- `JOB_COMPLETED` → customer.
- `JOB_CONFIRMED` → worker.
- `JOB_CANCELLED` → other party.
- `REVIEW_RECEIVED` → reviewee.
- `WORKER_VERIFIED` → worker.

## Backend Tasks

- [ ] Prisma migration.
- [ ] `notifications.service.ts` (create, listMine, markRead, markAllRead).
- [ ] Centralized `notify(type, recipientId, data)` helper used by other services.
- [ ] Email templates (HTML + plain).
- [ ] BullMQ queue for emails (post-MVP acceptable to send inline).
- [ ] Throttling (max N emails/user/hour).
- [ ] API endpoints.

## Customer App Tasks

- [ ] Notifications bell with unread count.
- [ ] `/notifications` list.
- [ ] Mark read.

## Worker App Tasks

- [ ] Same as customer.

## Admin App Tasks

- [ ] (Future) Broadcast notification.

## API Endpoints

| Method | Path                                 | Auth | Description |
| ------ | ------------------------------------ | ---- | ----------- |
| GET    | `/api/v1/notifications`              | Any  | List        |
| PATCH  | `/api/v1/notifications/:id/read`     | Any  | Mark one    |
| POST   | `/api/v1/notifications/read-all`     | Any  | Mark all    |
| GET    | `/api/v1/notifications/unread-count` | Any  | Count       |

## Validation Rules

- `type`: enum.
- `data`: arbitrary JSON (sanitized for email).

## Security Requirements

- Users can only see their own notifications.
- Email body rendered through safe template engine (no raw HTML).

## Acceptance Criteria

- [ ] Customer sees in-app + email notification when worker applies.
- [ ] Worker sees in-app + email when accepted/rejected.
- [ ] Notification bell shows unread count.
- [ ] Marking read updates state without page reload.

## Testing Checklist

- [ ] Unit: notify helper, throttling.
- [ ] Integration: each trigger produces a notification.
- [ ] E2E: trigger → see notification.

## Deployment Notes

- Email provider configured; DNS records (SPF/DKIM/DMARC) recommended.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
