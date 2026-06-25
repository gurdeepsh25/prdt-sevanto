import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Register the User schema for /users/me
export const UserSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .openapi({ example: "6f0a4b3a-5a1f-4d8e-b7c3-2a7f3b9d2c10" }),
    email: z.string().email(),
    fullName: z.string(),
    phone: z.string().nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
    role: z.enum(["CUSTOMER", "WORKER", "ADMIN"]),
    isActive: z.boolean().optional(),
    isEmailVerified: z.boolean(),
    createdAt: z.string().datetime(),
  })
  .openapi("User");

export const AddressSchema = z
  .object({
    id: z.string().uuid(),
    label: z.string().nullable(),
    line1: z.string(),
    line2: z.string().nullable(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    isDefault: z.boolean(),
    createdAt: z.string().datetime(),
  })
  .openapi("Address");

export const TokensSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
    accessTokenExpiresIn: z.number().int(),
    refreshTokenExpiresIn: z.number().int(),
  })
  .openapi("AuthTokens");

export const ErrorSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z
        .array(z.object({ path: z.string().optional(), issue: z.string() }))
        .optional(),
    }),
  })
  .openapi("ErrorEnvelope");

export const SuccessEnvelope = <T extends z.ZodTypeAny>(data: T) =>
  z.object({ success: z.literal(true), data }).openapi("SuccessEnvelope");

export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Sevanto API",
      version: "0.1.0",
      description: "Sevanto hyperlocal workforce marketplace API",
    },
    servers: [{ url: "http://localhost:3000/api/v1" }],
  });
}

// Register auth endpoints
registry.registerPath({
  method: "post",
  path: "/auth/signup",
  summary: "Create an account",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z.string().email(),
            password: z.string(),
            fullName: z.string(),
            role: z.enum(["CUSTOMER", "WORKER"]),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": {
          schema: SuccessEnvelope(
            z.object({ user: UserSchema, tokens: TokensSchema }),
          ),
        },
      },
    },
    400: {
      description: "Validation",
      content: { "application/json": { schema: ErrorSchema } },
    },
    409: {
      description: "Conflict",
      content: { "application/json": { schema: ErrorSchema } },
    },
    429: {
      description: "Rate limited",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  summary: "Login with email + password",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ email: z.string().email(), password: z.string() }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: SuccessEnvelope(
            z.object({ user: UserSchema, tokens: TokensSchema }),
          ),
        },
      },
    },
    401: {
      description: "Invalid credentials",
      content: { "application/json": { schema: ErrorSchema } },
    },
    429: {
      description: "Rate limited",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  summary: "Rotate refresh token",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": { schema: z.object({ refreshToken: z.string() }) },
      },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: SuccessEnvelope(
            z.object({ user: UserSchema, tokens: TokensSchema }),
          ),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  summary: "Logout (revoke refresh token)",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ refreshToken: z.string().optional() }),
        },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "get",
  path: "/auth/verify-email",
  summary: "Verify email via token",
  tags: ["Auth"],
  request: { query: z.object({ token: z.string() }) },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: SuccessEnvelope(z.object({ user: UserSchema })),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/resend-verification",
  summary: "Resend verification email",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": { schema: z.object({ email: z.string().email() }) },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "post",
  path: "/auth/forgot-password",
  summary: "Send password reset link",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": { schema: z.object({ email: z.string().email() }) },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  summary: "Set new password with token",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ token: z.string(), password: z.string() }),
        },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// =====================================================
// Phase 2 � User Management endpoints
// =====================================================

registry.registerPath({
  method: "get",
  path: "/users/me",
  summary: "Get current user",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: SuccessEnvelope(z.object({ user: UserSchema })),
        },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/users/me",
  summary: "Update current user's profile",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            fullName: z.string().min(2).max(120).optional(),
            phone: z.string().nullable().optional(),
            avatarUrl: z.string().url().nullable().optional(),
          }),
        },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "post",
  path: "/users/me/password",
  summary: "Change password",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            currentPassword: z.string(),
            newPassword: z.string().min(8),
          }),
        },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "post",
  path: "/users/me/delete",
  summary: "Soft-delete the current user account",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "post",
  path: "/users/me/avatar",
  summary: "Issue avatar upload ticket (pre-signed URL)",
  tags: ["Users"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "get",
  path: "/users/me/addresses",
  summary: "List current user's addresses",
  tags: ["Addresses"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "post",
  path: "/users/me/addresses",
  summary: "Create a new address",
  tags: ["Addresses"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AddressSchema.partial({ id: true, createdAt: true }),
        },
      },
    },
  },
  responses: { 201: { description: "Created" } },
});

