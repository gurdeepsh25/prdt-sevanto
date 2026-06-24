import { describe, it, expect } from "vitest";
import {
  generateOpaqueToken,
  hashToken,
} from "../../src/common/utils/tokens.js";
import { createHash } from "node:crypto";

describe("token utils", () => {
  it("generates URL-safe tokens of correct length", () => {
    const t = generateOpaqueToken(32);
    expect(t).toHaveLength(43); // 32 bytes base64url → 43 chars (no padding)
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("hashes tokens deterministically", () => {
    const t = "abc123def456";
    const h1 = hashToken(t);
    const h2 = hashToken(t);
    expect(h1).toBe(h2);
    expect(h1).toBe(createHash("sha256").update(t).digest("hex"));
  });
});
