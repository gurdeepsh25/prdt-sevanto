# Phase 03 — Worker Profiles

## Objective

Enable workers to create and maintain a rich profile: headline, bio, experience, hourly rate, service radius, skills (with levels), and portfolio images.

## Business Purpose

- Allow customers to evaluate workers.
- Drive trust via completeness and verification.
- Enable skill-based discovery.

## Database Changes

- **New tables**:
  - `worker_profiles`
  - `worker_skills`
  - `portfolio_items`
- **Indexes**: `worker_profiles(user_id)` unique, `worker_profiles(is_verified)`, `worker_profiles(city)`.

## Prisma Changes

- Add `WorkerProfile`, `WorkerSkill`, `PortfolioItem` models.
- Migration: `003_worker_profiles`.

## Backend Tasks

- [ ] Prisma migration.
- [ ] `workers.service.ts` (getPublicProfile, getMyProfile, updateMyProfile, upsertSkills, addPortfolio, deletePortfolio).
- [ ] Validators (Zod) for profile, skills, portfolio.
- [ ] Public list endpoint with filtering (category, city, rating).
- [ ] Aggregate fields updated on review completion (avgRating, totalJobsCompleted).

## Customer App Tasks

- [ ] `/workers` list page with filters.
- [ ] `/workers/:id` detail page (profile + portfolio + reviews).

## Worker App Tasks

- [ ] `/profile` worker tab (headline, bio, rate, radius, address).
- [ ] `/skills` page (add/remove skills, level select).
- [ ] `/portfolio` page (upload, reorder, delete).
- [ ] Profile completeness meter.

## Admin App Tasks

- [ ] `/workers/pending` queue with verify/reject actions.
- [ ] `/admin/workers/:id/verify` endpoint.

## API Endpoints

| Method | Path                               | Auth   | Description     |
| ------ | ---------------------------------- | ------ | --------------- |
| GET    | `/api/v1/workers`                  | Public | List/search     |
| GET    | `/api/v1/workers/:id`              | Public | Detail          |
| GET    | `/api/v1/workers/me/profile`       | WORKER | My profile      |
| PUT    | `/api/v1/workers/me/profile`       | WORKER | Upsert profile  |
| GET    | `/api/v1/workers/me/skills`        | WORKER | My skills       |
| PUT    | `/api/v1/workers/me/skills`        | WORKER | Replace skills  |
| GET    | `/api/v1/workers/me/portfolio`     | WORKER | List            |
| POST   | `/api/v1/workers/me/portfolio`     | WORKER | Add (image URL) |
| DELETE | `/api/v1/workers/me/portfolio/:id` | WORKER | Delete          |
| GET    | `/api/v1/admin/workers/pending`    | ADMIN  | List pending    |
| POST   | `/api/v1/admin/workers/:id/verify` | ADMIN  | Set verified    |

## Validation Rules

- `headline`: 5–100 chars.
- `bio`: ≤ 2000 chars.
- `yearsExperience`: 0–70.
- `hourlyRate`: non-negative integer (minor units).
- `serviceRadiusKm`: 1–100.
- Skills: at least one when applying to jobs (enforced later).
- Portfolio: ≤ 12 images per worker; image MIME validated on upload.

## Security Requirements

- Workers can only modify their own profile.
- Admin verify is the only path to set `isVerified=true`.
- Public profile excludes contact info.

## Acceptance Criteria

- [ ] Worker can fill profile and reach 100% completeness.
- [ ] Customer can browse workers and filter by city/category.
- [ ] Worker verification flag is only set by admin.
- [ ] avgRating updates after a review is posted.

## Testing Checklist

- [ ] Unit: validators, completeness calculation.
- [ ] Integration: CRUD flows, admin verify.
- [ ] E2E: worker profile setup → customer views profile.

## Deployment Notes

- Storage client configured.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
