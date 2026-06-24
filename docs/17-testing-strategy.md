# 17 — Testing Strategy

## Levels

### 1. Unit Tests

- Pure functions, utilities, validators.
- Tools: **Vitest** or **Jest**.
- Coverage target: 70% on `server/src/common`, `server/src/modules/**/services`.

### 2. Integration Tests (API)

- Spin up Express app + ephemeral PostgreSQL (testcontainers or PG-in-Docker).
- Hit endpoints with **supertest**.
- Assert status, body shape, DB side-effects.
- Tools: Vitest + Supertest + Testcontainers (or pg-mem for simple cases).

### 3. Component Tests (Frontend)

- **React Testing Library** + **Vitest**.
- Render components, simulate events.
- Mock network with **MSW**.

### 4. End-to-End Tests

- Playwright.
- Smoke flows per app:
  - Customer: signup → verify → post job → review.
  - Worker: signup → verify → profile → apply → complete.
  - Admin: login → verify worker → resolve report.
- Run against deployed staging.

### 5. Manual / Exploratory

- Designer + PM exploratory passes pre-release.

## Test Data

- `prisma/seed.ts` for dev only.
- `tests/fixtures/` for unit/integration.
- Per-test cleanup (truncate or transactional rollback).

## Critical Test Areas

### Auth

- Signup with duplicate email → 409.
- Login wrong password → 401.
- Login throttling after N failures → 429.
- Refresh token reuse → family revoked.
- Reset token expiry enforced.
- Email verification gating.

### Jobs

- Lifecycle transitions only allowed per state machine.
- Only job owner can accept application.
- Accepting one application rejects others automatically.
- Only assigned worker can start.
- Only customer can confirm completion.
- Review only allowed after completion.

### Worker Profile

- Only verified workers can be boosted (future).

### Permissions

- Cross-role denial tests for each protected endpoint.

## Performance & Load

- k6 scripts for: job list endpoint, search endpoint, worker list endpoint.
- Targets: p95 < 300ms for list endpoints at 50 RPS.

## CI Integration

- GitHub Actions:
  - Lint + typecheck + unit + integration on PRs.
  - Playwright E2E on `main` and tags.
- Coverage report uploaded.

## Regression Suite

- Tagged test suite `regression` re-run before each release.

## Bug Tracking

- All bugs linked to a phase.
- Each bug has reproduction steps + fix PR.
