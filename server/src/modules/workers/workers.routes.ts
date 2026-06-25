import { Router } from "express";
import * as controller from "./workers.controller.js";
import { validate } from "../../common/middlewares/validate.js";
import {
  workerProfileSchema,
  workerProfileUpdateSchema,
  upsertSkillsSchema,
  portfolioCreateSchema,
  workerListQuerySchema,
  adminVerifyWorkerSchema,
  idParamSchema,
  portfolioIdParamSchema,
} from "./workers.validators.js";
import { requireAuth, requireRole } from "../../common/middlewares/auth.js";
import * as categoriesController from "../categories/categories.controller.js";
import { publicSkillsQuerySchema } from "../categories/categories.validators.js";

const router = Router();

// Public
router.get(
  "/",
  validate({ query: workerListQuerySchema }),
  controller.listWorkers,
);
router.get("/:id", validate({ params: idParamSchema }), controller.getWorker);

// Worker self-service
router.get("/me", requireAuth, requireRole("WORKER"), controller.getMyProfile);
router.put(
  "/me",
  requireAuth,
  requireRole("WORKER"),
  validate({ body: workerProfileSchema }),
  controller.upsertMyProfile,
);
router.patch(
  "/me",
  requireAuth,
  requireRole("WORKER"),
  validate({ body: workerProfileUpdateSchema }),
  controller.patchMyProfile,
);

// Skills
router.put(
  "/me/skills",
  requireAuth,
  requireRole("WORKER"),
  validate({ body: upsertSkillsSchema }),
  controller.upsertMySkills,
);

// Portfolio
router.get(
  "/me/portfolio",
  requireAuth,
  requireRole("WORKER"),
  controller.listMyPortfolio,
);
router.post(
  "/me/portfolio",
  requireAuth,
  requireRole("WORKER"),
  validate({ body: portfolioCreateSchema }),
  controller.addPortfolioItem,
);
router.delete(
  "/me/portfolio/:id",
  requireAuth,
  requireRole("WORKER"),
  validate({ params: portfolioIdParamSchema }),
  controller.deletePortfolioItem,
);

// Admin (mounted separately at /api/v1/admin/workers)
const adminRouter = Router();
adminRouter.get(
  "/pending",
  requireAuth,
  requireRole("ADMIN"),
  controller.listPendingWorkers,
);
adminRouter.post(
  "/:id/verify",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: idParamSchema, body: adminVerifyWorkerSchema }),
  controller.verifyWorker,
);

// Skills catalog (mounted separately at /api/v1/skills)
const skillsRouter = Router();
skillsRouter.get(
  "/",
  validate({ query: publicSkillsQuerySchema }),
  categoriesController.listSkills,
);
// Backwards-compatible alias used by Phase 3 callers
skillsRouter.get(
  "/catalog",
  validate({ query: publicSkillsQuerySchema }),
  categoriesController.listSkills,
);

export { router as default, adminRouter, skillsRouter };
