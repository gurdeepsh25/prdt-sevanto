import "dotenv/config";

// Force test-friendly defaults that don't require DB/Redis to be reachable for unit tests.
process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? "error";
process.env.DATABASE_URL ??=
  "postgresql://test:test@localhost:5432/test?schema=public";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-please-change-me-32chars";
process.env.JWT_REFRESH_SECRET ??=
  "test-refresh-secret-please-change-me-32chars";
process.env.JWT_ACCESS_TTL ??= "15m";
process.env.JWT_REFRESH_TTL ??= "30d";
process.env.MAIL_HOST ??= "localhost";
process.env.MAIL_PORT ??= "1025";
process.env.MAIL_FROM ??= "Sevanto <no-reply@sevanto.test>";
process.env.APP_BASE_URL_CLIENT ??= "http://localhost:3001";
process.env.APP_BASE_URL_WORKER ??= "http://localhost:3002";
process.env.APP_BASE_URL_ADMIN ??= "http://localhost:3003";
process.env.CORS_ORIGINS ??=
  "http://localhost:3001,http://localhost:3002,http://localhost:3003";
process.env.RATE_LIMIT_WINDOW_MS ??= "60000";
process.env.RATE_LIMIT_MAX ??= "1000";
