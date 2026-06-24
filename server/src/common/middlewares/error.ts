import type {
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import { ZodError } from "zod";
import { AppError, ValidationError } from "../errors/AppError.js";
import { logger } from "../../infra/logger/logger.js";

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  _next: NextFunction,
) => {
  // Coerce Zod errors thrown outside validate() into ValidationError.
  if (err instanceof ZodError) {
    err = new ValidationError(
      "Invalid input",
      err.issues.map((i) => ({ path: i.path.join("."), issue: i.message })),
    );
  }

  if (err instanceof AppError) {
    if (err.status >= 500) {
      logger.error({ err, reqId: req.id }, "app error");
    } else {
      logger.warn({ err, reqId: req.id }, "app error");
    }
    res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.expose ? err.message : "Internal error",
        details: err.details,
      },
    });
    return;
  }

  logger.error({ err, reqId: req.id }, "unhandled error");
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL", message: "Internal server error" },
  });
};
