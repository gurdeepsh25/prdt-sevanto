# 08 — Logging

## Decision: **Pino for application logs**, **structured JSON to stdout**, **shipped via a log sink**.

**Tag:** Required For MVP.

## Why Pino, Not Winston

| Criterion                | Pino                         | Winston |
| ------------------------ | ---------------------------- | ------- |
| Speed                    | 5–10× faster                 | Slower  |
| Default format           | JSON                         | Custom  |
| Async child loggers      | Native                       | Manual  |
| Transport ecosystem      | pino-pretty, pino-loki, etc. | OK      |
| Bundle impact (frontend) | N/A (server only)            | N/A     |
| TypeScript support       | First-class                  | OK      |

Pino is the standard for modern Node.js services.

## Log Levels

- `fatal` — app crash imminent (uncaught).
- `error` — handled exceptions, failed jobs.
- `warn` — degraded path, retry attempt.
- `info` — lifecycle events (server started, route registered).
- `debug` — verbose (off in production).
- `trace` — extreme verbosity (off in production).

## Categories

| Category            | Source                                                              | Where It Goes                       |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------- |
| **Request logs**    | HTTP middleware (one log per request)                               | stdout → log sink → Loki/CloudWatch |
| **Error logs**      | Centralized error middleware + try/catch in services                | stdout + Sentry                     |
| **Audit logs**      | Persisted in DB (`audit_logs` table) for compliance-visible actions | DB + log sink                       |
| **Security events** | Auth, rate limit hits, suspicious activity                          | stdout + Sentry + alert             |
| **Job logs**        | BullMQ worker logs                                                  | stdout                              |
| **Realtime logs**   | Socket.io events                                                    | stdout (debug only)                 |

## Request Log Shape

```json
{
  "level": "info",
  "time": "2026-06-24T10:00:00Z",
  "reqId": "01HX...",
  "userId": "uuid",
  "method": "POST",
  "url": "/api/v1/auth/login",
  "status": 200,
  "durationMs": 35,
  "ua": "...",
  "ip": "..."
}
```

## Error Log Shape

```json
{
  "level": "error",
  "time": "...",
  "reqId": "...",
  "err": {
    "name": "ZodError",
    "message": "...",
    "stack": "..."
  },
  "context": { "route": "POST /auth/login" }
}
```

## Audit Log Shape (DB)

- Persisted via `auditLog.record({ actorId, action, entityType, entityId, metadata })`.
- Examples: `user.suspend`, `worker.verify`, `report.resolve`, `job.force_cancel`.

## Security Event Examples

- Failed login (5 in 5 min) → `warn`.
- Refresh-token reuse → `error` + alert.
- Admin permission denied → `warn`.
- File upload MIME mismatch → `warn`.

## PII Rules

- Never log: passwords, raw tokens, OTPs, full address, full name (only userId).
- Hash or omit sensitive fields at the logger boundary.
- Logs retained 30 days (tunable).

## Correlation IDs

- `reqId` (ULID) generated at edge middleware.
- Propagated into all child loggers via `pino.child({ reqId })`.

## Redaction

- `pino` redaction list:
  - `req.headers.authorization`
  - `req.headers.cookie`
  - `*.password`
  - `*.passwordHash`
  - `*.token`
  - `*.refreshToken`

## Transports

- **Local dev**: `pino-pretty` to stdout.
- **Production**: stdout → platform log sink (e.g., CloudWatch, GCP Logging, Loki).
- **Errors**: Sentry SDK catches uncaught + manual `Sentry.captureException`.

## Sampling

- Default 100% in MVP.
- At high scale: reduce `info` to 10% for `/jobs` list (debug only).

## Tagging Summary

| Tech                              | Tag                               |
| --------------------------------- | --------------------------------- |
| Pino                              | Required For MVP                  |
| pino-pretty                       | Required For MVP                  |
| Sentry SDK                        | Required Before Production Launch |
| Log aggregation (Loki/CloudWatch) | Required Before Production Launch |
| Winston                           | ❌ Rejected                       |
