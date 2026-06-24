# 00 — Project Overview

## Project Name

**Sevanto**

## Tagline

_"Trusted local workforce, on demand."_

## What is Sevanto?

Sevanto is a hyperlocal workforce and services platform that connects customers seeking services (home repair, cleaning, plumbing, electrical work, tutoring, beauty, fitness, etc.) with verified, skilled workers in their vicinity. It supports three distinct applications (Customer, Worker, Admin) backed by a single Node.js + Express backend.

## Primary Goals

- Enable customers to post jobs and discover nearby verified workers.
- Allow workers to build profiles, showcase skills/portfolio, and apply for jobs.
- Provide admins with a complete moderation, analytics, and reporting dashboard.
- Build a startup-grade, scalable, multi-tenant-ready architecture.

## Monorepo Layout

```
sevanto/
├── client/   # Customer-facing Next.js app
├── worker/   # Worker-facing Next.js app
├── admin/    # Admin Dashboard Next.js app
├── server/   # Node.js + Express + TypeScript backend
└── docs/     # Planning & implementation documentation (this folder)
```

## Target Market

- Tier-1 and Tier-2 cities initially.
- Urban, semi-urban consumers.
- Independent skilled workers and small contractor teams.

## MVP Scope

- Email-based authentication (signup/login/forgot/reset/verify).
- Worker profile with skills and portfolio.
- Job posting, discovery, applications, assignment.
- Job lifecycle: posted → assigned → in-progress → completed → reviewed.
- Notifications (in-app + email).
- Admin moderation and analytics.

## Tech Snapshot

| Layer    | Stack                                                              |
| -------- | ------------------------------------------------------------------ |
| Backend  | Node.js, Express.js, TypeScript, PostgreSQL, Prisma, JWT + Refresh |
| Customer | Next.js, TS, Tailwind, Shadcn UI, Zustand, TanStack Query          |
| Worker   | Next.js, TS, Tailwind, Shadcn UI, Zustand, TanStack Query          |
| Admin    | Next.js, TS, Tailwind, Shadcn UI, Zustand, TanStack Query          |

## Out of MVP Scope (Future)

Realtime chat, maps, push notifications, premium workers, subscriptions, platform commission, featured listings, mobile apps, contractor accounts, team management, payments integration.

## Documentation Index

See [docs/23-progress-tracker.md](23-progress-tracker.md) for current state.
