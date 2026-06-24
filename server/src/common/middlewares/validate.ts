import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ValidationError } from "../errors/AppError.js";

type Source = "body" | "query" | "params";

interface ValidationSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      for (const source of ["body", "query", "params"] as Source[]) {
        const s = schema[source];
        if (!s) continue;
        const parsed = s.parse(req[source]);
        // Replace with the parsed (and possibly transformed) value.
        // Using a typed cast because Express types don't expose assignment.
        (req as unknown as Record<Source, unknown>)[source] = parsed;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(
          new ValidationError(
            "Invalid input",
            err.issues.map((i) => ({
              path: i.path.join("."),
              issue: i.message,
            })),
          ),
        );
        return;
      }
      next(err);
    }
  };
}
