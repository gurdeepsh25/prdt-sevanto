# Phase 17 — Payments & Monetization

## Objective

Introduce platform commission, worker subscriptions, and customer-side payment flows.

## Business Purpose

- Generate revenue.
- Enable premium worker features.
- Payout automation.

## Database Changes

- **New tables**:
  - `payments`
  - `payouts`
  - `subscriptions`
  - `subscription_plans`

## Prisma Changes

- Add models and enums for payment status, payout status, subscription status.
- Migration: `017_payments`.

## Backend Tasks

- [ ] Prisma migration + seed plans.
- [ ] Payment provider integration (Stripe / Razorpay).
- [ ] Webhooks for payment success/failure.
- [ ] Held-escrow logic on job completion.
- [ ] Subscription management (create, cancel, renew).
- [ ] Invoice generation (PDF).
- [ ] Admin revenue dashboards.

## Customer App Tasks

- [ ] Payment method on file.
- [ ] Pay CTA on completion.
- [ ] Receipt view.

## Worker App Tasks

- [ ] Subscription page (Free / Pro / Team).
- [ ] Payouts dashboard.

## Admin App Tasks

- [ ] Revenue analytics.
- [ ] Refund / dispute actions.

## API Endpoints

| Method | Path                        | Auth     | Description           |
| ------ | --------------------------- | -------- | --------------------- |
| POST   | `/api/v1/payments/intent`   | Customer | Create payment intent |
| POST   | `/api/v1/payments/webhook`  | Provider | Webhook               |
| POST   | `/api/v1/subscriptions`     | Worker   | Subscribe             |
| DELETE | `/api/v1/subscriptions/:id` | Worker   | Cancel                |
| GET    | `/api/v1/payouts/me`        | Worker   | List payouts          |

## Validation Rules

- Amounts in minor units (cents/paise).
- Idempotency keys for intents.

## Security Requirements

- Webhook signature verification.
- PCI scope minimized via provider-hosted forms.
- Refund requires admin role.

## Acceptance Criteria

- [ ] Customer can pay for a completed job.
- [ ] Worker subscription activates Pro features.
- [ ] Admin sees revenue metrics.
- [ ] Refunds reflect in ledger.

## Testing Checklist

- [ ] Unit: pricing math, proration.
- [ ] Integration: webhook handling, idempotency.
- [ ] E2E: full payment + payout cycle in sandbox.

## Deployment Notes

- Provider live keys; sandbox for staging.
- Compliance review (PCI) as needed.

## Completion Checklist

- [ ] All tasks above checked.
- [ ] Tests pass.
- [ ] Progress tracker updated.
