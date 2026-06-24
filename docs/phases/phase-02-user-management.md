# Phase 02 — User Management

## Objective

Allow authenticated users (Customer & Worker) to view and edit their profile, manage addresses, change password, and delete their account.

## Business Purpose

- Provide personal account management.
- Lay groundwork for job posting (needs addresses).
- Improve trust via profile completeness.

## Database Changes

- **New tables**:
  - `user_addresses`
- **Changes to `users`**:
  - Add: `phone?`, `avatarUrl?`, `deletedAt?`.

## Prisma Changes

- Add `UserAddress` model.
- Add fields to `User` model.
- Migration: `002_user_management`.

## Backend Tasks

- [ ] Prisma migration for new fields + table.
- [ ] `users.service.ts` (getMe, updateMe, changePassword, softDelete).
- [ ] `addresses.service.ts` (CRUD).
- [ ] Validators (Zod).
- [ ] Controllers + routes.
- [ ] Avatar upload: pre-signed URL flow (S3-compatible).
- [ ] Soft-delete: anonymize PII, revoke tokens.

## Customer App Tasks

- [ ] `/profile` page (name, phone, avatar, addresses list).
- [ ] Address CRUD UI (modal-based).
- [ ] Change password form.
- [ ] Delete account confirmation.

## Worker App Tasks

- [ ] Same as customer; reused components.

## Admin App Tasks

- [ ] `/users` list (read-only).
- [ ] `/users/:id` detail.
- [ ] Suspend / reactivate actions.

## API Endpoints

| Method | Path                             | Auth  | Description           |
| ------ | -------------------------------- | ----- | --------------------- |
| GET    | `/api/v1/users/me`               | Any   | Current user          |
| PATCH  | `/api/v1/users/me`               | Any   | Update profile        |
| POST   | `/api/v1/users/me/avatar`        | Any   | Get avatar upload URL |
| POST   | `/api/v1/users/me/password`      | Any   | Change password       |
| POST   | `/api/v1/users/me/delete`        | Any   | Soft-delete           |
| GET    | `/api/v1/users/me/addresses`     | Any   | List                  |
| POST   | `/api/v1/users/me/addresses`     | Any   | Create                |
| PATCH  | `/api/v1/users/me/addresses/:id` | Any   | Update                |
| DELETE | `/api/v1/users/me/addresses/:id` | Any   | Delete                |
| GET    | `/api/v1/admin/users`            | ADMIN | List users            |
| GET    | `/api/v1/admin/users/:id`        | ADMIN | Detail                |
| PATCH  | `/api/v1/admin/users/:id`        | ADMIN | Suspend/Reactivate    |

## Validation Rules

- `phone`: E.164 format if provided.
- `avatarUrl`: valid S3 key.
- `line1`, `city`, `state`, `postalCode`, `country`: required for address.
- `lat`/`lng`: optional but validated if present.
- Password change requires current password.

## Security Requirements

- Ownership enforced on all `me` endpoints.
- Soft-delete cascades: anonymize email, revoke tokens, mask PII in logs.
- Admin suspend sets `isActive=false` → auth blocked.
- File upload uses pre-signed URLs (server never proxies binary).

## Acceptance Criteria

- [ ] Customer can edit name, phone, avatar.
- [ ] Customer can add/edit/delete addresses; default flag works.
- [ ] Customer can change password with correct current password.
- [ ] Soft-deleted user cannot log in and is removed from public lists.
- [ ] Admin can suspend and reactivate users.

## Testing Checklist

- [ ] Unit: validators, address ownership.
- [ ] Integration: full CRUD flows.
- [ ] E2E: edit profile + add address + change password.

## Deployment Notes

- Storage credentials required for avatar upload.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] All tests pass.
- [ ] Progress tracker updated.