registry.registerPath({
  method: "patch",
  path: "/users/me/addresses/{id}",
  summary: "Update an address",
  tags: ["Addresses"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: { "application/json": { schema: AddressSchema.partial() } },
    },
  },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "delete",
  path: "/users/me/addresses/{id}",
  summary: "Delete an address",
  tags: ["Addresses"],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "get",
  path: "/users",
  summary: "Admin: list users",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      page: z.number().optional(),
      pageSize: z.number().optional(),
      role: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
      sort: z.string().optional(),
    }),
  },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "get",
  path: "/users/{id}",
  summary: "Admin: get user detail",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "patch",
  path: "/users/{id}",
  summary: "Admin: suspend or reactivate a user",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        "application/json": { schema: z.object({ isActive: z.boolean() }) },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

// =====================================================
// Phase 3 � Worker Profiles
// =====================================================

registry.registerPath({
  method: "get",
  path: "/workers",
  summary: "Public: list workers (search & filter)",
  tags: ["Workers"],
  request: {
    query: z.object({
      page: z.number().optional(),
      pageSize: z.number().optional(),
      city: z.string().optional(),
      skill: z.string().optional(),
      minRating: z.number().optional(),
      verifiedOnly: z.boolean().optional(),
      sort: z.string().optional(),
    }),
  },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "get",
  path: "/workers/{id}",
  summary: "Public: worker detail",
  tags: ["Workers"],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "get",
  path: "/workers/me",
  summary: "Worker: get my profile",
  tags: ["Workers"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "put",
  path: "/workers/me",
  summary: "Worker: create or replace my profile",
  tags: ["Workers"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            headline: z.string().min(5).max(100),
            bio: z.string().min(10).max(2000),
            yearsExperience: z.number().int().min(0).max(70),
            hourlyRate: z.number().int().nonnegative().nullable().optional(),
            city: z.string().min(1).max(80),
            serviceRadiusKm: z.number().int().min(1).max(100),
          }),
        },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "patch",
  path: "/workers/me",
  summary: "Worker: partial profile update",
  tags: ["Workers"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "put",
  path: "/workers/me/skills",
  summary: "Worker: replace my skills list",
  tags: ["Workers"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            skills: z.array(
              z.object({
                skillId: z.string().uuid(),
                level: z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]),
              }),
            ),
          }),
        },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "get",
  path: "/workers/me/portfolio",
  summary: "Worker: list my portfolio items",
  tags: ["Workers"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "post",
  path: "/workers/me/portfolio",
  summary: "Worker: add portfolio item",
  tags: ["Workers"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            imageUrl: z.string().url(),
            caption: z.string().max(280).nullable().optional(),
            sortOrder: z.number().int().min(0).max(1000).optional(),
          }),
        },
      },
    },
  },
  responses: { 201: { description: "Created" } },
});

registry.registerPath({
  method: "delete",
  path: "/workers/me/portfolio/{id}",
  summary: "Worker: delete portfolio item",
  tags: ["Workers"],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "get",
  path: "/skills",
  summary: "Public: list active skill catalog",
  tags: ["Workers"],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            items: z.array(
              z.object({
                id: z.string().uuid(),
                name: z.string(),
                slug: z.string(),
              }),
            ),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/admin/workers/pending",
  summary: "Admin: list workers pending verification",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "post",
  path: "/admin/workers/{id}/verify",
  summary: "Admin: set worker verified / unverified",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            isVerified: z.boolean(),
            reason: z.string().max(280).optional(),
          }),
        },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

// =====================================================
// Phase 4 — Job Categories / Subcategories / Skills
// =====================================================

const CategorySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    iconKey: z.string().nullable().optional(),
    sortOrder: z.number().int(),
    isActive: z.boolean().optional(),
  })
  .openapi("Category");

const SubcategorySchema = z
  .object({
    id: z.string().uuid(),
    categoryId: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    sortOrder: z.number().int(),
    isActive: z.boolean().optional(),
  })
  .openapi("Subcategory");

const SkillSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    subcategoryId: z.string().uuid().nullable().optional(),
  })
  .openapi("Skill");

