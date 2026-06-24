import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env.js";

// Reuse a single client across hot reloads in dev.
declare global {
  // eslint-disable-next-line no-var
  var __sevantoPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__sevantoPrisma ??
  new PrismaClient({
    log: env.isDev ? ["warn", "error"] : ["error"],
  });

if (!env.isProd) {
  globalThis.__sevantoPrisma = prisma;
}
