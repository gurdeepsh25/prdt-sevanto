import type { Prisma } from "@prisma/client";
import { prisma } from "../../infra/prisma/client.js";
import {
  ConflictError,
  NotFoundError,
} from "../../common/errors/AppError.js";
import type {
  CategoryCreateInput,
  CategoryUpdateInput,
  SubcategoryCreateInput,
  SubcategoryUpdateInput,
  SkillCreateInput,
  SkillUpdateInput,
  PublicSkillsQuery,
} from "./categories.validators.js";

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

// =====================================================
// Shapes (returned to clients)
// =====================================================
export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
  iconKey: string | null;
  sortOrder: number;
}

export interface SubcategoryRef {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface CategoryWithSubs extends CategoryRef {
  description: string | null;
  isActive: boolean;
  subcategories: (SubcategoryRef & { isActive: boolean })[];
}

export interface PublicCategoryListItem extends CategoryRef {
  description: string | null;
  subcategoriesCount: number;
}

export interface SkillRef {
  id: string;
  name: string;
  slug: string;
  subcategoryId: string | null;
}

// =====================================================
// Categories — public
// =====================================================
export async function listPublicCategories(): Promise<
  PublicCategoryListItem[]
> {
  const rows = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          subcategories: { where: { isActive: true } },
        },
      },
    },
  });

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    iconKey: c.iconKey,
    sortOrder: c.sortOrder,
    description: c.description,
    subcategoriesCount: c._count.subcategories,
  }));
}

export async function getPublicCategoryBySlug(
  slug: string,
): Promise<CategoryWithSubs> {
  const c = await prisma.category.findFirst({
    where: { slug, isActive: true },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });
  if (!c) throw new NotFoundError("Category not found");
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    iconKey: c.iconKey,
    sortOrder: c.sortOrder,
    description: c.description,
    isActive: c.isActive,
    subcategories: c.subcategories.map((s) => ({
      id: s.id,
      categoryId: s.categoryId,
      name: s.name,
      slug: s.slug,
      description: s.description,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    })),
  };
}

export async function listPublicSubcategoriesByCategorySlug(
  slug: string,
): Promise<SubcategoryRef[]> {
  const c = await prisma.category.findFirst({
    where: { slug, isActive: true },
    select: { id: true },
  });
  if (!c) throw new NotFoundError("Category not found");
  const subs = await prisma.subcategory.findMany({
    where: { categoryId: c.id, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return subs.map((s) => ({
    id: s.id,
    categoryId: s.categoryId,
    name: s.name,
    slug: s.slug,
    sortOrder: s.sortOrder,
  }));
}

// =====================================================
// Categories — admin
// =====================================================
export async function listAdminCategories(): Promise<CategoryWithSubs[]> {
  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      subcategories: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    iconKey: c.iconKey,
    sortOrder: c.sortOrder,
    description: c.description,
    isActive: c.isActive,
    subcategories: c.subcategories.map((s) => ({
      id: s.id,
      categoryId: s.categoryId,
      name: s.name,
      slug: s.slug,
      description: s.description,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    })),
  }));
}

