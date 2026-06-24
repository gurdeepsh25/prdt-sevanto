# 06 — File Storage

## Decision: **Cloudflare R2 for MVP**, with an **S3-compatible interface** so we can swap to AWS S3 at any time.

**Tag:** R2 — **Required For MVP**; S3 — **Future / Enterprise** alternative.

## Why Cloudflare R2

| Criterion         | R2                       | S3                    |
| ----------------- | ------------------------ | --------------------- |
| Egress cost       | **$0**                   | $0.09/GB              |
| Storage           | $0.015/GB                | $0.023/GB             |
| S3 API compatible | ✅                       | ✅ (native)           |
| Pre-signed URLs   | ✅                       | ✅                    |
| CDN integration   | Bundled (Cloudflare)     | Separate (CloudFront) |
| Latency           | Excellent (edge network) | Regional              |
| Vendor lock-in    | Low (S3 API)             | Medium                |

**Verdict:** R2 wins on cost for an image-heavy MVP. Keep the abstraction layer so swap is trivial.

## Storage Layout

```
bucket: sevanto-assets
  avatars/<userId>/<uuid>.<ext>
  portfolio/<workerProfileId>/<uuid>.<ext>
  jobs/<jobId>/attachments/<uuid>.<ext>
  chat/<chatId>/<uuid>.<ext>     (Phase 15)
  exports/<admin>/<uuid>.csv     (admin)
```

## Upload Flow

### Client → Server → Client → Storage

1. Client requests **pre-signed PUT URL** from `POST /uploads/sign` with `kind`, `contentType`, `sizeBytes`.
2. Server validates:
   - User authenticated.
   - `sizeBytes` ≤ per-kind limit.
   - `contentType` in allowlist.
   - Per-user rate limit (e.g., 50 uploads/day).
3. Server returns `{ url, key, expiresAt }`.
4. Client uploads directly to storage.
5. Client posts `{ key }` to the relevant endpoint (e.g., `POST /workers/me/portfolio`).

> **Server never proxies the binary.** This minimizes compute and avoids streaming attacks.

## File Kind Limits

| Kind              | Max Size  | MIME Allowlist                          |
| ----------------- | --------- | --------------------------------------- |
| `avatar`          | 5 MB      | `image/jpeg`, `image/png`, `image/webp` |
| `portfolio`       | 8 MB each | `image/jpeg`, `image/png`, `image/webp` |
| `job_attachment`  | 15 MB     | `image/*`, `application/pdf`            |
| `chat_attachment` | 10 MB     | `image/*`, `application/pdf`            |
| `export` (admin)  | 50 MB     | `text/csv`, `application/json`          |

## Image Processing (Phase 18 hardening)

- On upload, enqueue `media.thumbnail` job (BullMQ).
- Worker generates: thumbnail (300×300), medium (800×800), original.
- Stores derivatives under `…/derivatives/<size>/<uuid>`.
- Frontend uses `<picture>` with `srcset` of derivatives.

## Access Control

- **Public reads** for `avatars/`, `portfolio/` (via CDN URL).
- **Private reads** for `chat/`, `exports/` — must be served via signed GET URLs (short TTL).
- Server stores object keys; never exposes bucket name in URLs.

## Virus / Malware Scanning

- **Not required for MVP** (low-risk content types).
- **Required Before Production Launch** at least for chat attachments — integrate ClamAV via worker or vendor.

## Lifecycle Rules

- Soft-deleted user avatars: marked but kept 30 days, then purged.
- Chat attachments: kept X months per retention policy (TBD).
- Exports: auto-delete after 7 days.

## Disaster Recovery

- R2 replicates across regions automatically (managed).
- Cross-region replication: enable for production.

## Tagging Summary

| Tech                       | Tag                                             |
| -------------------------- | ----------------------------------------------- |
| Cloudflare R2              | Required For MVP                                |
| S3-compatible abstraction  | Required For MVP                                |
| Image derivatives (BullMQ) | Required Before Production Launch               |
| Virus scanning             | Required Before Production Launch               |
| AWS S3 migration           | Enterprise Scale Requirement (or vendor change) |
