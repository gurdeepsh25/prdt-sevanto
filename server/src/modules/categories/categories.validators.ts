import { z } from "zod";

// =====================================================
// Public read schemas
// =====================================================
export const categorySlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
});

// =====================================================
// Admin create / update
// =====================================================
export const categoryCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(60),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9-]+$/, "slug must be kebab-case")
      .optional(),
    description: z.string().trim().max(500).nullable().optional(),
    iconKey: z.string().trim().max(40).nullable().optional(),
    sortOrder: z.coerce.number().int().min(0).max(10_000).optional().default(0),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const categoryUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    description: z.string().trim().max(500).nullable().optional(),
    iconKey: z.string().trim().max(40).nullable().optional(),
    sortOrder: z.coerce.number().int().min(0).max(10_000).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

// =====================================================
// Subcategories
// =====================================================
export const subcategoryCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(60),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9-]+$/, "slug must be kebab-case")
      .optional(),
    description: z.string().trim().max(500).nullable().optional(),
    sortOrder: z.coerce.number().int().min(0).max(10_000).optional().default(0),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const subcategoryUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    description: z.string().trim().max(500).nullable().optional(),
    sortOrder: z.coerce.number().int().min(0).max(10_000).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

// =====================================================
// Skills (admin)
// =====================================================
export const skillCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(60),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9-]+$/, "slug must be kebab-case")
      .optional(),
    subcategoryId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const skillUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    subcategoryId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

// =====================================================
// Common
// =====================================================
export const idParamSchema = z.object({ id: z.string().uuid() });

// =====================================================
// Public skills query (filter by category / subcategory)
// =====================================================
export const publicSkillsQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  subcategoryId: z.string().uuid().optional(),
  categorySlug: z.string().trim().min(1).max(80).optional(),
  includeInactive: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "true")
    .default(false),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type SubcategoryCreateInput = z.infer<typeof subcategoryCreateSchema>;
export type SubcategoryUpdateInput = z.infer<typeof subcategoryUpdateSchema>;
export type SkillCreateInput = z.infer<typeof skillCreateSchema>;
export type SkillUpdateInput = z.infer<typeof skillUpdateSchema>;
export type PublicSkillsQuery = z.infer<typeof publicSkillsQuerySchema>;