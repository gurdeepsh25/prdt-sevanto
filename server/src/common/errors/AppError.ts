/**
 * Typed application errors. Each carries an HTTP status and a stable error code
 * that maps to the API error envelope defined in docs/08-api-design.md.
 */

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "GONE"
  | "BUSINESS_RULE"
  | "RATE_LIMITED"
  | "INTERNAL";

export interface ErrorDetail {
  path?: string;
  issue: string;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly details?: ErrorDetail[];
  public readonly expose: boolean;

  constructor(
    status: number,
    code: ErrorCode,
    message: string,
    options: {
      details?: ErrorDetail[];
      expose?: boolean;
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = options.details;
    this.expose = options.expose ?? true;
    if (options.cause) this.cause = options.cause;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input", details?: ErrorDetail[]) {
    super(400, "VALIDATION_ERROR", message, { details });
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "UNAUTHENTICATED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(409, "CONFLICT", message);
  }
}

export class GoneError extends AppError {
  constructor(message = "Resource gone") {
    super(410, "GONE", message);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(422, "BUSINESS_RULE", message);
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Too many requests") {
    super(429, "RATE_LIMITED", message);
  }
}
