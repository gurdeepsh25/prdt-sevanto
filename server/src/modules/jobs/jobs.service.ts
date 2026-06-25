import type { Prisma, Job, JobStatus, JobUrgency } from "@prisma/client";
import { prisma } from "../../infra/prisma/client.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  BusinessRuleError,
} from "../../common/errors/AppError.js";
import type {
  JobCreateInput,
  JobUpdateInput,
  JobCancelInput,
  JobAttachmentCreateInput,
  JobListQuery,
  PublicJobsQuery,
} from "./jobs.validators.js";
import {
  JOB_CANCELLABLE_STATUSES,
  JOB_OWNER_EDITABLE_STATUSES,
} from "./jobs.validators.js";

// Urgency priority for `sort=urgency:desc`
const URGENCY_ORDER: Record<JobUrgency, number> = {
  URGENT: 4,
  HIGH: 3,
  NORMAL: 2,
  LOW: 1,
};

// =====================================================
// Helpers
// =====================================================
async function ensureCategory(categoryId: string): Promise<string> {
  const c = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, isActive: true, name: true },
  });
  if (!c) throw new NotFoundError("Category not found");
  if (!c.isActive) throw new BusinessRuleError("Category is not active");
  return c.name;
}

async function ensureSubcategoryBelongsToCategory(
  subcategoryId: string,
  categoryId: string,
): Promise<void> {
  const sub = await prisma.subcategory.findUnique({
    where: { id: subcategoryId },
    select: { id: true, categoryId: true, isActive: true },
  });
  if (!sub) throw new NotFoundError("Subcategory not found");
  if (sub.categoryId !== categoryId)
    throw new BusinessRuleError("Subcategory does not belong to category");
  if (!sub.isActive) throw new BusinessRuleError("Subcategory is not active");
}

async function ensureAddressOwnership(
  userId: string,
  addressId: string,
): Promise<{ id: string; city: string }> {
  const addr = await prisma.userAddress.findUnique({
    where: { id: addressId },
    select: { id: true, userId: true, city: true },
  });
  if (!addr) throw new NotFoundError("Address not found");
  if (addr.userId !== userId)
    throw new ForbiddenError("You don't own this address");
  return { id: addr.id, city: addr.city };
}

async function loadJobOwned(id: string, customerId: string): Promise<Job> {
  const job = await prisma.job.findFirst({
    where: { id, customerId, deletedAt: null },
  });
  if (!job) throw new NotFoundError("Job not found");
  return job;
}

// =====================================================
// Shapes (returned to clients)
// =====================================================
export interface JobAttachmentDTO {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface JobSummary {
  id: string;
  customerId: string;
  title: string;
  status: JobStatus;
  urgency: JobUrgency;
  city: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string | null;
  subcategoryName: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  scheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
  attachmentCount: number;
}

export interface JobDetail extends JobSummary {
  description: string;
  addressId: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  attachments: JobAttachmentDTO[];
}

export interface JobListResult {
  items: JobSummary[];
  total: number;
  page: number;
  pageSize: number;
}

// =====================================================
// CRUD — create
// =====================================================
export async function createJob(
  customerId: string,
  input: JobCreateInput,
): Promise<JobDetail> {
  const catName = await ensureCategory(input.categoryId);
  if (input.subcategoryId) {
    await ensureSubcategoryBelongsToCategory(
      input.subcategoryId,
      input.categoryId,
    );
  }
  const addr = await ensureAddressOwnership(customerId, input.addressId);

  const job = await prisma.job.create({
    data: {
      customerId,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId ?? null,
      addressId: addr.id,
      title: input.title,
      description: input.description,
      budgetMin: input.budgetMin ?? null,
      budgetMax: input.budgetMax ?? null,
      currency: input.currency ?? "INR",
      urgency: (input.urgency ?? "NORMAL") as JobUrgency,
      scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
      city: addr.city,
      status: (input.status ?? "OPEN") as JobStatus,
    },
  });

  return loadJobDetail(job.id);
}

// =====================================================
// CRUD — list (caller-scoped)
// =====================================================
export async function listMyJobs(
  customerId: string,
  query: JobListQuery,
): Promise<JobListResult> {
  const where: Prisma.JobWhereInput = {
    customerId,
    deletedAt: null,
    ...(query.status ? { status: query.status } : {}),
  };

  const [field, direction] = query.sort.split(":") as [string, "asc" | "desc"];

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: { [field]: direction },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
        _count: { select: { attachments: true } },
      },
    }),
  ]);

  const items: JobSummary[] = jobs.map((j) => ({
    id: j.id,
    customerId: j.customerId,
    title: j.title,
    status: j.status,
    urgency: j.urgency,
    city: j.city,
    categoryId: j.categoryId,
    categoryName: j.category.name,
    subcategoryId: j.subcategoryId,
    subcategoryName: j.subcategory?.name ?? null,
    budgetMin: j.budgetMin,
    budgetMax: j.budgetMax,
    currency: j.currency,
    scheduledFor: j.scheduledFor ? j.scheduledFor.toISOString() : null,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
    attachmentCount: j._count.attachments,
  }));

  return { items, total, page: query.page, pageSize: query.pageSize };
}