// Public — categories
registry.registerPath({
  method: "get",
  path: "/categories",
  summary: "Public: list active categories (with subcategory counts)",
  tags: ["Categories"],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            items: z.array(
              CategorySchema.extend({
                subcategoriesCount: z.number().int().nonnegative(),
              }),
            ),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/categories/{slug}",
  summary: "Public: get active category by slug (with subcategories)",
  tags: ["Categories"],
  request: { params: z.object({ slug: z.string() }) },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            category: CategorySchema.extend({
              subcategories: z.array(SubcategorySchema),
            }),
          }),
        },
      },
    },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "get",
  path: "/categories/{slug}/subcategories",
  summary: "Public: list active subcategories for a category",
  tags: ["Categories"],
  request: { params: z.object({ slug: z.string() }) },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({ items: z.array(SubcategorySchema) }),
        },
      },
    },
  },
});

// Public — skills (extended query)
registry.registerPath({
  method: "get",
  path: "/skills",
  summary:
    "Public: list skills (optional filters: categoryId, subcategoryId, categorySlug)",
  tags: ["Workers"],
  request: {
    query: z.object({
      categoryId: z.string().uuid().optional(),
      subcategoryId: z.string().uuid().optional(),
      categorySlug: z.string().optional(),
      includeInactive: z.boolean().optional(),
    }),
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({ items: z.array(SkillSchema) }),
        },
      },
    },
  },
});

// Admin — categories
registry.registerPath({
  method: "get",
  path: "/admin/categories",
  summary: "Admin: list all categories (incl. inactive) with subcategories",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "post",
  path: "/admin/categories",
  summary: "Admin: create a category",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().min(2).max(60),
            slug: z.string().optional(),
            description: z.string().max(500).nullable().optional(),
            iconKey: z.string().max(40).nullable().optional(),
            sortOrder: z.number().int().min(0).optional(),
            isActive: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: { description: "Created" },
    409: { description: "Conflict" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/admin/categories/{id}",
  summary: "Admin: update a category",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().min(2).max(60).optional(),
            description: z.string().max(500).nullable().optional(),
            iconKey: z.string().max(40).nullable().optional(),
            sortOrder: z.number().int().min(0).optional(),
            isActive: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "post",
  path: "/admin/categories/{id}/subcategories",
  summary: "Admin: add a subcategory to a category",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().min(2).max(60),
            slug: z.string().optional(),
            description: z.string().max(500).nullable().optional(),
            sortOrder: z.number().int().min(0).optional(),
            isActive: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: { 201: { description: "Created" } },
});

registry.registerPath({
  method: "patch",
  path: "/admin/subcategories/{id}",
  summary: "Admin: update a subcategory",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().min(2).max(60).optional(),
            description: z.string().max(500).nullable().optional(),
            sortOrder: z.number().int().min(0).optional(),
            isActive: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

// Admin — skills
registry.registerPath({
  method: "post",
  path: "/admin/skills",
  summary: "Admin: create a skill (optionally linked to a subcategory)",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().min(2).max(60),
            slug: z.string().optional(),
            subcategoryId: z.string().uuid().nullable().optional(),
            isActive: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: { 201: { description: "Created" } },
});

registry.registerPath({
  method: "patch",
  path: "/admin/skills/{id}",
  summary: "Admin: update a skill",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().min(2).max(60).optional(),
            subcategoryId: z.string().uuid().nullable().optional(),
            isActive: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

// =====================================================
// Phase 5 — Jobs (Job Posting)
// =====================================================

const JobAttachmentSchema = z
  .object({
    id: z.string().uuid(),
    url: z.string().url(),
    caption: z.string().nullable().optional(),
    sortOrder: z.number().int(),
    createdAt: z.string().datetime(),
  })
  .openapi("JobAttachment");

const JobSummarySchema = z
  .object({
    id: z.string().uuid(),
    customerId: z.string().uuid(),
    title: z.string(),
    status: z.enum([
      "DRAFT",
      "OPEN",
      "ASSIGNED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "EXPIRED",
    ]),
    urgency: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
    city: z.string(),
    categoryId: z.string().uuid(),
    categoryName: z.string(),
    subcategoryId: z.string().uuid().nullable().optional(),
    subcategoryName: z.string().nullable().optional(),
    budgetMin: z.number().int().nullable().optional(),
    budgetMax: z.number().int().nullable().optional(),
    currency: z.string(),
    scheduledFor: z.string().datetime().nullable().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    attachmentCount: z.number().int(),
  })
  .openapi("JobSummary");

const JobDetailSchema = JobSummarySchema.extend({
  description: z.string(),
  addressId: z.string().uuid(),
  cancelledAt: z.string().datetime().nullable().optional(),
  cancelReason: z.string().nullable().optional(),
  attachments: z.array(JobAttachmentSchema),
}).openapi("JobDetail");

// Customer — jobs
registry.registerPath({
  method: "post",
  path: "/jobs",
  summary: "Customer: create a job post",
  tags: ["Jobs"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            title: z.string().min(5).max(120),
            description: z.string().min(20).max(4000),
            categoryId: z.string().uuid(),
            subcategoryId: z.string().uuid().nullable().optional(),
            addressId: z.string().uuid(),
            budgetMin: z.number().int().nonnegative().nullable().optional(),
            budgetMax: z.number().int().nonnegative().nullable().optional(),
            currency: z.string().length(3).optional(),
            urgency: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
            scheduledFor: z.string().datetime().nullable().optional(),
            status: z.enum(["DRAFT", "OPEN"]).optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": { schema: z.object({ job: JobDetailSchema }) },
      },
    },
    400: { description: "Validation" },
    403: { description: "Forbidden (address ownership)" },
    404: { description: "Category / subcategory / address not found" },
  },
});

registry.registerPath({
  method: "get",
  path: "/jobs",
  summary: "Customer: list my jobs",
  tags: ["Jobs"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      status: z
        .enum([
          "DRAFT",
          "OPEN",
          "ASSIGNED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED",
          "EXPIRED",
        ])
        .optional(),
      page: z.coerce.number().int().positive().optional(),
      pageSize: z.coerce.number().int().positive().max(100).optional(),
      sort: z
        .enum(["createdAt:desc", "createdAt:asc", "scheduledFor:asc"])
        .optional(),
    }),
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            items: z.array(JobSummarySchema),
            total: z.number().int(),
            page: z.number().int(),
            pageSize: z.number().int(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/jobs/{id}",
  summary: "Owner / Admin: get job detail",
  tags: ["Jobs"],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": { schema: z.object({ job: JobDetailSchema }) },
      },
    },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/jobs/{id}",
  summary: "Owner: update job (only in DRAFT / OPEN)",
  tags: ["Jobs"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            title: z.string().min(5).max(120).optional(),
            description: z.string().min(20).max(4000).optional(),
            categoryId: z.string().uuid().optional(),
            subcategoryId: z.string().uuid().nullable().optional(),
            addressId: z.string().uuid().optional(),
            budgetMin: z.number().int().nonnegative().nullable().optional(),
            budgetMax: z.number().int().nonnegative().nullable().optional(),
            currency: z.string().length(3).optional(),
            urgency: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
            scheduledFor: z.string().datetime().nullable().optional(),
            status: z.enum(["DRAFT", "OPEN"]).optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "OK" },
    404: { description: "Not found" },
    422: { description: "Job not editable in current status" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/jobs/{id}",
  summary: "Owner: soft-delete job (only in DRAFT / OPEN)",
  tags: ["Jobs"],
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "post",
  path: "/jobs/{id}/cancel",
  summary: "Owner / Admin: cancel a job",
  tags: ["Jobs"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            reason: z.string().max(280).optional(),
          }),
        },
      },
    },
  },
  responses: { 200: { description: "OK" } },
});

