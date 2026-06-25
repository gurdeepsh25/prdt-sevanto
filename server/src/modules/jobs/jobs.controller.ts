import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import * as service from "./jobs.service.js";
import {
  jobCreateSchema,
  jobUpdateSchema,
  jobCancelSchema,
  jobAttachmentCreateSchema,
  jobListQuerySchema,
  publicJobsQuerySchema,
  idParamSchema,
} from "./jobs.validators.js";
import type { AuthedRequest } from "../../common/middlewares/auth.js";

const attachmentIdParamSchema = z.object({ attachmentId: z.string().uuid() });

function userId(req: AuthedRequest): string {
  if (!req.user) throw new Error("requireAuth must run before this controller");
  return req.user.sub;
}

function userRole(req: AuthedRequest): "CUSTOMER" | "WORKER" | "ADMIN" {
  if (!req.user) throw new Error("requireAuth must run before this controller");
  return req.user.role;
}

// =====================================================
// Customer — CRUD
// =====================================================
export async function createJob(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = jobCreateSchema.parse(req.body);
    const job = await service.createJob(userId(req), input);
    res.status(201).json({ success: true, data: { job } });
  } catch (e) {
    next(e);
  }
}

export async function listMyJobs(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = jobListQuerySchema.parse(req.query);
    const result = await service.listMyJobs(userId(req), q);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function getMyJob(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const job = await service.getJobForCaller({
      jobId: id,
      callerId: userId(req),
      callerRole: userRole(req),
    });
    res.json({ success: true, data: { job } });
  } catch (e) {
    next(e);
  }
}

export async function updateMyJob(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = jobUpdateSchema.parse(req.body);
    const job = await service.updateJob(userId(req), id, input);
    res.json({ success: true, data: { job } });
  } catch (e) {
    next(e);
  }
}

export async function deleteMyJob(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await service.softDeleteJob(userId(req), id);
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
}

export async function cancelJob(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = jobCancelSchema.parse(req.body ?? {});
    const job = await service.cancelJob(userId(req), userRole(req), id, input);
    res.json({ success: true, data: { job } });
  } catch (e) {
    next(e);
  }
}

// =====================================================
// Attachments
// =====================================================
export async function addAttachment(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const input = jobAttachmentCreateSchema.parse(req.body);
    const out = await service.addJobAttachment(userId(req), id, input);
    res.status(201).json({ success: true, data: out });
  } catch (e) {
    next(e);
  }
}

export async function deleteAttachment(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id: jobId } = idParamSchema.parse(req.params);
    const { attachmentId } = attachmentIdParamSchema.parse(req.params);
    const out = await service.deleteJobAttachment(
      userId(req),
      jobId,
      attachmentId,
    );
    res.json({ success: true, data: out });
  } catch (e) {
    next(e);
  }
}

// =====================================================
// Admin — read-only list (no auth check at controller level,
// requireAuth + requireRole already applied at router)
// =====================================================
export async function adminListJobs(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = jobListQuerySchema.parse(req.query);
    const result = await service.adminListJobsDetailed(q);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

// =====================================================
// Public — /api/v1/jobs/public (Phase 6 — Job Discovery)
// Anonymous; authenticated users get extra visibility into their own jobs.
// =====================================================
export async function listPublicJobs(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = publicJobsQuerySchema.parse(req.query);
    const result = await service.listPublicJobs(q);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function getPublicJob(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    // Try to read optional auth (don't require it)
    const auth = (req as AuthedRequest).user;
    const job = await service.getPublicJob(
      id,
      auth?.sub ?? null,
      auth?.role ?? null,
    );
    res.json({ success: true, data: { job } });
  } catch (e) {
    next(e);
  }
}
