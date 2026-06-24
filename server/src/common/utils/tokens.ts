import { createHash, randomBytes } from "node:crypto";

/**
 * Generate a cryptographically strong opaque token (URL-safe, ≥32 bytes).
 */
export function generateOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/**
 * Hash a token for at-rest storage. We never store the raw token.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
