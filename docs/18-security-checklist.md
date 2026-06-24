# 18 — Security Checklist

## Authentication & Authorization

- [ ] Passwords hashed with argon2id.
- [ ] JWT access tokens short-lived (≤15 min).
- [ ] Refresh tokens hashed at rest; rotated on refresh.
- [ ] Refresh-token reuse detection revokes the family.
- [ ] Role-based authorization enforced at middleware + service.
- [ ] Resource ownership checks for mutations.

## Transport & Headers

- [ ] HTTPS only in production.
- [ ] HSTS enabled.
- [ ] Helmet configured with strict CSP.
- [ ] Secure cookies (HttpOnly, Secure, SameSite=Lax).
- [ ] CORS allowlist per app origin.

## Input & Output

- [ ] All inputs validated with Zod.
- [ ] No string concatenation in SQL (Prisma only).
- [ ] Output encoding on rendered HTML.
- [ ] No `dangerouslySetInnerHTML` without sanitization.

## Rate Limiting & Abuse

- [ ] Rate limit on `/auth/*` (per IP + per email).
- [ ] Global rate limit (e.g., 100 req/min/user).
- [ ] Captcha on signup/login (future).

## Secrets Management

- [ ] Secrets in env vars; never committed.
- [ ] `.env.example` only.
- [ ] Secrets rotated periodically.
- [ ] Different secrets per environment.

## Logging & PII

- [ ] Never log passwords, tokens, or PII beyond necessity.
- [ ] Structured logs with correlation IDs.
- [ ] PII at rest encrypted (DB-level for sensitive columns).

## File Uploads

- [ ] Pre-signed URLs only (client never holds master key).
- [ ] Validate MIME types and size.
- [ ] Virus scanning (future).

## Dependencies

- [ ] `npm audit` clean in CI.
- [ ] Renovate/Dependabot enabled.
- [ ] Lockfile committed.

## Backups & Recovery

- [ ] Automated DB backups daily.
- [ ] Restore drill quarterly.

## Monitoring

- [ ] Error tracking (Sentry).
- [ ] Uptime checks.
- [ ] Alerts on auth anomaly (spike in failed logins).

## Compliance (Future)

- [ ] GDPR data export + delete flows.
- [ ] Terms of Service + Privacy Policy.
- [ ] Cookie consent banner.

## Penetration Testing

- Pre-launch third-party pen test on staging.
- Annual review thereafter.
