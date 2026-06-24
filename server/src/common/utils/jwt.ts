import jwt, { type SignOptions, type JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env.js";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: "CUSTOMER" | "WORKER" | "ADMIN";
  jti: string;
}

export function signAccessToken(
  payload: Omit<AccessTokenPayload, "iat" | "exp">,
): string {
  const opts: SignOptions = {
    expiresIn: env.JWT_ACCESS_TTL as SignOptions["expiresIn"],
    algorithm: "HS256",
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, opts);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: ["HS256"],
  }) as AccessTokenPayload;
}

/** Convert a TTL like "30d", "15m", "3600s" to milliseconds. */
export function ttlToMs(ttl: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d)?$/.exec(ttl.trim());
  if (!match) throw new Error(`Invalid TTL format: ${ttl}`);
  const value = Number(match[1]);
  const unit = match[2] ?? "s";
  const factor: Record<string, number> = {
    ms: 1,
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * factor[unit];
}
