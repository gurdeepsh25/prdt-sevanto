import { describe, it, expect } from "vitest";
import {
  signupSchema,
  loginSchema,
  passwordSchema,
  forgotPasswordSchema,
} from "../../src/modules/auth/auth.validators.js";

describe("auth validators", () => {
  describe("passwordSchema", () => {
    it("accepts strong passwords", () => {
      expect(passwordSchema.safeParse("Hello123").success).toBe(true);
    });
    it("rejects too short", () => {
      expect(passwordSchema.safeParse("Hi1").success).toBe(false);
    });
    it("rejects no digits", () => {
      expect(passwordSchema.safeParse("NoDigits!").success).toBe(false);
    });
    it("rejects no letters", () => {
      expect(passwordSchema.safeParse("12345678").success).toBe(false);
    });
    it("rejects common passwords", () => {
      expect(passwordSchema.safeParse("password").success).toBe(false);
      expect(passwordSchema.safeParse("qwerty1234").success).toBe(false);
    });
  });

  describe("signupSchema", () => {
    it("accepts valid signup", () => {
      const r = signupSchema.safeParse({
        email: "user@example.com",
        password: "Hello1234",
        fullName: "Jane Doe",
        role: "CUSTOMER",
      });
      expect(r.success).toBe(true);
    });
    it("lowercases email", () => {
      const r = signupSchema.safeParse({
        email: "  USER@Example.COM ",
        password: "Hello1234",
        fullName: "Jane",
        role: "WORKER",
      });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.email).toBe("user@example.com");
    });
    it("rejects ADMIN role on signup", () => {
      const r = signupSchema.safeParse({
        email: "a@b.co",
        password: "Hello1234",
        fullName: "Jane",
        role: "ADMIN",
      });
      expect(r.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("requires non-empty password", () => {
      expect(
        loginSchema.safeParse({ email: "a@b.co", password: "" }).success,
      ).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("accepts any plausible email", () => {
      expect(forgotPasswordSchema.safeParse({ email: "a@b.co" }).success).toBe(
        true,
      );
    });
  });
});
