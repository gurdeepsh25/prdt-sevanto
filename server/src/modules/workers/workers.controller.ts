import type { Request, Response, NextFunction } from "express";
import * as service from "./workers.service.js";
import {
  workerProfileSchema,
  workerProfileUpdateSchema,
  upsertSkillsSchema,
  portfolioCreateSchema,
  workerListQuerySchema,
  adminVerifyWorkerSchema,
} from "./workers.validators.js";
import type { AuthedRequest } from "../../common/middlewares/auth.js";

function userId(req: AuthedRequest): string {
  if (!req.user) throw new Error("requireAuth must run before this controller");
  return req.user.sub;
}

// =====================================================
// Public
// =====================================================
export async function listWorkers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = workerListQuerySchema.parse(req.query);
    const result = await service.listPublicWorkers(q);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function getWorker(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const worker = await service.getPublicWorker(req.params.id);
    res.json({ success: true, data: { worker } });
  } catch (e) {
    next(e);
  }
}

export async function listSkills(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const items = await service.listSkillCatalog();
    res.json({ success: true, data: { items } });
  } catch (e) {
    next(e);
  }
}

// =====================================================
// My profile
// =====================================================
export async function getMyProfile(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getMyWorkerProfile(userId(req));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function upsertMyProfile(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = workerProfileSchema.parse(req.body);
    const data = await service.upsertMyWorkerProfile(userId(req), input);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function patchMyProfile(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = workerProfileUpdateSchema.parse(req.body);
    const data = await service.patchMyWorkerProfile(userId(req), input);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

// =====================================================
// Skills
// =====================================================
export async function upsertMySkills(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = upsertSkillsSchema.parse(req.body);
    const data = await service.upsertMySkills(userId(req), input);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

// =====================================================
// Portfolio
// =====================================================
export async function listMyPortfolio(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const items = await service.listMyPortfolio(userId(req));
    res.json({ success: true, data: { items } });
  } catch (e) {
    next(e);
  }
}

export async function addPortfolioItem(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = portfolioCreateSchema.parse(req.body);
    const item = await service.addPortfolioItem(userId(req), input);
    res.status(201).json({ success: true, data: { item } });
  } catch (e) {
    next(e);
  }
}

export async function deletePortfolioItem(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    await service.deletePortfolioItem(userId(req), req.params.id);
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
}

// =====================================================
// Admin
// =====================================================
export async function listPendingWorkers(
  _req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const items = await service.listPendingWorkers();
    res.json({ success: true, data: { items } });
  } catch (e) {
    next(e);
  }
}

export async function verifyWorker(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = adminVerifyWorkerSchema.parse(req.body);
    const profile = await service.verifyWorker(
      userId(req),
      req.params.id,
      input,
    );
    res.json({ success: true, data: { profile } });
  } catch (e) {
    next(e);
  }
}