registry.registerPath({
  method: "post",
  path: "/jobs/{id}/attachments",
  summary: "Owner: add an attachment",
  tags: ["Jobs"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            url: z.string().url().max(2048),
            caption: z.string().max(280).nullable().optional(),
            sortOrder: z.number().int().min(0).optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": {
          schema: z.object({ attachment: JobAttachmentSchema }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/jobs/{id}/attachments/{attachmentId}",
  summary: "Owner: remove an attachment",
  tags: ["Jobs"],
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid(),
      attachmentId: z.string().uuid(),
    }),
  },
  responses: { 200: { description: "OK" } },
});

// Admin — read-only jobs list
registry.registerPath({
  method: "get",
  path: "/admin/jobs",
  summary: "Admin: list jobs (read-only in Phase 5)",
  tags: ["Admin"],
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      status: z
        .enum([
          "DRAFT",
          "OPEN",
          "ASSIGNED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED",
          "EXPIRED",
        ])
        .optional(),
      page: z.coerce.number().int().positive().optional(),
      pageSize: z.coerce.number().int().positive().max(100).optional(),
      sort: z
        .enum(["createdAt:desc", "createdAt:asc", "scheduledFor:asc"])
        .optional(),
    }),
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            items: z.array(
              JobSummarySchema.extend({
                customerName: z.string(),
                customerEmail: z.string(),
              }),
            ),
            total: z.number().int(),
            page: z.number().int(),
            pageSize: z.number().int(),
          }),
        },
      },
    },
  },
});
