import { describe, it, expect } from "vitest";
import { ttlToMs } from "../../src/common/utils/jwt.js";

describe("ttlToMs", () => {
  it("converts seconds", () => expect(ttlToMs("60s")).toBe(60_000));
  it("converts minutes", () => expect(ttlToMs("15m")).toBe(900_000));
  it("converts hours", () => expect(ttlToMs("2h")).toBe(7_200_000));
  it("converts days", () => expect(ttlToMs("30d")).toBe(2_592_000_000));
  it("defaults to seconds", () => expect(ttlToMs("45")).toBe(45_000));
  it("throws on garbage", () => expect(() => ttlToMs("abc")).toThrow());
});
