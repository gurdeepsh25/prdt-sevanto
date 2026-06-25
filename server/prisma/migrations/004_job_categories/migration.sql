-- Phase 4 — Job Categories
-- Adds a Category → Subcategory → Skill taxonomy so jobs and worker skills
-- can be filtered / grouped.

-- =====================================================
-- 1. categories
-- =====================================================
CREATE TABLE IF NOT EXISTS "categories" (
    "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name"         VARCHAR(60)  NOT NULL,
    "slug"         VARCHAR(80)  NOT NULL UNIQUE,
    "description"  VARCHAR(500),
    "icon_key"     VARCHAR(40),
    "sort_order"   INTEGER      NOT NULL DEFAULT 0,
    "is_active"    BOOLEAN      NOT NULL DEFAULT TRUE,
    "created_at"   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "categories_is_active_sort_order_idx"
    ON "categories" ("is_active", "sort_order");

-- =====================================================
-- 2. subcategories
-- =====================================================
CREATE TABLE IF NOT EXISTS "subcategories" (
    "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "category_id"  UUID         NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
    "name"         VARCHAR(60)  NOT NULL,
    "slug"         VARCHAR(80)  NOT NULL,
    "description"  VARCHAR(500),
    "sort_order"   INTEGER      NOT NULL DEFAULT 0,
    "is_active"    BOOLEAN      NOT NULL DEFAULT TRUE,
    "created_at"   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subcategories_category_id_slug_unique" UNIQUE ("category_id", "slug")
);

CREATE INDEX IF NOT EXISTS "subcategories_category_id_is_active_sort_order_idx"
    ON "subcategories" ("category_id", "is_active", "sort_order");

-- =====================================================
-- 3. skills: add optional subcategory_id
-- =====================================================
ALTER TABLE "skills"
    ADD COLUMN IF NOT EXISTS "subcategory_id" UUID
        REFERENCES "subcategories"("id") ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS "updated_at"     TIMESTAMPTZ
        NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "skills_subcategory_id_idx" ON "skills" ("subcategory_id");
CREATE INDEX IF NOT EXISTS "skills_is_active_idx"      ON "skills" ("is_active");