-- Phase 5 — Job Posting
-- Adds Job + JobAttachment tables and the JobStatus / JobUrgency enums.

-- =====================================================
-- 1. enums
-- =====================================================
DO $$ BEGIN
    CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "JobUrgency" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- 2. jobs
-- =====================================================
CREATE TABLE IF NOT EXISTS "jobs" (
    "id"              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    "customer_id"     UUID         NOT NULL REFERENCES "users"("id")          ON DELETE CASCADE,
    "category_id"     UUID         NOT NULL REFERENCES "categories"("id")     ON DELETE RESTRICT,
    "subcategory_id"  UUID              NULL REFERENCES "subcategories"("id") ON DELETE SET NULL,
    "address_id"      UUID         NOT NULL REFERENCES "user_addresses"("id") ON DELETE RESTRICT,

    "title"           VARCHAR(120) NOT NULL,
    "description"     TEXT         NOT NULL,
    "budget_min"      INTEGER,
    "budget_max"      INTEGER,
    "currency"        VARCHAR(3)   NOT NULL DEFAULT 'INR',
    "urgency"         "JobUrgency" NOT NULL DEFAULT 'NORMAL',
    "scheduled_for"   TIMESTAMPTZ,
    "city"            VARCHAR(80)  NOT NULL,
    "status"          "JobStatus"  NOT NULL DEFAULT 'OPEN',
    "cancelled_at"    TIMESTAMPTZ,
    "cancel_reason"   VARCHAR(280),
    "deleted_at"      TIMESTAMPTZ,

    "created_at"      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_budget_range_check" CHECK (
        "budget_min" IS NULL OR "budget_max" IS NULL OR "budget_min" <= "budget_max"
    ),
    CONSTRAINT "jobs_budget_nonneg_check" CHECK (
        ("budget_min" IS NULL OR "budget_min" >= 0)
        AND ("budget_max" IS NULL OR "budget_max" >= 0)
    )
);

CREATE INDEX IF NOT EXISTS "jobs_customer_id_idx"         ON "jobs" ("customer_id");
CREATE INDEX IF NOT EXISTS "jobs_category_id_idx"         ON "jobs" ("category_id");
CREATE INDEX IF NOT EXISTS "jobs_subcategory_id_idx"      ON "jobs" ("subcategory_id");
CREATE INDEX IF NOT EXISTS "jobs_city_idx"                ON "jobs" ("city");
CREATE INDEX IF NOT EXISTS "jobs_status_idx"              ON "jobs" ("status");
CREATE INDEX IF NOT EXISTS "jobs_created_at_desc_idx"     ON "jobs" ("created_at" DESC);

-- =====================================================
-- 3. job_attachments
-- =====================================================
CREATE TABLE IF NOT EXISTS "job_attachments" (
    "id"         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    "job_id"     UUID         NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
    "url"        VARCHAR(2048) NOT NULL,
    "caption"    VARCHAR(280),
    "sort_order" INTEGER      NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "job_attachments_job_id_idx" ON "job_attachments" ("job_id");