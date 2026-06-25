import { z } from "zod";

// =====================================================
// Enums (mirror Prisma enums)
// =====================================================
export const jobStatusSchema = z.enum([
  "DRAFT",
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
]);

export const jobUrgencySchema = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);

// =====================================================
// Create
// =====================================================
export const jobCreateSchema = z
  .object({
    title: z.string().trim().min(5).max(120),
    description: z.string().trim().min(20).max(4000),
    categoryId: z.string().uuid(),
    subcategoryId: z.string().uuid().nullable().optional(),
    addressId: z.string().uuid(),
    budgetMin: z.coerce.number().int().nonnegative().nullable().optional(),
    budgetMax: z.coerce.number().int().nonnegative().nullable().optional(),
    currency: z
      .string()
      .trim()
      .length(3)
      .regex(/^[A-Z]{3}$/i, "currency must be a 3-letter ISO code")
      .transform((v) => v.toUpperCase())
      .optional()
      .default("INR"),
    urgency: jobUrgencySchema.optional().default("NORMAL"),
    scheduledFor: z
      .string()
      .datetime()
      .nullable()
      .optional()
      .refine(
        (v) => v === null || v === undefined || new Date(v) > new Date(),
        { message: "scheduledFor must be in the future" },
      ),
    status: jobStatusSchema.optional().default("OPEN"),
  })
  .strict()
  .refine(
    (d) =>
      d.budgetMin === null ||
      d.budgetMin === undefined ||
      d.budgetMax === null ||
      d.budgetMax === undefined ||
      d.budgetMin <= d.budgetMax,
    {
      message: "budgetMin must be ≤ budgetMax",
      path: ["budgetMin"],
    },
  );

// =====================================================
// Update (PATCH; only allowed in DRAFT / OPEN)
// =====================================================
export const jobUpdateSchema = z
  .object({
    title: z.string().trim().min(5).max(120).optional(),
    description: z.string().trim().min(20).max(4000).optional(),
    categoryId: z.string().uuid().optional(),
    subcategoryId: z.string().uuid().nullable().optional(),
    addressId: z.string().uuid().optional(),
    budgetMin: z.coerce.number().int().nonnegative().nullable().optional(),
    budgetMax: z.coerce.number().int().nonnegative().nullable().optional(),
    currency: z
      .string()
      .trim()
      .length(3)
      .transform((v) => v.toUpperCase())
      .optional(),
    urgency: jobUrgencySchema.optional(),
    scheduledFor: z
      .string()
      .datetime()
      .nullable()
      .optional()
      .refine(
        (v) => v === null || v === undefined || new Date(v) > new Date(),
        { message: "scheduledFor must be in the future" },
      ),
    status: z.enum(["DRAFT", "OPEN"]).optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  })
  .refine(
    (d) =>
      d.budgetMin === undefined ||
      d.budgetMax === undefined ||
      d.budgetMin === null ||
      d.budgetMax === null ||
      d.budgetMin <= d.budgetMax,
    {
      message: "budgetMin must be ≤ budgetMax",
      path: ["budgetMin"],
    },
  );

// =====================================================
// Cancel
// =====================================================
export const jobCancelSchema = z
  .object({
    reason: z.string().trim().min(1).max(280).optional(),
  })
  .strict()
  .optional()
  .default({});

// =====================================================
// Attachments
// =====================================================
export const jobAttachmentCreateSchema = z
  .object({
    url: z.string().trim().url().max(2048),
    caption: z.string().trim().max(280).nullable().optional(),
    sortOrder: z.coerce.number().int().min(0).max(1000).optional().default(0),
  })
  .strict();

// =====================================================
// Queries
// =====================================================
export const jobListQuerySchema = z.object({
  status: jobStatusSchema.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  sort: z
    .enum(["createdAt:desc", "createdAt:asc", "scheduledFor:asc"])
    .optional()
    .default("createdAt:desc"),
});

// =====================================================
// Public job feed (Phase 6 — Job Discovery)
// Anonymous, returns OPEN jobs by default with rich filters.
// =====================================================
export const publicJobsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .default(20),
    categoryId: z.string().uuid().optional(),
    subcategoryId: z.string().uuid().optional(),
    categorySlug: z.string().trim().min(1).max(80).optional(),
    city: z.string().trim().min(1).max(80).optional(),
    urgency: jobUrgencySchema.optional(),
    minBudget: z.coerce.number().int().nonnegative().optional(),
    maxBudget: z.coerce.number().int().nonnegative().optional(),
    scheduledAfter: z.string().datetime().optional(),
    search: z.string().trim().min(1).max(120).optional(),
    sort: z
      .enum([
        "createdAt:desc",
        "createdAt:asc",
        "scheduledFor:asc",
        "budgetMax:desc",
        "budgetMax:asc",
        "urgency:desc",
      ])
      .optional()
      .default("createdAt:desc"),
  })
  .refine(
    (d) =>
      d.minBudget === undefined ||
      d.maxBudget === undefined ||
      d.minBudget <= d.maxBudget,
    {
      message: "minBudget must be ≤ maxBudget",
      path: ["minBudget"],
    },
  );

export const idParamSchema = z.object({ id: z.string().uuid() });

// =====================================================
// State machine
// =====================================================
export const JOB_OWNER_EDITABLE_STATUSES = ["DRAFT", "OPEN"] as const;
export const JOB_VISIBLE_STATUSES_FOR_OWNER = [
  "DRAFT",
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
] as const;
export const JOB_CANCELLABLE_STATUSES = [
  "DRAFT",
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
] as const;

export type JobCreateInput = z.infer<typeof jobCreateSchema>;
export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;
export type JobCancelInput = z.infer<typeof jobCancelSchema>;
export type JobAttachmentCreateInput = z.infer<
  typeof jobAttachmentCreateSchema
>;
export type JobListQuery = z.infer<typeof jobListQuerySchema>;
export type PublicJobsQuery = z.infer<typeof publicJobsQuerySchema>;
