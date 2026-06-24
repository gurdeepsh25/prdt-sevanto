# Phase 15 — Chat System

## Objective

Realtime chat between customer and assigned worker for a job, using Socket.io, with message persistence and notifications.

## Business Purpose

- Speed up coordination.
- Reduce phone-number sharing.
- Foundation for richer communication features.

## Database Changes

- **New tables**:
  - `chats` (one per job)
  - `messages`
- **Indexes**: `messages(chat_id, created_at desc)`, `chats(job_id)` unique.

## Prisma Changes

- Add `Chat`, `Message` models.
- Migration: `015_chat`.

## Backend Tasks

- [ ] Prisma migration.
- [ ] Create chat when job is assigned.
- [ ] `messages.service.ts` (send, list, mark read).
- [ ] Socket.io gateway (auth via JWT in handshake).
- [ ] Message events: `message:new`, `message:read`, `typing`.
- [ ] Notification (in-app + email) for new message if recipient offline.
- [ ] Rate limit on send.

## Customer App Tasks

- [ ] Chat panel on `/my-jobs/:id`.
- [ ] Unread indicator.

## Worker App Tasks

- [ ] Chat panel on `/assigned-jobs/:id`.

## Admin App Tasks

- [ ] (Optional) Read-only chat viewer for dispute cases.

## API Endpoints

| Method | Path                             | Auth         | Description              |
| ------ | -------------------------------- | ------------ | ------------------------ |
| GET    | `/api/v1/jobs/:id/chat`          | Participants | Get messages (paginated) |
| POST   | `/api/v1/jobs/:id/chat/messages` | Participants | Send (REST fallback)     |
| WS     | `/socket.io`                     | Participants | Realtime                 |

## Validation Rules

- Message text ≤ 4000 chars; sanitized on render.
- Only job participants can read/write chat.

## Security Requirements

- JWT auth on socket connection.
- Authorization at message layer too.
- Persisted messages retained for X months; archival policy TBD.

## Acceptance Criteria

- [ ] Customer and worker can exchange messages in realtime.
- [ ] Refreshing page loads history.
- [ ] Offline recipient gets in-app + email notification.
- [ ] Non-participants cannot access chat.

## Testing Checklist

- [ ] Unit: socket auth, permission check.
- [ ] Integration: REST + WS flows.
- [ ] E2E: two browsers exchange messages.

## Deployment Notes

- Socket.io requires sticky sessions or Redis adapter.
- Plan for scale: Redis pub/sub adapter.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
