import { Router } from "express";
import * as controller from "./categories.controller.js";
import { validate } from "../../common/middlewares/validate.js";
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
import { requireAuth, requireRole } from "../../common/middlewares/auth.js";

// =====================================================
// Public — /api/v1/categories
// =====================================================
const publicRouter = Router();

publicRouter.get("/", controller.listCategories);
publicRouter.get(
  "/:slug",
  validate({ params: categorySlugParamSchema }),
  controller.getCategoryBySlug,
);
publicRouter.get(
  "/:slug/subcategories",
  validate({ params: categorySlugParamSchema }),
  controller.listSubcategoriesByCategory,
);

// =====================================================
// Public — /api/v1/skills (Phase 4: extended query)
// =====================================================
const skillsPublicRouter = Router();
skillsPublicRouter.get(
  "/",
  validate({ query: publicSkillsQuerySchema }),
  controller.listSkills,
);

// =====================================================
// Admin — /api/v1/admin/categories + subcategories
// =====================================================
const adminCategoriesRouter = Router();

adminCategoriesRouter.get(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  controller.adminListCategories,
);
adminCategoriesRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validate({ body: categoryCreateSchema }),
  controller.adminCreateCategory,
);
adminCategoriesRouter.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: idParamSchema, body: categoryUpdateSchema }),
  controller.adminUpdateCategory,
);
adminCategoriesRouter.post(
  "/:id/subcategories",
  requireAuth,
  requireRole("ADMIN"),
  validate({
    params: idParamSchema,
    body: subcategoryCreateSchema,
  }),
  controller.adminAddSubcategory,
);

// =====================================================
// Admin — /api/v1/admin/subcategories
// =====================================================
const adminSubcategoriesRouter = Router();
adminSubcategoriesRouter.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: idParamSchema, body: subcategoryUpdateSchema }),
  controller.adminUpdateSubcategory,
);

// =====================================================
// Admin — /api/v1/admin/skills
// =====================================================
const adminSkillsRouter = Router();
adminSkillsRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validate({ body: skillCreateSchema }),
  controller.adminCreateSkill,
);
adminSkillsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: idParamSchema, body: skillUpdateSchema }),
  controller.adminUpdateSkill,
);

export {
  publicRouter as categoriesPublicRouter,
  skillsPublicRouter,
  adminCategoriesRouter,
  adminSubcategoriesRouter,
  adminSkillsRouter,
};
