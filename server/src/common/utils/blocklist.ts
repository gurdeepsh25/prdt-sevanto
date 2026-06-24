// Curated list of the most common passwords. Extend as needed.
// This is intentionally small to keep memory low.
const COMMON = new Set<string>([
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
  return COMMON.has(p.toLowerCase());
}

/** Small email-shape guard beyond Zod's built-in. */
export function isPlausibleEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
}
