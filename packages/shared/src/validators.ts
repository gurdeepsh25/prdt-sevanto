/**
 * Validation schemas shared by all three frontends.
 * Mirrors the server-side schemas in server/src/modules/auth/auth.validators.ts
 */

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

export function validateEmail(email: string): string | null {
  const v = email.trim().toLowerCase();
  if (!v) return "Email is required";
  if (v.length > 254) return "Email too long";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < PASSWORD_MIN)
    return `Password must be at least ${PASSWORD_MIN} characters`;
  if (password.length > PASSWORD_MAX) return "Password too long";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must contain both letters and numbers";
  }
  return null;
}

export function validateFullName(name: string): string | null {
  const v = name.trim();
  if (v.length < 2) return "Name must be at least 2 characters";
  if (v.length > 120) return "Name too long";
  return null;
}

export const COMMON_PASSWORDS = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password1",
  "password123",
  "qwerty123",
  "qwerty1234",
  "11111111",
  "12341234",
  "iloveyou",
  "admin123",
  "welcome1",
  "welcome123",
  "abc12345",
  "abcd1234",
  "qwertyuiop",
  "00000000",
  "letmein1",
  "letmein123",
  "sunshine1",
  "princess1",
  "football1",
  "monkey123",
]);

export function isCommonPassword(p: string): boolean {
  return COMMON_PASSWORDS.has(p.toLowerCase());
}