// =====================================================
// CRUD — get one (owner / admin / future: assigned worker)
// =====================================================
export async function getJobForCaller(args: {
  jobId: string;
  callerId: string;
  callerRole: "CUSTOMER" | "WORKER" | "ADMIN";
}): Promise<JobDetail> {
  const job = await prisma.job.findUnique({
    where: { id: args.jobId },
    include: {
      category: { select: { name: true } },
      subcategory: { select: { name: true } },
      attachments: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!job || job.deletedAt) throw new NotFoundError("Job not found");

  if (args.callerRole === "ADMIN") return toDetail(job);
  if (job.customerId === args.callerId) return toDetail(job);
  throw new ForbiddenError("You don't have access to this job");
}

async function loadJobDetail(id: string): Promise<JobDetail> {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      subcategory: { select: { name: true } },
      attachments: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!job) throw new NotFoundError("Job not found");
  return toDetail(job);
}

function toDetail(
  job: Job & {
    category: { name: string };
    subcategory: { name: string } | null;
    attachments: {
      id: string;
      url: string;
      caption: string | null;
      sortOrder: number;
      createdAt: Date;
    }[];
  },
): JobDetail {
  return {
    id: job.id,
    customerId: job.customerId,
    title: job.title,
    description: job.description,
    status: job.status,
    urgency: job.urgency,
    city: job.city,
    categoryId: job.categoryId,
    categoryName: job.category.name,
    subcategoryId: job.subcategoryId,
    subcategoryName: job.subcategory?.name ?? null,
    addressId: job.addressId,
    budgetMin: job.budgetMin,
    budgetMax: job.budgetMax,
    currency: job.currency,
    scheduledFor: job.scheduledFor ? job.scheduledFor.toISOString() : null,
    cancelledAt: job.cancelledAt ? job.cancelledAt.toISOString() : null,
    cancelReason: job.cancelReason,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    attachmentCount: job.attachments.length,
    attachments: job.attachments.map((a) => ({
      id: a.id,
      url: a.url,
      caption: a.caption,
      sortOrder: a.sortOrder,
      createdAt: a.createdAt.toISOString(),
    })),
  };
}

// =====================================================
// CRUD — update
// =====================================================
export async function updateJob(
  customerId: string,
  jobId: string,
  input: JobUpdateInput,
): Promise<JobDetail> {
  const job = await loadJobOwned(jobId, customerId);
  if (!JOB_OWNER_EDITABLE_STATUSES.includes(job.status as "DRAFT" | "OPEN")) {
    throw new BusinessRuleError(`Job cannot be edited in status ${job.status}`);
  }

  if (input.categoryId) await ensureCategory(input.categoryId);
  if (input.subcategoryId) {
    const cid = input.categoryId ?? job.categoryId;
    await ensureSubcategoryBelongsToCategory(input.subcategoryId, cid);
  }
  if (input.addressId)
    await ensureAddressOwnership(customerId, input.addressId);

  await prisma.job.update({
    where: { id: jobId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.subcategoryId !== undefined && {
        subcategoryId: input.subcategoryId,
      }),
      ...(input.addressId !== undefined && { addressId: input.addressId }),
      ...(input.budgetMin !== undefined && { budgetMin: input.budgetMin }),
      ...(input.budgetMax !== undefined && { budgetMax: input.budgetMax }),
      ...(input.currency !== undefined && { currency: input.currency }),
      ...(input.urgency !== undefined && { urgency: input.urgency }),
      ...(input.scheduledFor !== undefined && {
        scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
      }),
      ...(input.status !== undefined && { status: input.status }),
    },
  });

  return loadJobDetail(jobId);
}

// =====================================================
// CRUD — soft delete (sets deletedAt; status must be editable)
// =====================================================
export async function softDeleteJob(
  customerId: string,
  jobId: string,
): Promise<void> {
  const job = await loadJobOwned(jobId, customerId);
  if (!JOB_OWNER_EDITABLE_STATUSES.includes(job.status as "DRAFT" | "OPEN")) {
    throw new BusinessRuleError(
      `Job cannot be deleted in status ${job.status}`,
    );
  }
  await prisma.job.update({
    where: { id: jobId },
    data: { deletedAt: new Date() },
  });
}

