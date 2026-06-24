# Phase 04 — Job Categories

## Objective

Establish a managed catalog of job categories, subcategories, and skills that power filtering, discovery, and worker matching.

## Business Purpose

- Structure jobs and worker expertise.
- Enable category-based browsing.
- Provide taxonomy for analytics.

## Database Changes

- **New tables**:
  - `categories`
  - `subcategories`
  - `skills`
- **Indexes**: `categories(slug)` unique; `subcategories(slug, category_id)` unique; `skills(slug)` unique.

## Prisma Changes

- Add `Category`, `Subcategory`, `Skill` models.
- Migration: `004_categories`.
- Seed: initial category tree (Home Services, Cleaning, Repairs, Tutoring, Beauty & Wellness, Fitness, Tech Help, Other).

## Backend Tasks

- [ ] Prisma migration + seed.
- [ ] `categories.service.ts` (CRUD — admin; reads — public).
- [ ] `skills.service.ts` (admin CRUD; public reads).
- [ ] Validators.
- [ ] Public endpoints: list categories, get category by slug with subcategories, list skills.
- [ ] Admin endpoints: create/update/deactivate categories, subcategories, skills.

## Customer App Tasks

- [ ] `/categories` page (grid of categories).
- [ ] `/categories/:slug` page (subcategories + featured workers).
- [ ] Category picker in Post Job wizard.

## Worker App Tasks

- [ ] Category picker in skills picker.
- [ ] Filter by category in job discovery.

## Admin App Tasks

- [ ] `/categories` management UI (tree, drag to reorder).
- [ ] CRUD for subcategories and skills.

## API Endpoints

| Method | Path                                         | Auth   | Description          |
| ------ | -------------------------------------------- | ------ | -------------------- |
| GET    | `/api/v1/categories`                         | Public | List categories      |
| GET    | `/api/v1/categories/:slug`                   | Public | Get one              |
| GET    | `/api/v1/categories/:slug/subcategories`     | Public | List subs            |
| GET    | `/api/v1/subcategories`                      | Public | List all             |
| GET    | `/api/v1/skills`                             | Public | List skills          |
| GET    | `/api/v1/admin/categories`                   | ADMIN  | All (incl. inactive) |
| POST   | `/api/v1/admin/categories`                   | ADMIN  | Create               |
| PATCH  | `/api/v1/admin/categories/:id`               | ADMIN  | Update               |
| POST   | `/api/v1/admin/categories/:id/subcategories` | ADMIN  | Add sub              |
| PATCH  | `/api/v1/admin/subcategories/:id`            | ADMIN  | Update sub           |
| POST   | `/api/v1/admin/skills`                       | ADMIN  | Create skill         |
| PATCH  | `/api/v1/admin/skills/:id`                   | ADMIN  | Update skill         |

## Validation Rules

- `name`: 2–60 chars.
- `slug`: kebab-case, unique.
- `sortOrder`: non-negative int.
- `isActive`: defaults true.

## Security Requirements

- Admin-only mutations.
- Public reads must exclude `isActive=false`.

## Acceptance Criteria

- [ ] Admin can create a category and seed appears in customer app.
- [ ] Customer app can navigate categories and subcategories.
- [ ] Worker skills picker pulls from skills catalog filtered by category.
- [ ] Deactivating a category hides it from public endpoints.

## Testing Checklist

- [ ] Unit: slug generation, ordering.
- [ ] Integration: CRUD, public filtering.
- [ ] E2E: admin creates category → customer sees it.

## Deployment Notes

- Seed runs on first deploy.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
