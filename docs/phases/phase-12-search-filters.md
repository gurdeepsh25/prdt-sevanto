# Phase 12 — Search & Filters

## Objective

Provide cross-cutting search and filtering across workers, jobs, and categories with a consistent UX.

## Business Purpose

- Improve discovery.
- Reduce friction for both sides.
- Foundation for smart matching.

## Database Changes

- None new. May add **Postgres GIN indexes** for text search in a follow-up migration.

## Prisma Changes

- Optional: add migration enabling `pg_trgm` extension and trigram indexes.

## Backend Tasks

- [ ] `/search/workers`: full-text + filters (category, city, minRating, isVerified).
- [ ] `/search/jobs`: full-text + filters.
- [ ] `/search/suggest?q=` for typeahead (categories, skills, popular jobs).
- [ ] Standardize sort + pagination across list endpoints.
- [ ] Performance: add appropriate indexes; consider materialized views later.

## Customer App Tasks

- [ ] Global search bar with results page.
- [ ] Saved searches (deferred to backlog).

## Worker App Tasks

- [ ] Global search bar.
- [ ] Filter chips on jobs list.

## Admin App Tasks

- [ ] Search in `/users`, `/jobs`, `/workers`.

## API Endpoints

| Method | Path                     | Auth   | Description    |
| ------ | ------------------------ | ------ | -------------- |
| GET    | `/api/v1/search/workers` | Public | Workers search |
| GET    | `/api/v1/search/jobs`    | Public | Jobs search    |
| GET    | `/api/v1/search/suggest` | Public | Typeahead      |

## Validation Rules

- `q`: 1–100 chars; trimmed.
- `page`, `pageSize`, `sort` per API conventions.
- Numeric filters validated.

## Security Requirements

- Public endpoints exclude PII.
- Rate-limit search endpoints.

## Acceptance Criteria

- [ ] Searching "plumber" returns workers with matching skills.
- [ ] Filtering by city + minRating works.
- [ ] Typeahead returns suggestions under 200ms.

## Testing Checklist

- [ ] Unit: query parsing.
- [ ] Integration: filter combinations.
- [ ] Performance: p95 < 300ms.

## Deployment Notes

- Migration to add indexes runs separately.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