// =====================================================
// State transition — cancel
// =====================================================
export async function cancelJob(
  callerId: string,
  callerRole: "CUSTOMER" | "WORKER" | "ADMIN",
  jobId: string,
  input: JobCancelInput,
): Promise<JobDetail> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.deletedAt) throw new NotFoundError("Job not found");

  const allowed =
    callerRole === "ADMIN" ||
    job.customerId === callerId ||
    // Future: assigned worker can also cancel
    false;
  if (!allowed) throw new ForbiddenError("You can't cancel this job");

  if (
    !JOB_CANCELLABLE_STATUSES.includes(
      job.status as (typeof JOB_CANCELLABLE_STATUSES)[number],
    )
  ) {
    throw new BusinessRuleError(
      `Job cannot be cancelled in status ${job.status}`,
    );
  }

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancelReason: input.reason ?? null,
    },
  });

  return loadJobDetail(jobId);
}

// =====================================================
// Attachments
// =====================================================
export async function addJobAttachment(
  customerId: string,
  jobId: string,
  input: JobAttachmentCreateInput,
): Promise<{ attachment: JobAttachmentDTO }> {
  const job = await loadJobOwned(jobId, customerId);
  if (job.status !== "DRAFT" && job.status !== "OPEN") {
    throw new BusinessRuleError(
      `Cannot add attachments in status ${job.status}`,
    );
  }
  const a = await prisma.jobAttachment.create({
    data: {
      jobId,
      url: input.url,
      caption: input.caption ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  return {
    attachment: {
      id: a.id,
      url: a.url,
      caption: a.caption,
      sortOrder: a.sortOrder,
      createdAt: a.createdAt.toISOString(),
    },
  };
}

export async function deleteJobAttachment(
  customerId: string,
  jobId: string,
  attachmentId: string,
): Promise<{ ok: true }> {
  const job = await loadJobOwned(jobId, customerId);
  if (job.status !== "DRAFT" && job.status !== "OPEN") {
    throw new ConflictError(
      `Cannot remove attachments in status ${job.status}`,
    );
  }
  const a = await prisma.jobAttachment.findUnique({
    where: { id: attachmentId },
  });
  if (!a || a.jobId !== jobId) throw new NotFoundError("Attachment not found");
  await prisma.jobAttachment.delete({ where: { id: attachmentId } });
  return { ok: true };
}

// =====================================================
// Admin read
// =====================================================
export async function adminListJobs(
  query: JobListQuery,
): Promise<JobListResult> {
  const where: Prisma.JobWhereInput = {
    deletedAt: null,
    ...(query.status ? { status: query.status } : {}),
  };
  const [field, direction] = query.sort.split(":") as [string, "asc" | "desc"];

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: { [field]: direction },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
        customer: { select: { fullName: true, email: true } },
        _count: { select: { attachments: true } },
      },
    }),
  ]);

  const items: JobSummary[] = jobs.map((j) => ({
    id: j.id,
    customerId: j.customerId,
    title: j.title,
    status: j.status,
    urgency: j.urgency,
    city: j.city,
    categoryId: j.categoryId,
    categoryName: j.category.name,
    subcategoryId: j.subcategoryId,
    subcategoryName: j.subcategory?.name ?? null,
    budgetMin: j.budgetMin,
    budgetMax: j.budgetMax,
    currency: j.currency,
    scheduledFor: j.scheduledFor ? j.scheduledFor.toISOString() : null,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
    attachmentCount: j._count.attachments,
  }));
  return { items, total, page: query.page, pageSize: query.pageSize };
}

export interface AdminJobRow extends JobSummary {
  customerName: string;
  customerEmail: string;
}

