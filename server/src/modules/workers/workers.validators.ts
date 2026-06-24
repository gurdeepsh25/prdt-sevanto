import { z } from 'zod';

// =====================================================
// Profile
// =====================================================
export const workerProfileSchema = z.object({
  headline: z.string().trim().min(5).max(100),
  bio: z.string().trim().min(10).max(2000),
  yearsExperience: z.coerce.number().int().min(0).max(70),
  hourlyRate: z.coerce.number().int().nonnegative().nullable().optional(),
  city: z.string().trim().min(1).max(80),
  serviceRadiusKm: z.coerce.number().int().min(1).max(100).default(10),
});

export const workerProfileUpdateSchema = workerProfileSchema
  .partial()
  .strict()
  .refine((d) => Object.keys(d).length > 0, { message: 'At least one field must be provided' });

// =====================================================
// Skills
// =====================================================
export const skillLevelSchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'EXPERT']);

export const workerSkillInputSchema = z.object({
  skillId: z.string().uuid(),
  level: skillLevelSchema.default('INTERMEDIATE'),
});

export const upsertSkillsSchema = z
  .object({
    skills: z.array(workerSkillInputSchema).min(0).max(30),
  })
  .strict();

// =====================================================
// Portfolio
// =====================================================
export const portfolioCreateSchema = z.object({
  imageUrl: z.string().trim().url().max(2048),
  caption: z.string().trim().max(280).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).max(1000).optional().default(0),
});

// =====================================================
// Public list query
// =====================================================
export const workerListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  city: z.string().trim().min(1).max(80).optional(),
  skill: z.string().trim().min(1).max(60).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  verifiedOnly: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => v === true || v === 'true')
    .default(false),
  sort: z
    .enum(['avgRating:desc', 'avgRating:asc', 'createdAt:desc', 'createdAt:asc', 'totalJobsCompleted:desc'])
    .optional()
    .default('avgRating:desc'),
});

// =====================================================
// Admin verify
// =====================================================
export const adminVerifyWorkerSchema = z.object({
  isVerified: z.boolean(),
  reason: z.string().trim().max(280).optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
export const portfolioIdParamSchema = z.object({ id: z.string().uuid() });

export type WorkerProfileInput = z.infer<typeof workerProfileSchema>;
export type WorkerProfileUpdateInput = z.infer<typeof workerProfileUpdateSchema>;
export type WorkerSkillInput = z.infer<typeof workerSkillInputSchema>;
export type UpsertSkillsInput = z.infer<typeof upsertSkillsSchema>;
export type PortfolioCreateInput = z.infer<typeof portfolioCreateSchema>;
export type WorkerListQuery = z.infer<typeof workerListQuerySchema>;
export type AdminVerifyWorkerInput = z.infer<typeof adminVerifyWorkerSchema>;
