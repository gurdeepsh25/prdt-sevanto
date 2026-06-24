import IORedis, { type Redis } from "ioredis";
import { env } from "../../config/env.js";
import { logger } from "../logger/logger.js";

declare global {
  // eslint-disable-next-line no-var
  var __sevantoRedis: Redis | undefined;
}

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (!env.REDIS_URL) return null;
  if (client) return client;

  if (env.isDev || env.isTest) {
    if (globalThis.__sevantoRedis) {
      client = globalThis.__sevantoRedis;
      return client;
    }
    const c = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });
    c.on("error", (err) => logger.warn({ err }, "redis error"));
    globalThis.__sevantoRedis = c;
    client = c;
    return c;
  }

  client = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });
  client.on("error", (err) => logger.warn({ err }, "redis error"));
  return client;
}

export async function redisHealthy(): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  try {
    await r.ping();
    return true;
  } catch {
    return false;
  }
}
