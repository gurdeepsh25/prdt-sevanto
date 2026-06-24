import { z } from "zod";
import { validateFullName } from "../../common/validators/string.js";

/** E.164 international phone format (+ sign + digits, max 15 digits). */
const E164_RE = /^\+[1-9]\d{6,14}$/;

export const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120).optional(),
    phone: z
      .string()
      .trim()
      .nullable()
      .optional()
      .refine((v) => v === null || v === undefined || E164_RE.test(v), {
        message: "Phone must be in E.164 format (e.g. +919876543210)",
      }),
    avatarUrl: z.string().trim().url().max(2048).nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
      message: "Password must contain both letters and numbers",
    }),
});

export const addressSchema = z.object({
  label: z.string().trim().max(40).nullable().optional(),
  line1: z.string().trim().min(2).max(200),
  line2: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(2).default("IN"),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const addressUpdateSchema = addressSchema
  .partial()
  .strict()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

export const idParamSchema = z.object({ id: z.string().uuid() });

export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  role: z.enum(["CUSTOMER", "WORKER", "ADMIN"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  search: z.string().trim().min(1).max(120).optional(),
  sort: z
    .enum(["createdAt:asc", "createdAt:desc", "fullName:asc", "fullName:desc"])
    .optional()
    .default("createdAt:desc"),
});

export const adminUpdateUserSchema = z
  .object({
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type AddressUpdateInput = z.infer<typeof addressUpdateSchema>;
export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

// Keep the unused-import warning quiet; helpful export for other modules.
export { validateFullName };
