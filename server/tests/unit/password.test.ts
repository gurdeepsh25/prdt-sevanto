import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
} from "../../src/common/utils/password.js";

describe("password utils", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(hash, "Sup3rSecret!")).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(await verifyPassword(hash, "WrongPass1")).toBe(false);
  });

  it("returns false for malformed hashes", async () => {
    expect(await verifyPassword("not-a-real-hash", "whatever")).toBe(false);
  });
});