export async function createCategory(input: CategoryCreateInput): Promise<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconKey: string | null;
  sortOrder: number;
  isActive: boolean;
}> {
  const slug = input.slug ?? slugify(input.name);
  try {
    const c = await prisma.category.create({
      data: {
        name: input.name,
        slug,
        description: input.description ?? null,
        iconKey: input.iconKey ?? null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      iconKey: c.iconKey,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
    };
  } catch (e) {
    if ((e as Prisma.PrismaClientKnownRequestError).code === "P2002") {
      throw new ConflictError("A category with this name or slug already exists");
    }
    throw e;
  }
}

export async function updateCategory(
  id: string,
  input: CategoryUpdateInput,
): Promise<CategoryWithSubs> {
  const exists = await prisma.category.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Category not found");
  try {
    await prisma.category.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.iconKey !== undefined && { iconKey: input.iconKey }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
  } catch (e) {
    if ((e as Prisma.PrismaClientKnownRequestError).code === "P2002") {
      throw new ConflictError("Another category already uses that name");
    }
    throw e;
  }
  const fresh = await prisma.category.findUnique({
    where: { id },
    include: {
      subcategories: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });
  if (!fresh) throw new NotFoundError("Category not found");
  return {
    id: fresh.id,
    name: fresh.name,
    slug: fresh.slug,
    iconKey: fresh.iconKey,
    sortOrder: fresh.sortOrder,
    description: fresh.description,
    isActive: fresh.isActive,
    subcategories: fresh.subcategories.map((s) => ({
      id: s.id,
      categoryId: s.categoryId,
      name: s.name,
      slug: s.slug,
      description: s.description,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    })),
  };
}

// =====================================================
// Subcategories — admin
// =====================================================
export async function addSubcategoryToCategory(
  categoryId: string,
  input: SubcategoryCreateInput,
): Promise<SubcategoryRef> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new NotFoundError("Category not found");
  const slug = input.slug ?? slugify(input.name);
  try {
    const s = await prisma.subcategory.create({
      data: {
        categoryId,
        name: input.name,
        slug,
        description: input.description ?? null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });
    return {
      id: s.id,
      categoryId: s.categoryId,
      name: s.name,
      slug: s.slug,
      sortOrder: s.sortOrder,
    };
  } catch (e) {
    if ((e as Prisma.PrismaClientKnownRequestError).code === "P2002") {
      throw new ConflictError(
        "A subcategory with this name/slug already exists in the category",
      );
    }
    throw e;
  }
}

export async function updateSubcategory(
  id: string,
  input: SubcategoryUpdateInput,
): Promise<SubcategoryRef> {
  const exists = await prisma.subcategory.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Subcategory not found");
  const s = await prisma.subcategory.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
  return {
    id: s.id,
    categoryId: s.categoryId,
    name: s.name,
    slug: s.slug,
    sortOrder: s.sortOrder,
  };
}

// =====================================================
// Skills — public
// =====================================================
export async function listPublicSkills(
  query: PublicSkillsQuery,
): Promise<SkillRef[]> {
  const where: Prisma.SkillWhereInput = {};
  if (!query.includeInactive) where.isActive = true;
  if (query.subcategoryId) where.subcategoryId = query.subcategoryId;
  if (query.categoryId) where.subcategory = { categoryId: query.categoryId };
  if (query.categorySlug) {
    where.subcategory = {
      category: { slug: query.categorySlug },
    };
  }
  const rows = await prisma.skill.findMany({
    where,
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true, slug: true, subcategoryId: true },
  });
  return rows;
}

// =====================================================
// Skills — admin (extended CRUD for Phase 4)
// =====================================================
export async function createSkill(input: SkillCreateInput): Promise<SkillRef> {
  const slug = input.slug ?? slugify(input.name);
  if (input.subcategoryId) {
    const sub = await prisma.subcategory.findUnique({
      where: { id: input.subcategoryId },
    });
    if (!sub) throw new NotFoundError("Subcategory not found");
  }
  try {
    const s = await prisma.skill.create({
      data: {
        name: input.name,
        slug,
        subcategoryId: input.subcategoryId ?? null,
        isActive: input.isActive ?? true,
      },
    });
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      subcategoryId: s.subcategoryId,
    };
  } catch (e) {
    if ((e as Prisma.PrismaClientKnownRequestError).code === "P2002") {
      throw new ConflictError("A skill with this name or slug already exists");
    }
    throw e;
  }
}

export async function updateSkill(
  id: string,
  input: SkillUpdateInput,
): Promise<SkillRef> {
  const exists = await prisma.skill.findUnique({ where: { id } });
  if (!exists) throw new NotFoundError("Skill not found");
  if (input.subcategoryId) {
    const sub = await prisma.subcategory.findUnique({
      where: { id: input.subcategoryId },
    });
    if (!sub) throw new NotFoundError("Subcategory not found");
  }
  const s = await prisma.skill.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.subcategoryId !== undefined && {
        subcategoryId: input.subcategoryId,
      }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    subcategoryId: s.subcategoryId,
  };
}