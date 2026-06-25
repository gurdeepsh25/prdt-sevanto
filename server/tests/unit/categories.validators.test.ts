import { describe, it, expect } from "vitest";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  subcategoryCreateSchema,
  subcategoryUpdateSchema,
  skillCreateSchema,
  skillUpdateSchema,
  publicSkillsQuerySchema,
  categorySlugParamSchema,
} from "../../src/modules/categories/categories.validators";

describe("categorySlugParamSchema", () => {
  it("accepts kebab-case slugs", () => {
    expect(
      categorySlugParamSchema.safeParse({ slug: "home-services" }).success,
    ).toBe(true);
  });
  it("rejects uppercase", () => {
    expect(
      categorySlugParamSchema.safeParse({ slug: "Home-Services" }).success,
    ).toBe(false);
  });
  it("rejects spaces", () => {
    expect(
      categorySlugParamSchema.safeParse({ slug: "home services" }).success,
    ).toBe(false);
  });
  it("rejects empty", () => {
    expect(categorySlugParamSchema.safeParse({ slug: "" }).success).toBe(false);
  });
});

describe("categoryCreateSchema", () => {
  it("accepts a minimal valid category", () => {
    expect(categoryCreateSchema.safeParse({ name: "Home Services" }).success).toBe(
      true,
    );
  });
  it("accepts a full category", () => {
    expect(
      categoryCreateSchema.safeParse({
        name: "Cleaning",
        slug: "cleaning",
        description: "House and office cleaning services",
        iconKey: "sparkles",
        sortOrder: 2,
        isActive: true,
      }).success,
    ).toBe(true);
  });
  it("rejects name shorter than 2 chars", () => {
    expect(categoryCreateSchema.safeParse({ name: "A" }).success).toBe(false);
  });
  it("rejects name longer than 60 chars", () => {
    expect(
      categoryCreateSchema.safeParse({ name: "x".repeat(61) }).success,
    ).toBe(false);
  });
  it("rejects bad slug format", () => {
    expect(
      categoryCreateSchema.safeParse({
        name: "Cleaning",
        slug: "Not_Allowed!",
      }).success,
    ).toBe(false);
  });
  it("rejects unknown fields (strict)", () => {
    expect(
      categoryCreateSchema.safeParse({
        name: "Cleaning",
        foo: "bar",
      }).success,
    ).toBe(false);
  });
});

describe("categoryUpdateSchema", () => {
  it("accepts a partial update", () => {
    expect(
      categoryUpdateSchema.safeParse({ description: "New desc" }).success,
    ).toBe(true);
  });
  it("accepts toggling isActive false", () => {
    expect(
      categoryUpdateSchema.safeParse({ isActive: false }).success,
    ).toBe(true);
  });
  it("rejects empty payloads", () => {
    expect(categoryUpdateSchema.safeParse({}).success).toBe(false);
  });
});

describe("subcategoryCreateSchema", () => {
  it("accepts a minimal subcategory", () => {
    expect(
      subcategoryCreateSchema.safeParse({ name: "Plumbing" }).success,
    ).toBe(true);
  });
  it("rejects unknown fields", () => {
    expect(
      subcategoryCreateSchema.safeParse({
        name: "Plumbing",
        categoryId: "00000000-0000-0000-0000-000000000000",
      }).success,
    ).toBe(false);
  });
});

describe("subcategoryUpdateSchema", () => {
  it("requires at least one field", () => {
    expect(subcategoryUpdateSchema.safeParse({}).success).toBe(false);
  });
  it("accepts sortOrder only", () => {
    expect(subcategoryUpdateSchema.safeParse({ sortOrder: 5 }).success).toBe(
      true,
    );
  });
});

describe("skillCreateSchema", () => {
  it("accepts a skill without subcategory", () => {
    expect(skillCreateSchema.safeParse({ name: "Pipe Fitting" }).success).toBe(
      true,
    );
  });
  it("accepts a skill with subcategoryId uuid", () => {
    expect(
      skillCreateSchema.safeParse({
        name: "Drain Cleaning",
        subcategoryId: "00000000-0000-0000-0000-000000000000",
      }).success,
    ).toBe(true);
  });
  it("rejects non-uuid subcategoryId", () => {
    expect(
      skillCreateSchema.safeParse({
        name: "Drain Cleaning",
        subcategoryId: "not-a-uuid",
      }).success,
    ).toBe(false);
  });
});

describe("skillUpdateSchema", () => {
  it("rejects empty payload", () => {
    expect(skillUpdateSchema.safeParse({}).success).toBe(false);
  });
  it("accepts isActive toggle", () => {
    expect(skillUpdateSchema.safeParse({ isActive: false }).success).toBe(true);
  });
  it("accepts null subcategoryId to unlink", () => {
    expect(
      skillUpdateSchema.safeParse({ subcategoryId: null }).success,
    ).toBe(true);
  });
});

describe("publicSkillsQuerySchema", () => {
  it("accepts an empty query", () => {
    expect(publicSkillsQuerySchema.safeParse({}).success).toBe(true);
  });
  it("accepts categoryId only", () => {
    expect(
      publicSkillsQuerySchema.safeParse({
        categoryId: "00000000-0000-0000-0000-000000000000",
      }).success,
    ).toBe(true);
  });
  it("transforms includeInactive string true → boolean true", () => {
    const r = publicSkillsQuerySchema.safeParse({ includeInactive: "true" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.includeInactive).toBe(true);
  });
  it("rejects non-uuid categoryId", () => {
    expect(
      publicSkillsQuerySchema.safeParse({ categoryId: "abc" }).success,
    ).toBe(false);
  });
});