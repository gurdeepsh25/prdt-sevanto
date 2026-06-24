# 07 — Prisma Schema Plan

## Generator & Datasource

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Enums

- `Role` — `CUSTOMER | WORKER | ADMIN`
- `JobStatus` — `DRAFT | OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED | EXPIRED`
- `ApplicationStatus` — `PENDING | ACCEPTED | REJECTED | WITHDRAWN`
- `ReportStatus` — `OPEN | IN_REVIEW | RESOLVED | DISMISSED`
- `ReportTarget` — `JOB | USER | REVIEW`
- `NotificationType` — many (enum used as discriminator)
- `SkillLevel` — `BEGINNER | INTERMEDIATE | EXPERT`
- `Urgency` — `LOW | NORMAL | HIGH | URGENT`

## Models (sketch)

### User

- `id`, `email` (unique), `passwordHash`, `role` (Role), `isActive`, `isEmailVerified`, `fullName`, `phone?`, `avatarUrl?`, `createdAt`, `updatedAt`, `deletedAt?`.

### RefreshToken

- `id`, `token` (unique), `userId`, `expiresAt`, `revokedAt?`, `userAgent?`, `ip?`, `createdAt`.

### PasswordReset

- `id`, `token` (unique), `userId`, `expiresAt`, `usedAt?`, `createdAt`.

### EmailVerification

- `id`, `token` (unique), `userId`, `expiresAt`, `usedAt?`, `createdAt`.

### UserAddress

- `id`, `userId`, `line1`, `line2?`, `city`, `state`, `postalCode`, `country`, `lat?`, `lng?`, `isDefault`, `createdAt`.

### WorkerProfile

- `id`, `userId` (unique), `headline`, `bio`, `yearsExperience`, `hourlyRate?`, `city`, `serviceRadiusKm`, `isVerified`, `verifiedAt?`, `avgRating` (Float, default 0), `totalJobsCompleted` (Int, default 0), `createdAt`, `updatedAt`.

### Skill

- `id`, `name`, `slug` (unique), `categoryId?`, `isActive`, `createdAt`.

### WorkerSkill

- `id`, `workerProfileId`, `skillId`, `level` (SkillLevel), @@unique([workerProfileId, skillId]).

### PortfolioItem

- `id`, `workerProfileId`, `imageUrl`, `caption?`, `sortOrder`, `createdAt`.

### Category

- `id`, `name`, `slug` (unique), `description?`, `icon?`, `sortOrder`, `isActive`, `createdAt`.

### Subcategory

- `id`, `name`, `slug`, `categoryId`, `isActive`, @@unique([slug, categoryId]).

### Job

- `id`, `customerId`, `categoryId`, `subcategoryId?`, `title`, `description`, `budgetMin`, `budgetMax`, `addressId`, `scheduledFor?`, `urgency` (Urgency), `status` (JobStatus), `assignedWorkerId?`, `city`, `lat?`, `lng?`, `createdAt`, `updatedAt`, `deletedAt?`.

### JobAttachment

- `id`, `jobId`, `fileUrl`, `kind`, `createdAt`.

### JobStatusHistory

- `id`, `jobId`, `fromStatus`, `toStatus`, `changedBy`, `reason?`, `createdAt`.

### JobApplication

- `id`, `jobId`, `workerId`, `coverNote?`, `proposedPrice?`, `status` (ApplicationStatus), `createdAt`, `updatedAt`, @@unique([jobId, workerId]).

### Review

- `id`, `jobId` (unique), `reviewerId`, `revieweeId`, `rating` (Int 1..5), `comment?`, `createdAt`.

### Notification

- `id`, `userId`, `type`, `title`, `body`, `data` (Json), `readAt?`, `createdAt`.

### Report

- `id`, `reporterId`, `targetType` (ReportTarget), `targetId`, `reason`, `description?`, `status` (ReportStatus), `resolvedBy?`, `resolvedAt?`, `createdAt`.

### AuditLog

- `id`, `actorId`, `action`, `entityType`, `entityId`, `metadata` (Json), `createdAt`.

## Relations (Prisma-style highlights)

- `User → WorkerProfile?` (1:1), `User → UserAddress[]`, `User → RefreshToken[]`.
- `WorkerProfile → WorkerSkill[] → Skill`.
- `Category → Subcategory[]`, `Category → Skill[]`.
- `User (CUSTOMER) → Job[]` via `customerId`.
- `Job → JobApplication[] → User (WORKER)` via `workerId`.
- `Job → Review?` (1:1 unique).
- `User → Notification[]`, `User → Report[]` (reporter), `User → AuditLog[]` (actor).

## Indexes

- All FKs.
- `User.email` unique; `User.role`.
- `Job.status`, `Job.city`, `Job.createdAt desc`.
- `JobApplication.jobId`, `JobApplication.workerId`, `JobApplication.status`.
- `Notification.userId, readAt`, `Notification.createdAt desc`.
- `Report.status`.

## Migrations & Seeding

- Migrations versioned in `prisma/migrations/`.
- Seed script (`prisma/seed.ts`) seeds:
  - Categories (top-level + subcategories).
  - Admin user (from env).
  - Sample skills.
  - (Optional) Demo customer/worker accounts.

## Client Usage

- Single `PrismaClient` exported from `infra/prisma/client.ts`.
- Module-scoped repositories wrap queries.
- Transactions used for multi-step writes (e.g., accepting application + assigning job).
