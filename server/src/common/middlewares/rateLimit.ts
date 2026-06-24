import rateLimit from "express-rate-limit";
import { RateLimitedError } from "../errors/AppError.js";

/**
 * Standard rate limiter middleware using the in-memory store.
 * For production with multiple instances, swap to `rate-limit-redis`.
 */
export function rateLimiter(opts: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  return rateLimit({
    windowMs: opts.windowMs,
    max: opts.max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, _res, next) =>
      next(new RateLimitedError(opts.message ?? "Too many requests")),
  });
}

/** Pre-configured limiters for the auth surface. */
export const authRateLimiter = rateLimiter({
  windowMs: 60_000,
  max: 5,
  message: "Too many auth attempts",
});
export const forgotPasswordLimiter = rateLimiter({
  windowMs: 60 * 60_000,
  max: 3,
  message: "Too many reset requests",
});
