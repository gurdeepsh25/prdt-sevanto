import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env.js";
import { logger } from "./infra/logger/logger.js";
import { errorHandler, notFoundHandler } from "./common/middlewares/error.js";
import { rateLimiter } from "./common/middlewares/rateLimit.js";
import authRouter from "./modules/auth/auth.routes.js";
import usersRouter from "./modules/users/users.routes.js";
import healthRouter from "./modules/health.routes.js";
import { buildOpenApiDocument } from "./openapi/registry.js";

export function createApp(): Express {
  const app = express();

  // Behind proxies (e.g., Nginx) we need this so req.ip is correct.
  app.set("trust proxy", 1);

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow same-origin / curl requests without an Origin header.
        if (!origin) return cb(null, true);
        if (env.corsOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) =>
        (req.headers["x-request-id"] as string) || cryptoRandomId(),
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
      serializers: {
        req(req) {
          return { id: req.id, method: req.method, url: req.url };
        },
        res(res) {
          return { statusCode: res.statusCode };
        },
      },
    }),
  );

  // Global rate limiter (cheap defense-in-depth)
  app.use(
    rateLimiter({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
    }),
  );

  // Health & docs (no version prefix)
  app.use("/", healthRouter);

  // OpenAPI + Swagger UI
  const openapi = buildOpenApiDocument();
  app.get("/openapi.json", (_req, res) => res.json(openapi));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  // Versioned API
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", usersRouter);

  // 404 + error handlers last
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

function cryptoRandomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