export async function adminListJobsDetailed(query: JobListQuery): Promise<{
  items: AdminJobRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const result = await adminListJobs(query);
  // Fetch customer info in a single query
  const customerIds = Array.from(
    new Set(result.items.map((i) => i.customerId)),
  );
  const customers = await prisma.user.findMany({
    where: { id: { in: customerIds } },
    select: { id: true, fullName: true, email: true },
  });
  const cmap = new Map(customers.map((c) => [c.id, c]));
  const items: AdminJobRow[] = result.items.map((i) => {
    const c = cmap.get(i.customerId);
    return {
      ...i,
      customerName: c?.fullName ?? "—",
      customerEmail: c?.email ?? "—",
    };
  });
  return {
    items,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

// =====================================================
// Phase 6 — Public job discovery feed
// =====================================================
export interface PublicJobCard {
  id: string;
  title: string;
  status: JobStatus;
  urgency: JobUrgency;
  city: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string | null;
  subcategoryName: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  scheduledFor: string | null;
  createdAt: string;
  attachmentCount: number;
  applicantCount: number;
}

export interface PublicJobListResult {
  items: PublicJobCard[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listPublicJobs(
  query: PublicJobsQuery,
): Promise<PublicJobListResult> {
  const where: Prisma.JobWhereInput = {
    deletedAt: null,
    status: "OPEN",
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.subcategoryId ? { subcategoryId: query.subcategoryId } : {}),
    ...(query.urgency ? { urgency: query.urgency } : {}),
    ...(query.city
      ? { city: { equals: query.city, mode: "insensitive" } }
      : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" } },
            { description: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(query.minBudget !== undefined || query.maxBudget !== undefined
      ? {
          OR: [
            // Case A: job has budgetMax — overlap with [min, max]
            ...(query.minBudget !== undefined && query.maxBudget !== undefined
              ? [
                  {
                    AND: [
                      { budgetMax: { gte: query.minBudget } },
                      { budgetMin: { lte: query.maxBudget } },
                    ],
                  },
                ]
              : []),
            // Case B: only minBudget set — overlap if budgetMax >= min
            ...(query.minBudget !== undefined && query.maxBudget === undefined
              ? [{ budgetMax: { gte: query.minBudget } }]
              : []),
            // Case C: only maxBudget set — overlap if budgetMin <= max
            ...(query.minBudget === undefined && query.maxBudget !== undefined
              ? [{ budgetMin: { lte: query.maxBudget } }]
              : []),
          ],
        }
      : {}),
    ...(query.scheduledAfter
      ? { scheduledFor: { gte: new Date(query.scheduledAfter) } }
      : {}),
  };

  // If filtering by categorySlug, resolve it to an id first
  if (query.categorySlug && !query.categoryId) {
    const c = await prisma.category.findFirst({
      where: { slug: query.categorySlug, isActive: true },
      select: { id: true },
    });
    where.categoryId = c?.id ?? "__no_match__";
  }

  const [field, direction] = query.sort.split(":") as [string, "asc" | "desc"];

  // urgency sort can't be expressed as Prisma orderBy — we sort in memory.
  const isUrgencySort = field === "urgency";

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      // For non-urgency sorts use Prisma orderBy; urgency fallback to createdAt then re-sort
      orderBy: isUrgencySort ? { createdAt: "desc" } : { [field]: direction },
      skip: isUrgencySort ? 0 : (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
        _count: { select: { attachments: true } },
      },
    }),
  ]);

  let items: PublicJobCard[] = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    status: j.status,
    urgency: j.urgency,
    city: j.city,
    categoryId: j.categoryId,
    categoryName: j.category.name,
    subcategoryId: j.subcategoryId,
    subcategoryName: j.subcategory?.name ?? null,
    budgetMin: j.budgetMin,
    budgetMax: j.budgetMax,
    currency: j.currency,
    scheduledFor: j.scheduledFor ? j.scheduledFor.toISOString() : null,
    createdAt: j.createdAt.toISOString(),
    attachmentCount: j._count.attachments,
    applicantCount: 0, // populated in Phase 7 when applications model lands
  }));

  if (isUrgencySort) {
    items.sort((a, b) => {
      const da = URGENCY_ORDER[a.urgency];
      const db = URGENCY_ORDER[b.urgency];
      return direction === "desc" ? db - da : da - db;
    });
    const start = (query.page - 1) * query.pageSize;
    items = items.slice(start, start + query.pageSize);
  }

  return { items, total, page: query.page, pageSize: query.pageSize };
}

/**
 * Public job detail.
 * - Returns the job if it is OPEN (anyone can view)
 * - Returns the job to its owner / ADMIN regardless of status
 * - Assigned workers (future) would also see it — deferred to Phase 7+
 */
export async function getPublicJob(
  jobId: string,
  callerId: string | null,
  callerRole: "CUSTOMER" | "WORKER" | "ADMIN" | null,
): Promise<JobDetail> {
  // Load the job with the same include as `loadJobDetail` so the result is
  // shaped consistently for `toDetail`.
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      category: { select: { name: true } },
      subcategory: { select: { name: true } },
      attachments: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!job || job.deletedAt) throw new NotFoundError("Job not found");

  const isOwner = callerId !== null && job.customerId === callerId;
  const isAdmin = callerRole === "ADMIN";
  if (job.status !== "OPEN" && !isOwner && !isAdmin) {
    // Hide non-OPEN jobs from anonymous public callers and unrelated users.
    throw new NotFoundError("Job not found");
  }
  return toDetail(
    job as Job & {
      category: { name: string };
      subcategory: { name: string } | null;
      attachments: {
        id: string;
        url: string;
        caption: string | null;
        sortOrder: number;
        createdAt: Date;
      }[];
    },
  );
}
