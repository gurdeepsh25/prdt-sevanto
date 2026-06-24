import { z } from "zod";

/** Trimmed full name validator shared by auth + profile updates. */
export function validateFullName(name: string): string | null {
  const v = name.trim();
  if (v.length < 2) return "Name must be at least 2 characters";
  if (v.length > 120) return "Name too long";
  return null;
}

/** Generic trimmed non-empty string. */
export const trimmedString = (min = 1, max = 1000) =>
  z.string().trim().min(min).max(max);

/** UUID helper (used in :id params). */
export const uuid = z.string().uuid();
