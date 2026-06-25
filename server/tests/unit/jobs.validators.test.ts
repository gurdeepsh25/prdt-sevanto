import { describe, it, expect } from "vitest";
import {
  jobCreateSchema,
  jobUpdateSchema,
  jobAttachmentCreateSchema,
  jobCancelSchema,
  jobListQuerySchema,
  jobStatusSchema,
  jobUrgencySchema,
  JOB_CANCELLABLE_STATUSES,
  JOB_OWNER_EDITABLE_STATUSES,
} from "../../src/modules/jobs/jobs.validators";

const validCreate = {
  title: "Need a plumber to fix kitchen sink",
  description:
    "The kitchen sink drain has been leaking for a few days. Need an experienced plumber to inspect and fix or replace as needed.",
  categoryId: "00000000-0000-0000-0000-000000000000",
  addressId: "00000000-0000-0000-0000-000000000001",
  budgetMin: 50000,
  budgetMax: 150000,
  currency: "INR",
  urgency: "NORMAL",
};

describe("jobStatusSchema", () => {
  it("accepts known statuses", () => {
    for (const s of [
      "DRAFT",
      "OPEN",
      "ASSIGNED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "EXPIRED",
    ]) {
      expect(jobStatusSchema.safeParse(s).success).toBe(true);
    }
  });
  it("rejects unknown", () => {
    expect(jobStatusSchema.safeParse("UNKNOWN").success).toBe(false);
  });
});

describe("jobUrgencySchema", () => {
  it("accepts all urgencies", () => {
    for (const u of ["LOW", "NORMAL", "HIGH", "URGENT"]) {
      expect(jobUrgencySchema.safeParse(u).success).toBe(true);
    }
  });
});

describe("jobCreateSchema", () => {
  it("accepts a complete valid payload", () => {
    expect(jobCreateSchema.safeParse(validCreate).success).toBe(true);
  });
  it("accepts a minimal payload (uses defaults)", () => {
    expect(
      jobCreateSchema.safeParse({
        title: "Need plumbing help today",
        description: "The kitchen sink drain has been leaking for days.",
        categoryId: "00000000-0000-0000-0000-000000000000",
        addressId: "00000000-0000-0000-0000-000000000001",
      }).success,
    ).toBe(true);
  });
  it("rejects short title", () => {
    expect(
      jobCreateSchema.safeParse({ ...validCreate, title: "Hi" }).success,
    ).toBe(false);
  });
  it("rejects title over 120 chars", () => {
    expect(
      jobCreateSchema.safeParse({ ...validCreate, title: "a".repeat(121) })
        .success,
    ).toBe(false);
  });
  it("rejects short description", () => {
    expect(
      jobCreateSchema.safeParse({ ...validCreate, description: "short" })
        .success,
    ).toBe(false);
  });
  it("rejects budgetMin > budgetMax", () => {
    expect(
      jobCreateSchema.safeParse({
        ...validCreate,
        budgetMin: 200,
        budgetMax: 100,
      }).success,
    ).toBe(false);
  });
  it("accepts budgetMin == budgetMax", () => {
    expect(
      jobCreateSchema.safeParse({
        ...validCreate,
        budgetMin: 100,
        budgetMax: 100,
      }).success,
    ).toBe(true);
  });
  it("accepts null budgetMin and budgetMax", () => {
    expect(
      jobCreateSchema.safeParse({
        ...validCreate,
        budgetMin: null,
        budgetMax: null,
      }).success,
    ).toBe(true);
  });
  it("rejects negative budget", () => {
    expect(
      jobCreateSchema.safeParse({ ...validCreate, budgetMin: -1 }).success,
    ).toBe(false);
  });
  it("rejects non-uuid categoryId", () => {
    expect(
      jobCreateSchema.safeParse({ ...validCreate, categoryId: "abc" }).success,
    ).toBe(false);
  });
  it("rejects non-uuid addressId", () => {
    expect(
      jobCreateSchema.safeParse({ ...validCreate, addressId: "abc" }).success,
    ).toBe(false);
  });
  it("normalizes currency to uppercase", () => {
    const r = jobCreateSchema.safeParse({ ...validCreate, currency: "usd" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.currency).toBe("USD");
  });
  it("rejects currency with wrong length", () => {
    expect(
      jobCreateSchema.safeParse({ ...validCreate, currency: "DOLLAR" }).success,
    ).toBe(false);
  });
  it("rejects past scheduledFor", () => {
    expect(
      jobCreateSchema.safeParse({
        ...validCreate,
        scheduledFor: "2000-01-01T00:00:00.000Z",
      }).success,
    ).toBe(false);
  });
  it("accepts future scheduledFor", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(
      jobCreateSchema.safeParse({
        ...validCreate,
        scheduledFor: future,
      }).success,
    ).toBe(true);
  });
  it("rejects unknown fields (strict)", () => {
    expect(
      jobCreateSchema.safeParse({ ...validCreate, foo: "bar" }).success,
    ).toBe(false);
  });
});

