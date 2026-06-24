# Phase 01 — Authentication

## Objective

Deliver secure, stateless email-based authentication for all three apps (Customer, Worker, Admin) using JWT access tokens + rotating refresh tokens, including signup, login, logout, email verification, forgot/reset password.

## Business Purpose

- Establish user identity on the platform.
- Enable trust features (verified email, secure sessions).
- Foundation for all subsequent phases.

## Database Changes

- **New tables**:
  - `users`
  - `refresh_tokens`
  - `password_resets`
  - `email_verifications`
- **Enums**: `Role`.
- **Indexes**: `users(email)` unique; `users(role)`; `refresh_tokens(token)` unique; `refresh_tokens(user_id)`.

## Prisma Changes

- Add models: `User`, `RefreshToken`, `PasswordReset`, `EmailVerification`.
- Migration name: `001_init_auth`.
- Seed: 1 admin user from `ADMIN_EMAIL` env.

## Backend Tasks

- [ ] Add Prisma models + run migration.
- [ ] Implement `auth.service.ts` (signup, login, refresh, logout, forgot/reset, verify).
- [ ] Implement `auth.controller.ts` + routes.
- [ ] Add `auth.validators.ts` (Zod schemas).
- [ ] Add `requireAuth`, `requireRole` middlewares.
- [ ] Implement argon2id password hashing utility.
- [ ] Implement JWT signing utility (access + refresh).
- [ ] Implement email service (Nodemailer) + templates (verify, reset).
- [ ] Add rate limiting on `/auth/*`.
- [ ] Add login throttling + lockout.
- [ ] Add refresh-token reuse detection.
- [ ] Add audit log entries for signups/logins (optional MVP).

## Customer App Tasks

- [ ] `/signup` form (email, password, full name).
- [ ] `/login` form.
- [ ] `/forgot-password` form.
- [ ] `/reset-password?token=` form.
- [ ] `/verify-email?token=` landing + auto-login.
- [ ] Auth store (Zustand) + API client integration.
- [ ] Route guards for authenticated pages.

## Worker App Tasks

- [ ] Same auth pages, role pre-selected as `WORKER` in signup.

## Admin App Tasks

- [ ] `/login` only (admin accounts provisioned out-of-band in MVP).

## API Endpoints

| Method | Path                               | Auth   | Description                             |
| ------ | ---------------------------------- | ------ | --------------------------------------- |
| POST   | `/api/v1/auth/signup`              | Public | Create account, send verification email |
| POST   | `/api/v1/auth/login`               | Public | Issue access + refresh                  |
| POST   | `/api/v1/auth/refresh`             | Cookie | Rotate tokens                           |
| POST   | `/api/v1/auth/logout`              | Any    | Revoke refresh                          |
| POST   | `/api/v1/auth/forgot-password`     | Public | Email reset link                        |
| POST   | `/api/v1/auth/reset-password`      | Public | Set new password                        |
| GET    | `/api/v1/auth/verify-email`        | Public | Confirm verification                    |
| POST   | `/api/v1/auth/resend-verification` | Auth   | Resend link                             |

## Validation Rules

- **Email**: RFC-compliant; max 254 chars.
- **Password**: 8–128 chars; letters + numbers; not in common blocklist.
- **Role**: must be `CUSTOMER` or `WORKER` on signup.
- **Tokens**: opaque, ≥32 bytes; URL-safe.

## Security Requirements

- Argon2id hashing.
- Short JWT TTL (15 min).
- Refresh token hashed (SHA-256) at rest.
- HttpOnly, Secure, SameSite=Lax cookies.
- Rate limit: 5/min on `/auth/login`, `/auth/signup`, `/auth/forgot-password`.
- Account lockout: 5 failed logins → 15-min lock.
- Constant-time token comparison.
- Never log tokens or passwords.

## Acceptance Criteria

- [ ] A new customer can sign up and receive a verification email.
- [ ] Clicking the verification link marks email verified and can auto-login.
- [ ] A verified customer can log in and obtain access + refresh tokens.
- [ ] Refreshing tokens rotates the refresh token and revokes the old one.
- [ ] Reusing a revoked refresh token revokes the entire token family.
- [ ] Logout invalidates the refresh token.
- [ ] Forgot-password flow sends a 15-minute reset link.
- [ ] Reset-password sets new password and revokes all refresh tokens.
- [ ] Unverified users cannot access protected resources.
- [ ] Worker signup creates user with `role=WORKER` and unverified worker flag.

## Testing Checklist

- [ ] Unit: hash/verify utilities, JWT sign/verify, validators.
- [ ] Integration: each endpoint with success + error cases.
- [ ] Rate limit triggers at threshold.
- [ ] Refresh rotation flow.
- [ ] Reuse detection revokes family.
- [ ] E2E: signup → verify → login → refresh → logout.

## Deployment Notes

- Set all env vars (DATABASE*URL, JWT*_*SECRET, MAIL*_).
- Run `prisma migrate deploy` on first deploy.
- Provision first admin via seed or manual SQL.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] All tests pass.
- [ ] API endpoints documented.
- [ ] Database changes captured.
- [ ] Progress tracker updated.
