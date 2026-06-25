import type { Request, Response, NextFunction } from "express";
import * as service from "./categories.service.js";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  categorySlugParamSchema,
  subcategoryCreateSchema,
  subcategoryUpdateSchema,
  skillCreateSchema,
  skillUpdateSchema,
  idParamSchema,
  publicSkillsQuerySchema,
} from "./categories.validators.js";

// =====================================================
// Public — categories & subcategories
// =====================================================
export async function listCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const items = await service.listPublicCategories();
    res.json({ success: true, data: { items } });
  } catch (e) {
    next(e);
  }
}

export async function getCategoryBySlug(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { slug } = categorySlugParamSchema.parse(req.params);
    const category = await service.getPublicCategoryBySlug(slug);
    res.json({ success: true, data: { category } });
  } catch (e) {
    next(e);
  }
}

export async function listSubcategoriesByCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { slug } = categorySlugParamSchema.parse(req.params);
    const items = await service.listPublicSubcategoriesByCategorySlug(slug);
    res.json({ success: true, data: { items } });
  } catch (e) {
    next(e);
  }
}

// =====================================================
// Public — skills (extended in Phase 4)
// =====================================================
export async function listSkills(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = publicSkillsQuerySchema.parse(req.query);
    const items = await service.listPublicSkills(q);
    res.json({ success: true, data: { items } });
  } catch (e) {
    next(e);
  }
}

// =====================================================
// Admin — categories
// =====================================================
export async function adminListCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const items = await service.listAdminCategories();
    res.json({ success: true, data: { items } });
  } catch (e) {
    next(e);
  }
}

export async function adminCreateCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = categoryCreateSchema.parse(req.body);
    const category = await service.createCategory(input);
    res.status(201).json({ success: true, data: { category } });
  } catch (e) {
    next(e);
  }
}

export async function adminUpdateCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = categoryUpdateSchema.parse(req.body);
    const category = await service.updateCategory(id, input);
    res.json({ success: true, data: { category } });
  } catch (e) {
    next(e);
  }
}

// =====================================================
// Admin — subcategories
// =====================================================
export async function adminAddSubcategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = subcategoryCreateSchema.parse(req.body);
    const subcategory = await service.addSubcategoryToCategory(id, input);
    res.status(201).json({ success: true, data: { subcategory } });
  } catch (e) {
    next(e);
  }
}

export async function adminUpdateSubcategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = subcategoryUpdateSchema.parse(req.body);
    const subcategory = await service.updateSubcategory(id, input);
    res.json({ success: true, data: { subcategory } });
  } catch (e) {
    next(e);
  }
}

// =====================================================
// Admin — skills
// =====================================================
export async function adminCreateSkill(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = skillCreateSchema.parse(req.body);
    const skill = await service.createSkill(input);
    res.status(201).json({ success: true, data: { skill } });
  } catch (e) {
    next(e);
  }
}

export async function adminUpdateSkill(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = skillUpdateSchema.parse(req.body);
    const skill = await service.updateSkill(id, input);
    res.json({ success: true, data: { skill } });
  } catch (e) {
    next(e);
  }
}