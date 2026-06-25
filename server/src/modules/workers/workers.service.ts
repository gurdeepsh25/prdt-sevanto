import type { Prisma, WorkerProfile, Skill, SkillLevel } from "@prisma/client";
import { prisma } from "../../infra/prisma/client.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  BusinessRuleError,
} from "../../common/errors/AppError.js";
import type {
  WorkerProfileInput,
  WorkerProfileUpdateInput,
  UpsertSkillsInput,
  PortfolioCreateInput,
  WorkerListQuery,
  AdminVerifyWorkerInput,
} from "./workers.validators.js";

const MAX_PORTFOLIO_ITEMS = 12;

// =====================================================
// Helpers
// =====================================================
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Computes a profile completeness percentage.
 * Used to show a "fill out your profile" meter in the UI.
 */
export function computeCompleteness(p: {
  headline: string;
  bio: string;
  yearsExperience: number;
  hourlyRate: number | null;
  city: string;
  skillsCount: number;
  portfolioCount: number;
}): number {
  const checks = [
    !!p.headline && p.headline.length >= 5,
    !!p.bio && p.bio.length >= 50,
    p.hourlyRate !== null && p.hourlyRate > 0,
    !!p.city,
    p.skillsCount >= 1,
    p.portfolioCount >= 1,
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

// =====================================================
// Public list / detail
// =====================================================
export interface PublicWorkerList {
  items: PublicWorkerCard[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PublicWorkerCard {
  id: string;
  userId: string;
  fullName: string;
  headline: string;
  city: string;
  avgRating: number;
  totalReviews: number;
  totalJobsCompleted: number;
  isVerified: boolean;
  hourlyRate: number | null;
  yearsExperience: number;
  skills: { name: string; level: SkillLevel }[];
}

export interface PublicWorkerDetail extends PublicWorkerCard {
  bio: string;
  serviceRadiusKm: number;
  portfolio: { id: string; imageUrl: string; caption: string | null }[];
}

export interface SkillCatalogItem {
  id: string;
  name: string;
  slug: string;
}

export async function listSkillCatalog(): Promise<SkillCatalogItem[]> {
  const rows = await prisma.skill.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return rows;
}

export async function listPublicWorkers(
  query: WorkerListQuery,
): Promise<PublicWorkerList> {
  const where: Prisma.WorkerProfileWhereInput = {};
  if (query.city) where.city = { equals: query.city, mode: "insensitive" };
  if (query.verifiedOnly) where.isVerified = true;
  if (query.minRating !== undefined) where.avgRating = { gte: query.minRating };
  if (query.skill) {
    where.skills = {
      some: { skill: { slug: slugify(query.skill) } },
    };
  }

  const [field, direction] = query.sort.split(":") as [string, "asc" | "desc"];

  const [total, profiles] = await Promise.all([
    prisma.workerProfile.count({ where }),
    prisma.workerProfile.findMany({
      where,
      orderBy: { [field]: direction },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        user: { select: { fullName: true } },
        skills: { include: { skill: { select: { name: true } } } },
      },
    }),
  ]);

  const items: PublicWorkerCard[] = profiles.map((p) => ({
    id: p.id,
    userId: p.userId,
    fullName: p.user.fullName,
    headline: p.headline,
    city: p.city,
    avgRating: p.avgRating,
    totalReviews: p.totalReviews,
    totalJobsCompleted: p.totalJobsCompleted,
    isVerified: p.isVerified,
    hourlyRate: p.hourlyRate,
    yearsExperience: p.yearsExperience,
    skills: p.skills.map((ws) => ({ name: ws.skill.name, level: ws.level })),
  }));

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getPublicWorker(id: string): Promise<PublicWorkerDetail> {
  const p = await prisma.workerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { fullName: true } },
      skills: { include: { skill: { select: { name: true } } } },
      portfolio: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!p) throw new NotFoundError("Worker not found");
  return {
    id: p.id,
    userId: p.userId,
    fullName: p.user.fullName,
    headline: p.headline,
    bio: p.bio,
    city: p.city,
    avgRating: p.avgRating,
    totalReviews: p.totalReviews,
    totalJobsCompleted: p.totalJobsCompleted,
    isVerified: p.isVerified,
    hourlyRate: p.hourlyRate,
    yearsExperience: p.yearsExperience,
    serviceRadiusKm: p.serviceRadiusKm,
    skills: p.skills.map((ws) => ({ name: ws.skill.name, level: ws.level })),
    portfolio: p.portfolio.map((pi) => ({
      id: pi.id,
      imageUrl: pi.imageUrl,
      caption: pi.caption,
    })),
  };
}

// =====================================================
// Own profile (WORKER)
// =====================================================
export interface WorkerProfileWithMeta {
  profile: WorkerProfile;
  completeness: number;
  skills: { id: string; name: string; level: SkillLevel }[];
  portfolio: {
    id: string;
    imageUrl: string;
    caption: string | null;
    sortOrder: number;
  }[];
}

export async function getMyWorkerProfile(
  userId: string,
): Promise<WorkerProfileWithMeta> {
  const profile = await prisma.workerProfile.findUnique({
    where: { userId },
    include: {
      skills: { include: { skill: true } },
      portfolio: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!profile) throw new NotFoundError("Worker profile not yet created");
  return {
    profile,
    completeness: computeCompleteness({
      headline: profile.headline,
      bio: profile.bio,
      yearsExperience: profile.yearsExperience,
      hourlyRate: profile.hourlyRate,
      city: profile.city,
      skillsCount: profile.skills.length,
      portfolioCount: profile.portfolio.length,
    }),
    skills: profile.skills.map((ws) => ({
      id: ws.skill.id,
      name: ws.skill.name,
      level: ws.level,
    })),
    portfolio: profile.portfolio.map((pi) => ({
      id: pi.id,
      imageUrl: pi.imageUrl,
      caption: pi.caption,
      sortOrder: pi.sortOrder,
    })),
  };
}

export async function upsertMyWorkerProfile(
  userId: string,
  input: WorkerProfileInput,
): Promise<WorkerProfileWithMeta> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) throw new UnauthenticatedError();
  if (user.role !== "WORKER")
    throw new ForbiddenError("Only workers can have worker profiles");

  const profile = await prisma.workerProfile.upsert({
    where: { userId },
    update: input,
    create: { userId, ...input },
  });

  return getMyWorkerProfile(userId).then(async (meta) => {
    // Ensure we return the fresh profile (in case upsert returned stale cached values)
    void profile;
    return meta;
  });
}

export async function patchMyWorkerProfile(
  userId: string,
  input: WorkerProfileUpdateInput,
): Promise<WorkerProfileWithMeta> {
  const existing = await prisma.workerProfile.findUnique({ where: { userId } });
  if (!existing)
    throw new NotFoundError(
      "Worker profile not yet created — use PUT to create",
    );
  await prisma.workerProfile.update({ where: { userId }, data: input });
  return getMyWorkerProfile(userId);
}

// =====================================================
// Skills
// =====================================================
export async function upsertMySkills(
  userId: string,
  input: UpsertSkillsInput,
): Promise<{ count: number }> {
  const profile = await prisma.workerProfile.findUnique({ where: { userId } });
  if (!profile) throw new NotFoundError("Worker profile not yet created");

  // Validate skill IDs exist and are active.
  const skillIds = Array.from(new Set(input.skills.map((s) => s.skillId)));
  if (skillIds.length > 0) {
    const existing = await prisma.skill.findMany({
      where: { id: { in: skillIds }, isActive: true },
      select: { id: true },
    });
    const valid = new Set(existing.map((s) => s.id));
    const bad = skillIds.filter((id) => !valid.has(id));
    if (bad.length > 0)
      throw new NotFoundError(`Unknown or inactive skills: ${bad.join(", ")}`);
  }

  // Replace atomically: delete existing, then bulk insert new.
  await prisma.$transaction([
    prisma.workerSkill.deleteMany({ where: { workerProfileId: profile.id } }),
    ...(input.skills.length > 0
      ? [
          prisma.workerSkill.createMany({
            data: input.skills.map((s) => ({
              workerProfileId: profile.id,
              skillId: s.skillId,
              level: s.level,
            })),
          }),
        ]
      : []),
  ]);

  return { count: input.skills.length };
}

// =====================================================
// Portfolio
// =====================================================
export async function listMyPortfolio(userId: string) {
  const profile = await prisma.workerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new NotFoundError("Worker profile not yet created");
  return prisma.portfolioItem.findMany({
    where: { workerProfileId: profile.id },
    orderBy: { sortOrder: "asc" },
  });
}

export async function addPortfolioItem(
  userId: string,
  input: PortfolioCreateInput,
) {
  const profile = await prisma.workerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new NotFoundError("Worker profile not yet created");

  const count = await prisma.portfolioItem.count({
    where: { workerProfileId: profile.id },
  });
  if (count >= MAX_PORTFOLIO_ITEMS) {
    throw new BusinessRuleError(
      `Portfolio limit reached (max ${MAX_PORTFOLIO_ITEMS} items)`,
    );
  }

  return prisma.portfolioItem.create({
    data: {
      workerProfileId: profile.id,
      imageUrl: input.imageUrl,
      caption: input.caption ?? null,
      sortOrder: input.sortOrder,
    },
  });
}

export async function deletePortfolioItem(userId: string, itemId: string) {
  const profile = await prisma.workerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new NotFoundError("Worker profile not yet created");
  const item = await prisma.portfolioItem.findUnique({ where: { id: itemId } });
  if (!item || item.workerProfileId !== profile.id)
    throw new NotFoundError("Portfolio item not found");
  await prisma.portfolioItem.delete({ where: { id: itemId } });
}

// =====================================================
// Admin
// =====================================================
export interface PendingWorker {
  profileId: string;
  userId: string;
  fullName: string;
  email: string;
  headline: string;
  city: string;
  createdAt: Date;
  skillsCount: number;
  portfolioCount: number;
  completeness: number;
}

export async function listPendingWorkers(): Promise<PendingWorker[]> {
  // Pending = unverified profiles whose underlying user is active.
  const profiles = await prisma.workerProfile.findMany({
    where: { isVerified: false, user: { isActive: true, deletedAt: null } },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          isActive: true,
          deletedAt: true,
        },
      },
      skills: { select: { id: true } },
      portfolio: { select: { id: true } },
    },
  });

  return profiles.map((p) => ({
    profileId: p.id,
    userId: p.userId,
    fullName: p.user.fullName,
    email: p.user.email,
    headline: p.headline,
    city: p.city,
    createdAt: p.createdAt,
    skillsCount: p.skills.length,
    portfolioCount: p.portfolio.length,
    completeness: computeCompleteness({
      headline: p.headline,
      bio: p.bio,
      yearsExperience: p.yearsExperience,
      hourlyRate: p.hourlyRate,
      city: p.city,
      skillsCount: p.skills.length,
      portfolioCount: p.portfolio.length,
    }),
  }));
}

export async function verifyWorker(
  adminId: string,
  workerProfileId: string,
  input: AdminVerifyWorkerInput,
): Promise<WorkerProfile> {
  const profile = await prisma.workerProfile.findUnique({
    where: { id: workerProfileId },
  });
  if (!profile) throw new NotFoundError("Worker profile not found");

  const updated = await prisma.workerProfile.update({
    where: { id: workerProfileId },
    data: {
      isVerified: input.isVerified,
      verifiedAt: input.isVerified ? new Date() : null,
    },
  });

  // Audit log entry (Phase 13/14 will add dedicated `audit_logs` table).
  loggerAudit(adminId, "worker.verify", "WorkerProfile", workerProfileId, {
    isVerified: input.isVerified,
    reason: input.reason,
  });

  return updated;
}

function loggerAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown>,
): void {
  // Lightweight in-memory audit hook. Phase 14 will replace with DB table writes.
  // Using logger (imported lazily to avoid circular deps).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { logger } = require("../../infra/logger/logger.js");
  logger.info({ actorId, action, entityType, entityId, metadata }, "audit");
}

// =====================================================
// Re-exports for completeness
// =====================================================
export const _internal = { MAX_PORTFOLIO_ITEMS };
