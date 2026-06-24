import pino from "pino";
import { env } from "../../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: "sevanto-server" },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.refreshToken",
      "*.accessToken",
    ],
    censor: "[REDACTED]",
  },
  transport: env.isDev
    ? {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard" },
      }
    : undefined,
});

export type Logger = typeof logger;
