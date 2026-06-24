import type { Redis } from "ioredis";
import { getRedis } from "../../infra/redis/client.js";

const WINDOW_SECONDS = 15 * 60;
const MAX_FAILURES = 5;

interface AttemptState {
  count: number;
  firstAt: number;
  lockedUntil: number | null;
}

function key(identifier: string): string {
  return `auth:fail:${identifier}`;
}

export async function recordFailure(
  identifier: string,
): Promise<{ locked: boolean; until?: Date }> {
  const r = getRedis();
  // If Redis is unavailable, fail-open: don't lock out users due to infra issues.
  if (!r) return { locked: false };

  const k = key(identifier);
  const raw = await r.get(k);
  const now = Date.now();
  let state: AttemptState = raw
    ? (JSON.parse(raw) as AttemptState)
    : { count: 0, firstAt: now, lockedUntil: null };

  // If locked, return locked state.
  if (state.lockedUntil && state.lockedUntil > now) {
    return { locked: true, until: new Date(state.lockedUntil) };
  }

  // Reset window if past 15 min from first failure.
  if (now - state.firstAt > WINDOW_SECONDS * 1000) {
    state = { count: 0, firstAt: now, lockedUntil: null };
  }

  state.count += 1;
  if (state.count >= MAX_FAILURES) {
    state.lockedUntil = now + WINDOW_SECONDS * 1000;
  }

  await r.set(k, JSON.stringify(state), "EX", WINDOW_SECONDS);
  return state.lockedUntil
    ? { locked: true, until: new Date(state.lockedUntil) }
    : { locked: false };
}

export async function recordSuccess(
  identifier: string,
  redis?: Redis | null,
): Promise<void> {
  const r = redis ?? getRedis();
  if (!r) return;
  await r.del(key(identifier));
}

export async function isLocked(
  identifier: string,
): Promise<{ locked: boolean; until?: Date }> {
  const r = getRedis();
  if (!r) return { locked: false };
  const raw = await r.get(key(identifier));
  if (!raw) return { locked: false };
  const state = JSON.parse(raw) as AttemptState;
  if (state.lockedUntil && state.lockedUntil > Date.now()) {
    return { locked: true, until: new Date(state.lockedUntil) };
  }
  return { locked: false };
}