describe("jobUpdateSchema", () => {
  it("accepts a partial update", () => {
    expect(
      jobUpdateSchema.safeParse({ title: "Updated title here" }).success,
    ).toBe(true);
  });
  it("rejects empty payload", () => {
    expect(jobUpdateSchema.safeParse({}).success).toBe(false);
  });
  it("rejects status other than DRAFT / OPEN", () => {
    expect(jobUpdateSchema.safeParse({ status: "COMPLETED" }).success).toBe(
      false,
    );
  });
  it("accepts status: DRAFT", () => {
    expect(jobUpdateSchema.safeParse({ status: "DRAFT" }).success).toBe(true);
  });
  it("accepts status: OPEN", () => {
    expect(jobUpdateSchema.safeParse({ status: "OPEN" }).success).toBe(true);
  });
  it("rejects budgetMin > budgetMax", () => {
    expect(
      jobUpdateSchema.safeParse({ budgetMin: 200, budgetMax: 100 }).success,
    ).toBe(false);
  });
});

describe("jobCancelSchema", () => {
  it("accepts empty input", () => {
    expect(jobCancelSchema.safeParse(undefined).success).toBe(true);
  });
  it("accepts a reason", () => {
    expect(
      jobCancelSchema.safeParse({ reason: "Found another worker" }).success,
    ).toBe(true);
  });
  it("rejects reason over 280 chars", () => {
    expect(jobCancelSchema.safeParse({ reason: "x".repeat(281) }).success).toBe(
      false,
    );
  });
  it("rejects unknown fields", () => {
    expect(
      jobCancelSchema.safeParse({ reason: "ok", foo: "bar" }).success,
    ).toBe(false);
  });
});

describe("jobAttachmentCreateSchema", () => {
  it("accepts a URL + caption", () => {
    expect(
      jobAttachmentCreateSchema.safeParse({
        url: "https://example.com/photo.jpg",
        caption: "leak",
      }).success,
    ).toBe(true);
  });
  it("rejects non-URL", () => {
    expect(
      jobAttachmentCreateSchema.safeParse({ url: "not-a-url" }).success,
    ).toBe(false);
  });
  it("rejects caption over 280", () => {
    expect(
      jobAttachmentCreateSchema.safeParse({
        url: "https://example.com/x.jpg",
        caption: "x".repeat(281),
      }).success,
    ).toBe(false);
  });
});

describe("jobListQuerySchema", () => {
  it("accepts an empty query", () => {
    expect(jobListQuerySchema.safeParse({}).success).toBe(true);
  });
  it("accepts a status filter", () => {
    expect(jobListQuerySchema.safeParse({ status: "OPEN" }).success).toBe(true);
  });
  it("coerces page/pageSize", () => {
    const r = jobListQuerySchema.safeParse({ page: "2", pageSize: "50" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.pageSize).toBe(50);
    }
  });
});

describe("state machine constants", () => {
  it("owner-editable statuses are DRAFT and OPEN only", () => {
    expect(new Set(JOB_OWNER_EDITABLE_STATUSES)).toEqual(
      new Set(["DRAFT", "OPEN"]),
    );
  });
  it("cancellable statuses include DRAFT/OPEN/ASSIGNED/IN_PROGRESS", () => {
    expect(JOB_CANCELLABLE_STATUSES).toContain("DRAFT");
    expect(JOB_CANCELLABLE_STATUSES).toContain("OPEN");
    expect(JOB_CANCELLABLE_STATUSES).toContain("ASSIGNED");
    expect(JOB_CANCELLABLE_STATUSES).toContain("IN_PROGRESS");
    expect(JOB_CANCELLABLE_STATUSES).not.toContain("COMPLETED");
    expect(JOB_CANCELLABLE_STATUSES).not.toContain("CANCELLED");
  });
});
