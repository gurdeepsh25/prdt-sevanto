import { describe, it, expect } from "vitest";
import { publicJobsQuerySchema } from "../../src/modules/jobs/jobs.validators";

describe("publicJobsQuerySchema", () => {
  it("accepts an empty query (uses defaults)", () => {
    const r = publicJobsQuerySchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.pageSize).toBe(20);
      expect(r.data.sort).toBe("createdAt:desc");
    }
  });

  it("coerces page / pageSize", () => {
    const r = publicJobsQuerySchema.safeParse({ page: "3", pageSize: "50" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.pageSize).toBe(50);
    }
  });

  it("rejects pageSize > 100", () => {
    expect(publicJobsQuerySchema.safeParse({ pageSize: "101" }).success).toBe(
      false,
    );
  });

  it("rejects page < 1", () => {
    expect(publicJobsQuerySchema.safeParse({ page: "0" }).success).toBe(false);
  });

  it("rejects non-uuid categoryId", () => {
    expect(publicJobsQuerySchema.safeParse({ categoryId: "abc" }).success).toBe(
      false,
    );
  });

  it("accepts valid uuid categoryId / subcategoryId", () => {
    expect(
      publicJobsQuerySchema.safeParse({
        categoryId: "00000000-0000-0000-0000-000000000000",
        subcategoryId: "00000000-0000-0000-0000-000000000001",
      }).success,
    ).toBe(true);
  });

  it("accepts categorySlug and city filters", () => {
    expect(
      publicJobsQuerySchema.safeParse({
        categorySlug: "home-services",
        city: "Mumbai",
      }).success,
    ).toBe(true);
  });

  it("accepts urgency enum values", () => {
    for (const u of ["LOW", "NORMAL", "HIGH", "URGENT"]) {
      expect(publicJobsQuerySchema.safeParse({ urgency: u }).success).toBe(
        true,
      );
    }
  });

  it("rejects unknown urgency", () => {
    expect(publicJobsQuerySchema.safeParse({ urgency: "MAYBE" }).success).toBe(
      false,
    );
  });

  it("accepts budget range (min ≤ max)", () => {
    expect(
      publicJobsQuerySchema.safeParse({
        minBudget: "100",
        maxBudget: "500",
      }).success,
    ).toBe(true);
  });

  it("rejects minBudget > maxBudget", () => {
    expect(
      publicJobsQuerySchema.safeParse({
        minBudget: "500",
        maxBudget: "100",
      }).success,
    ).toBe(false);
  });

  it("rejects negative budgets", () => {
    expect(publicJobsQuerySchema.safeParse({ minBudget: "-1" }).success).toBe(
      false,
    );
    expect(publicJobsQuerySchema.safeParse({ maxBudget: "-1" }).success).toBe(
      false,
    );
  });

  it("accepts a future scheduledAfter", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(
      publicJobsQuerySchema.safeParse({ scheduledAfter: future }).success,
    ).toBe(true);
  });

  it("rejects invalid scheduledAfter", () => {
    expect(
      publicJobsQuerySchema.safeParse({ scheduledAfter: "not-a-date" }).success,
    ).toBe(false);
  });

  it("accepts search query", () => {
    expect(
      publicJobsQuerySchema.safeParse({ search: "leaking pipe" }).success,
    ).toBe(true);
  });

  it("rejects empty / oversize search", () => {
    expect(publicJobsQuerySchema.safeParse({ search: "" }).success).toBe(false);
    expect(
      publicJobsQuerySchema.safeParse({ search: "x".repeat(121) }).success,
    ).toBe(false);
  });

  it("accepts all sort options", () => {
    for (const s of [
      "createdAt:desc",
      "createdAt:asc",
      "scheduledFor:asc",
      "budgetMax:desc",
      "budgetMax:asc",
      "urgency:desc",
    ]) {
      expect(publicJobsQuerySchema.safeParse({ sort: s }).success).toBe(true);
    }
  });

  it("rejects unknown sort", () => {
    expect(
      publicJobsQuerySchema.safeParse({ sort: "random:desc" }).success,
    ).toBe(false);
  });
});
