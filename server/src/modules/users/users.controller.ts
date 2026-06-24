import type { Request, Response, NextFunction } from "express";
import * as service from "./users.service.js";
import {
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
  addressUpdateSchema,
  adminUserListQuerySchema,
  adminUpdateUserSchema,
} from "./users.validators.js";
import type { AuthedRequest } from "../../common/middlewares/auth.js";

function userId(req: AuthedRequest): string {
  if (!req.user) throw new Error("requireAuth must run before this controller");
  return req.user.sub;
}

// =====================================================
// Me endpoints
// =====================================================
export async function getMe(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const me = await service.getMe(userId(req));
    res.json({ success: true, data: { user: me } });
  } catch (e) {
    next(e);
  }
}

export async function updateMe(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = updateProfileSchema.parse(req.body);
    const me = await service.updateMe(userId(req), input);
    res.json({ success: true, data: { user: me } });
  } catch (e) {
    next(e);
  }
}

export async function changePassword(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = changePasswordSchema.parse(req.body);
    await service.changePassword(userId(req), input);
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
}

export async function deleteMe(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const refreshToken = (req.body ?? {}).refreshToken as string | undefined;
    await service.softDeleteMe(userId(req), refreshToken);
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
}

export async function avatarUploadTicket(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const ticket = await service.issueAvatarUploadTicket(userId(req));
    res.json({ success: true, data: ticket });
  } catch (e) {
    next(e);
  }
}

// =====================================================
// Address endpoints
// =====================================================
export async function listAddresses(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const items = await service.listAddresses(userId(req));
    res.json({ success: true, data: { items } });
  } catch (e) {
    next(e);
  }
}

export async function createAddress(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = addressSchema.parse(req.body);
    const address = await service.createAddress(userId(req), input);
    res.status(201).json({ success: true, data: { address } });
  } catch (e) {
    next(e);
  }
}

export async function updateAddress(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = addressUpdateSchema.parse(req.body);
    const address = await service.updateAddress(
      userId(req),
      req.params.id,
      input,
    );
    res.json({ success: true, data: { address } });
  } catch (e) {
    next(e);
  }
}

export async function deleteAddress(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    await service.deleteAddress(userId(req), req.params.id);
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
}

// =====================================================
// Admin endpoints
// =====================================================
export async function adminListUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const q = adminUserListQuerySchema.parse(req.query);
    const result = await service.adminListUsers(q);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function adminGetUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await service.adminGetUser(req.params.id);
    res.json({ success: true, data: { user } });
  } catch (e) {
    next(e);
  }
}

export async function adminUpdateUser(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = adminUpdateUserSchema.parse(req.body);
    const user = await service.adminUpdateUser(
      userId(req),
      req.params.id,
      input,
    );
    res.json({ success: true, data: { user } });
  } catch (e) {
    next(e);
  }
}
