# 11 — Security

A consolidated checklist of security controls and the rationale for each.

## 11.1 JWT Strategy

**Access Token (JWT)**

- Algorithm: **HS256** at MVP. Migrate to **RS256** when a second service needs to verify (future).
- Lifetime: **15 minutes**.
- Claims: `sub` (userId), `role`, `iat`, `exp`, `jti`.
- Transport: `Authorization: Bearer <token>`.
- Storage on client: in-memory (preferred) or sessionStorage (acceptable). Never `localStorage`.

**Refresh Token**

- Opaque, **256-bit random**, base64url-encoded.
- Hashed (SHA-256) before persisting.
- Lifetime: **30 days**, sliding.
- Stored in **HttpOnly, Secure, SameSite=Lax** cookie.

**Migration path to RS256**

- Generate key pair in KMS.
- Publish JWKS at `/.well-known/jwks.json`.
- Update SDK to verify via JWKS.

## 11.2 Refresh Token Rotation

Every `/auth/refresh` call:

1. Validate token + signature.
2. Mark old row `revokedAt`.
3. Insert new row, new expiry.
4. Update family id mapping if needed.

## 11.3 Refresh Token Revocation

- Logout → revoke current refresh token row.
- Password change → revoke all rows for user.
- Suspended account → revoke all rows.
- **Reuse detection**: presenting a revoked token → mark entire family revoked in DB + Redis denylist.

## 11.4 Password Hashing

- **argon2id**.
- Parameters tuned to ~250 ms on production hardware (memory ~19 MB, iterations 2, parallelism 1).
- Never use bcrypt/argon2i/scrypt in new code.
- Never log or return hashes.

## 11.5 Rate Limiting

**Tag:** Required For MVP.

| Route                        | Limit | Window | Key        |
| ---------------------------- | ----- | ------ | ---------- |
| `POST /auth/signup`          | 5     | 1 min  | IP         |
| `POST /auth/login`           | 5     | 1 min  | IP + email |
| `POST /auth/forgot-password` | 3     | 1 hour | email      |
| `POST /auth/reset-password`  | 5     | 1 hour | IP         |
| `POST /uploads/sign`         | 50    | 1 hour | userId     |
| `POST /reports`              | 10    | 1 hour | userId     |
| Default (per user)           | 100   | 1 min  | userId     |
| Default (per IP)             | 200   | 1 min  | IP         |

Store: **Redis** (`rate-limit-redis`) to share across instances.

Response on block:

```
HTTP 429
Retry-After: <seconds>
```

## 11.6 Account Lockout

- After **5 consecutive failed logins** within 15 min → lock account for **15 min**.
- Tracked in Redis.
- Admin can manually unlock via `/admin/users/:id` patch.

## 11.7 CORS

- Allowlist per app:
  - Customer: `APP_BASE_URL_CLIENT`
  - Worker: `APP_BASE_URL_WORKER`
  - Admin: `APP_BASE_URL_ADMIN`
- `credentials: true` for refresh cookie.
- Block all other origins explicitly.

## 11.8 Helmet

- `helmet()` middleware with strict CSP.
- CSP allows:
  - `default-src 'self'`
  - `connect-src 'self' <api-host>`
  - `img-src 'self' <storage-cdn>`
  - `frame-ancestors 'none'`
- HSTS enabled.
- `X-Content-Type-Options: nosniff`.

## 11.9 CSRF Strategy

Refresh tokens in **HttpOnly cookie** require CSRF protection on state-changing endpoints that rely on cookies.

- **Double-submit cookie** approach:
  - Server sets a non-HttpOnly `XSRF-TOKEN` cookie on first response.
  - Client reads it and echoes it back in `X-XSRF-TOKEN` header.
  - Server compares header to cookie (constant-time).
- Same-origin check via `Origin` / `Referer`.
- GET/HEAD/OPTIONS are exempt; all mutating routes require CSRF.

Alternative: move refresh token to response body for SPAs (no cookie). MVP uses double-submit.

## 11.10 XSS Protection

- React escapes by default; no `dangerouslySetInnerHTML` without DOMPurify.
- Server escapes any user-generated content in emails (use safe template engine).
- CSP locks down script sources.
- HttpOnly cookies prevent JS access to tokens.

## 11.11 SQL Injection Prevention

- **Prisma only.** No string concatenation in queries.
- All raw queries (if ever needed) use `prisma.$queryRaw` with tagged templates.
- DB role for app: limited permissions (no DDL).

## 11.12 Secrets Management

| Env            | Source                                                                      |
| -------------- | --------------------------------------------------------------------------- |
| Local          | `.env` (gitignored) + `.env.example` (committed)                            |
| CI             | GitHub Actions secrets                                                      |
| Staging / Prod | Platform secrets manager (AWS Secrets Manager, GCP Secret Manager, Doppler) |

**Rules:**

- No secrets in code.
- No secrets in logs.
- Rotate quarterly.
- Different secrets per environment.
- App refuses to start if a required env var is missing (strict validator on boot).

## 11.13 Additional Controls

- **Input validation**: Zod at every boundary.
- **Output encoding**: React default + CSP.
- **File upload**: MIME + size + magic-number validation.
- **Email**: SPF/DKIM/DMARC records; signed links with single-use tokens.
- **Backups**: encrypted at rest.
- **Audit log** on every privileged action.

## 11.14 Tagging Summary

| Control                  | Tag                               |
| ------------------------ | --------------------------------- |
| JWT (HS256)              | Required For MVP                  |
| Refresh token rotation   | Required For MVP                  |
| Argon2id                 | Required For MVP                  |
| Rate limiting (Redis)    | Required For MVP                  |
| Account lockout          | Required For MVP                  |
| CORS allowlist           | Required For MVP                  |
| Helmet + CSP             | Required For MVP                  |
| CSRF (double-submit)     | Required For MVP                  |
| XSS protections          | Required For MVP                  |
| Prisma (SQLi prevention) | Required For MVP                  |
| Secrets via manager      | Required Before Production Launch |
| RS256 JWT                | Future Enhancement                |
| WebAuthn (passkeys)      | Future Enhancement                |
