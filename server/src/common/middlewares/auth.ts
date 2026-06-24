import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type AccessTokenPayload } from "../utils/jwt.js";
import { UnauthenticatedError, ForbiddenError } from "../errors/AppError.js";

export interface AuthedRequest extends Request {
  user?: AccessTokenPayload;
}

export function requireAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return next(new UnauthenticatedError("Missing bearer token"));
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    next(new UnauthenticatedError("Invalid or expired token"));
  }
}

export function requireRole(...roles: Array<"CUSTOMER" | "WORKER" | "ADMIN">) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new UnauthenticatedError());
    if (!roles.includes(req.user.role))
      return next(new ForbiddenError("Insufficient role"));
    next();
  };
}
