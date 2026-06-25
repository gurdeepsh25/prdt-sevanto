import { Router } from "express";
import * as controller from "./jobs.controller.js";
import { validate } from "../../common/middlewares/validate.js";
import {
  jobCreateSchema,
  jobUpdateSchema,
  jobCancelSchema,
  jobAttachmentCreateSchema,
  jobListQuerySchema,
  idParamSchema,
} from "./jobs.validators.js";
import { requireAuth, requireRole } from "../../common/middlewares/auth.js";
import { z } from "zod";

const attachmentIdParamSchema = z.object({ attachmentId: z.string().uuid() });

// =====================================================
// Customer — /api/v1/jobs
// =====================================================
const router = Router();

router.use(requireAuth, requireRole("CUSTOMER"));

router.post("/", validate({ body: jobCreateSchema }), controller.createJob);
router.get("/", validate({ query: jobListQuerySchema }), controller.listMyJobs);
router.get("/:id", validate({ params: idParamSchema }), controller.getMyJob);
router.patch(
  "/:id",
  validate({ params: idParamSchema, body: jobUpdateSchema }),
  controller.updateMyJob,
);
router.delete(
  "/:id",
  validate({ params: idParamSchema }),
  controller.deleteMyJob,
);
router.post(
  "/:id/cancel",
  validate({ params: idParamSchema, body: jobCancelSchema }),
  controller.cancelJob,
);
router.post(
  "/:id/attachments",
  validate({ params: idParamSchema, body: jobAttachmentCreateSchema }),
  controller.addAttachment,
);
router.delete(
  "/:id/attachments/:attachmentId",
  validate({
    params: idParamSchema.merge(attachmentIdParamSchema),
  }),
  controller.deleteAttachment,
);

// =====================================================
// Admin — /api/v1/admin/jobs (read-only in Phase 5)
// =====================================================
const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("ADMIN"));
adminRouter.get(
  "/",
  validate({ query: jobListQuerySchema }),
  controller.adminListJobs,
);

export { router as default, adminRouter };
