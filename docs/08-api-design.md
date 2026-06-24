# 08 — API Design

## Conventions

- **Base path**: `/api/v1`.
- **Format**: JSON.
- **Auth**: `Authorization: Bearer <access_token>` unless public.
- **Versioning**: URL-based (v1).
- **Style**: REST, resource-oriented, with consistent envelopes.

## Envelopes

### Success

```json
{ "success": true, "data": { ... } }
```

### Paginated

```json
{
  "success": true,
  "data": [ ... ],
  "meta": { "page": 1, "pageSize": 20, "total": 123, "totalPages": 7 }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [{ "path": "email", "issue": "Invalid email" }]
  }
}
```

## Error Codes (Standard)

| HTTP | Code               | Use                                    |
| ---- | ------------------ | -------------------------------------- |
| 400  | `VALIDATION_ERROR` | Bad input                              |
| 401  | `UNAUTHENTICATED`  | Missing/invalid token                  |
| 403  | `FORBIDDEN`        | Role/permission                        |
| 404  | `NOT_FOUND`        | Resource missing                       |
| 409  | `CONFLICT`         | State conflict (e.g., duplicate email) |
| 410  | `GONE`             | Soft-deleted/expired                   |
| 422  | `BUSINESS_RULE`    | Logical precondition failed            |
| 429  | `RATE_LIMITED`     | Too many requests                      |
| 500  | `INTERNAL`         | Server error                           |

## Pagination

- Query params: `page` (default 1), `pageSize` (default 20, max 100).
- Sorting: `sort=field:asc|desc` (e.g., `sort=createdAt:desc`).

## Filtering

- Field filters: `field=value` or `field[in]=a,b`.
- Range filters: `field[gte]=x`, `field[lte]=y`.

## Resource Groups

### Auth (`/auth`)

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET  /auth/verify-email`
- `POST /auth/resend-verification`

### Users (`/users`)

- `GET  /users/me`
- `PATCH /users/me`
- `POST /users/me/avatar`
- `GET  /users/me/addresses`
- `POST /users/me/addresses`
- `PATCH /users/me/addresses/:id`
- `DELETE /users/me/addresses/:id`

### Workers (`/workers`)

- `GET  /workers` (public; filter by category, city, rating)
- `GET  /workers/:idOrSlug`
- `GET  /workers/me/profile`
- `PUT  /workers/me/profile`
- `GET  /workers/me/skills`
- `PUT  /workers/me/skills`
- `GET  /workers/me/portfolio`
- `POST /workers/me/portfolio`
- `DELETE /workers/me/portfolio/:id`

### Categories (`/categories`)

- `GET  /categories`
- `GET  /categories/:slug`
- `GET  /categories/:slug/subcategories`
- `GET  /subcategories`

### Jobs (`/jobs`)

- `POST /jobs` (customer)
- `GET  /jobs` (customer's own list; optional `status`)
- `GET  /jobs/:id`
- `PATCH /jobs/:id` (customer; only in OPEN/DRAFT)
- `DELETE /jobs/:id` (soft delete; only in DRAFT/OPEN)
- `POST /jobs/:id/cancel`
- `POST /jobs/:id/assign` (customer picks application)
- `POST /jobs/:id/start` (worker)
- `POST /jobs/:id/complete` (worker, marks ready for review)
- `POST /jobs/:id/confirm-completion` (customer)

### Applications (`/jobs/:jobId/applications`)

- `POST /jobs/:jobId/applications` (worker)
- `GET  /jobs/:jobId/applications` (customer, job owner)
- `POST /jobs/:jobId/applications/:id/accept` (customer)
- `POST /jobs/:jobId/applications/:id/reject` (customer)
- `POST /applications/:id/withdraw` (worker)

### Reviews (`/reviews`)

- `POST /jobs/:jobId/review` (only after completion)
- `GET  /workers/:id/reviews`

### Notifications (`/notifications`)

- `GET  /notifications`
- `PATCH /notifications/:id/read`
- `POST /notifications/read-all`

### Search (`/search`)

- `GET  /search/workers?q=&category=&city=&minRating=`
- `GET  /search/jobs?q=&category=&city=&minBudget=&maxBudget=`

### Admin (`/admin`)

- `GET  /admin/overview` (KPI snapshot)
- `GET  /admin/users`
- `PATCH /admin/users/:id` (suspend, reactivate, verify)
- `GET  /admin/workers/pending`
- `POST  /admin/workers/:id/verify`
- `GET  /admin/jobs`
- `GET  /admin/reports`
- `PATCH /admin/reports/:id`
- `GET  /admin/analytics/...` (time-series, funnels)

### Uploads (`/uploads`)

- `POST /uploads/sign` → returns pre-signed URL + final asset key.

## Validation

- All request bodies and query params validated with **Zod** schemas at the route boundary.
- Validation errors mapped to `400 VALIDATION_ERROR` with field-level details.

## Security

- JWT access token (short-lived) + refresh token (rotating).
- Helmet + CORS allowlist.
- Rate limit per IP + per user on sensitive routes (`/auth/*`).
- All write endpoints require authentication except public reads.
- All admin endpoints require role `ADMIN`.

## Versioning & Deprecation

- Breaking changes shipped under `/api/v2`.
- Deprecated endpoints emit `Deprecation` and `Sunset` headers.
