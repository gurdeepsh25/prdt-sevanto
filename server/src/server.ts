import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./infra/logger/logger.js";
import { prisma } from "./infra/prisma/client.js";

async function bootstrap(): Promise<void> {
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV },
      "sevanto server listening",
    );
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "shutting down");
    server.close(() => logger.info("http server closed"));
    await prisma.$disconnect().catch(() => undefined);
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("fatal bootstrap error", err);
  process.exit(1);
});
