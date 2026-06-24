import { describe, it, expect } from "vitest";
import {
  ValidationError,
  UnauthenticatedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  GoneError,
  BusinessRuleError,
  RateLimitedError,
  AppError,
} from "../../src/common/errors/AppError.js";

describe("AppError subclasses", () => {
  it("each carries the expected status + code", () => {
    expect(new ValidationError().status).toBe(400);
    expect(new ValidationError().code).toBe("VALIDATION_ERROR");

    expect(new UnauthenticatedError().status).toBe(401);
    expect(new ForbiddenError().status).toBe(403);
    expect(new NotFoundError().status).toBe(404);
    expect(new ConflictError().status).toBe(409);
    expect(new GoneError().status).toBe(410);
    expect(new BusinessRuleError("x").status).toBe(422);
    expect(new RateLimitedError().status).toBe(429);
  });

  it("AppError can be constructed with details", () => {
    const e = new AppError(418, "INTERNAL", "I am a teapot", {
      details: [{ issue: "short" }],
    });
    expect(e.status).toBe(418);
    expect(e.details?.[0].issue).toBe("short");
  });
});
