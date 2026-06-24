# 09 — Authentication Design

## Goals

- Stateless API authentication.
- Secure password handling.
- Smooth password recovery flow.
- Verifiable email addresses before allowing sensitive actions.
- Path to add OAuth providers later.

## Token Strategy

### Access Token

- Format: JWT (HS256 in MVP; RS256 later for multi-service).
- Lifetime: 15 minutes.
- Claims: `sub` (user id), `role`, `iat`, `exp`, `jti`.
- Transport: `Authorization: Bearer <token>`.

### Refresh Token

- Opaque random string (256-bit), stored hashed in `refresh_tokens` table.
- Lifetime: 30 days (sliding).
- Rotated on every refresh; old token revoked.
- Stored in **HttpOnly, Secure, SameSite=Lax** cookie for web clients; mobile clients may store in secure storage.
- Reuse detection: if a revoked refresh token is presented, revoke the entire token family and force re-login.

## Flows

### Signup

1. User submits email, password, role (CUSTOMER or WORKER), full name.
2. Server validates input (Zod).
3. Hash password (argon2id; cost tuned to ~250ms).
4. Create user (email unverified).
5. Generate `email_verifications` token (1-hour TTL), send email with link.
6. Return success; instruct user to verify.

### Email Verification

1. User clicks email link with token.
2. Server marks `used_at`, sets `User.isEmailVerified = true`.
3. Optionally auto-login on the verification page (post-redirect).

### Login

1. User submits email + password.
2. Server verifies hash; checks `isActive` and `isEmailVerified`.
3. Issue access JWT; issue refresh token, persist hashed.
4. Set refresh cookie; return access token + user profile.

### Refresh

1. Client posts refresh token (cookie or body).
2. Server validates; rotates; revokes old.
3. New access + refresh issued.

### Logout

1. Client posts to `/auth/logout` with refresh token.
2. Server revokes refresh token.
3. Cookie cleared.

### Forgot Password

1. User submits email.
2. Always return success (no enumeration).
3. If user exists, generate `password_resets` token (15-minute TTL), email link.

### Reset Password

1. User submits token + new password.
2. Server validates token, marks used, updates `User.passwordHash` (re-hashed), revokes all refresh tokens.

## Password Rules

- Min 8 chars, max 128.
- Must contain letters and numbers.
- Check against a small common-passwords blocklist.
- Server-side hashing: argon2id (memory: 19MB, iterations: 2, parallelism: 1 — tune per environment).

## Account Protection

- Login throttling: 5 failed attempts in 15 min → temporary lock (15 min).
- Password reset throttling: 3 requests/hour per email.
- Refresh-token reuse detection (above).
- Admin-initiated suspension (`User.isActive = false`) blocks all auth.

## Authorization

- Role-based via `requireRole(...)` middleware.
- Resource-ownership checks at service layer (e.g., only job's customer can accept applications).

## Future OAuth (Google, Apple)

- Add `accounts` table for provider linkage.
- Issue JWT on successful provider verification.
- Same refresh-token flow applies.

## Security Touchpoints

- Never log passwords or raw tokens.
- Constant-time comparison for tokens.
- Cookies: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`.
- HTTPS-only in production.
- All forms include CSRF protection if relying on cookies for refresh.

## Email Templates

- Verification email.
- Password reset email.
- (Future) Welcome email, job notifications digest.

## Acceptance Criteria (Phase 1)

- [ ] Signup creates user with hashed password.
- [ ] Verification email is sent; link verifies user.
- [ ] Login issues access + refresh.
- [ ] Refresh rotates tokens; revoked tokens cannot be used.
- [ ] Logout revokes refresh token.
- [ ] Forgot/reset flow works end-to-end.
- [ ] All auth endpoints rate-limited.
- [ ] Role-based authorization enforced.
