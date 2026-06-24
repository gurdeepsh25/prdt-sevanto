import "dotenv/config";
import { z } from "zod";

// Strongly-typed env validator. App refuses to start if anything required is missing.
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),

  MAIL_HOST: z.string().default("localhost"),
  MAIL_PORT: z.coerce.number().int().positive().default(1025),
  MAIL_USER: z.string().optional().default(""),
  MAIL_PASS: z.string().optional().default(""),
  MAIL_FROM: z.string().default("Sevanto <no-reply@sevanto.app>"),
  MAIL_SECURE: z
    .string()
    .optional()
    .transform((v) => v === "true"),

  APP_BASE_URL_CLIENT: z.string().url().default("http://localhost:3001"),
  APP_BASE_URL_WORKER: z.string().url().default("http://localhost:3002"),
  APP_BASE_URL_ADMIN: z.string().url().default("http://localhost:3003"),

  CORS_ORIGINS: z
    .string()
    .default(
      "http://localhost:3001,http://localhost:3002,http://localhost:3003",
    ),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ADMIN_FULL_NAME: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === "production",
  isTest: parsed.data.NODE_ENV === "test",
  isDev: parsed.data.NODE_ENV === "development",
  corsOrigins: parsed.data.CORS_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};

export type Env = typeof env;
