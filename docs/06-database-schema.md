# 06 — Database Schema

## Database

**PostgreSQL** (latest LTS-compatible). Single primary instance in MVP; read replica + connection pooling in scale phase.

## Conventions

- All primary keys: `id` (`uuid`).
- Timestamps: `created_at`, `updated_at` on every table.
- Soft-delete: `deleted_at` nullable on user-owned data.
- Enums: defined as Postgres enums via Prisma.
- Foreign keys: `ON DELETE` chosen per relationship (RESTRICT for ownership rows; CASCADE for owned/dependent rows; SET NULL for audit/notes).
- Indexes: created for all foreign keys, frequently filtered fields, and search columns.

## Core Tables (Logical)

### auth / users

- `users` — base identity.
- `accounts` — (reserved) for future OAuth providers.
- `refresh_tokens` — token, user_id, expires_at, revoked_at, user_agent, ip.
- `password_resets` — token, user_id, expires_at, used_at.
- `email_verifications` — token, user_id, expires_at, used_at.

### profiles

- `worker_profiles` — 1:1 with user where role=WORKER. bio, headline, years_experience, hourly_rate, city, service_radius_km, is_verified, verified_at, avg_rating, total_jobs_completed.
- `worker_skills` — worker_id, skill_id, level.
- `skills` — name, slug, category_id.
- `portfolio_items` — worker_id, image_url, caption, sort_order.
- `user_addresses` — user_id, line1, line2, city, state, postal_code, lat, lng, is_default.

### catalog

- `categories` — name, slug, description, icon, sort_order, is_active.
- `subcategories` — name, slug, category_id, is_active.

### jobs

- `jobs` — customer_id, category_id, subcategory_id?, title, description, budget_min, budget_max, address_id, scheduled_for?, status, assigned_worker_id?, city, lat, lng, urgency, created_at.
- `job_attachments` — job_id, file_url, kind.
- `job_status_history` — job_id, from_status, to_status, changed_by, reason?, created_at.

### applications

- `job_applications` — job_id, worker_id, cover_note, proposed_price, status (PENDING, ACCEPTED, REJECTED, WITHDRAWN), created_at.

### reviews

- `reviews` — job_id, reviewer_id, reviewee_id, rating (1–5), comment, created_at.

### notifications

- `notifications` — user_id, type, title, body, data (jsonb), read_at, created_at.

### admin / moderation

- `reports` — reporter_id, target_type (JOB|USER|REVIEW), target_id, reason, description, status (OPEN|IN_REVIEW|RESOLVED|DISMISSED), resolved_by, resolved_at.
- `audit_logs` — actor_id, action, entity_type, entity_id, metadata (jsonb), created_at.

### (future)

- `payments`, `subscriptions`, `chats`, `messages`, `payouts`.

## Relationships (High Level)

```
users 1—1 worker_profiles
users 1—* user_addresses
users 1—* refresh_tokens
users 1—* password_resets
users 1—* email_verifications

worker_profiles 1—* worker_skills *—1 skills
worker_profiles 1—* portfolio_items

categories 1—* subcategories
categories 1—* skills

users (CUSTOMER) 1—* jobs
jobs *—1 categories
jobs *—1 subcategories (optional)
jobs *—* users (WORKER) via assigned_worker_id
jobs 1—* job_attachments
jobs 1—* job_status_history
jobs 1—* job_applications *—1 users (WORKER)
jobs 1—1 reviews
jobs *—1 user_addresses

users 1—* notifications
users 1—* reports (as reporter)
users 1—* audit_logs (as actor)
```

## Indexes (Initial)

- `users(email)` unique.
- `users(role)`.
- `refresh_tokens(user_id)`, `refresh_tokens(token)` unique.
- `worker_profiles(user_id)` unique, `worker_profiles(is_verified)`, `worker_profiles(city)`.
- `skills(slug)` unique.
- `categories(slug)` unique, `subcategories(slug, category_id)` unique.
- `jobs(status)`, `jobs(customer_id)`, `jobs(assigned_worker_id)`, `jobs(category_id)`, `jobs(city)`, `jobs(created_at desc)`.
- `job_applications(job_id)`, `job_applications(worker_id)`, `job_applications(status)`.
- `reviews(reviewee_id)`, `reviews(job_id)` unique.
- `notifications(user_id, read_at)`, `notifications(created_at desc)`.
- `reports(status)`.

## Data Integrity Rules

- A `job` can be `ASSIGNED` only if `assigned_worker_id` is set and an `ACCEPTED` application exists.
- `review` must reference a `COMPLETED` job.
- `worker_profile.is_verified` only set by admin.
- Soft-deleted users must not appear in public discovery.
