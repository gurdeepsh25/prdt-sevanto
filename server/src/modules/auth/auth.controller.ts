import type { Request, Response, NextFunction } from "express";
import * as service from "./auth.service.js";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "./auth.validators.js";
import type { AuthedRequest } from "../../common/middlewares/auth.js";

const meta = (req: Request) => ({
  userAgent: req.header("user-agent") ?? undefined,
  ip: req.ip ?? undefined,
});

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const input = signupSchema.parse(req.body);
    const result = await service.signup(input, meta(req));
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await service.login(input, meta(req));
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) {
      res
        .status(400)
        .json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "refreshToken required" },
        });
      return;
    }
    const result = await service.refresh({ refreshToken }, meta(req));
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body ?? {};
    if (refreshToken) await service.logout({ refreshToken });
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
}

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token } = verifyEmailSchema.parse(req.query);
    const result = await service.verifyEmail({ token });
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function resendVerification(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email } = resendVerificationSchema.parse(req.body);
    await service.resendVerification(email);
    // Always 200 to prevent enumeration
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await service.forgotPassword(email);
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = resetPasswordSchema.parse(req.body);
    await service.resetPassword(input);
    res.json({ success: true, data: { ok: true } });
  } catch (e) {
    next(e);
  }
}

export async function me(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({
          success: false,
          error: { code: "UNAUTHENTICATED", message: "Auth required" },
        });
      return;
    }
    const user = await (
      await import("../../infra/prisma/client.js")
    ).prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) {
      res
        .status(404)
        .json({
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        });
      return;
    }
    res.json({ success: true, data: { user: service.publicUser(user) } });
  } catch (e) {
    next(e);
  }
}
