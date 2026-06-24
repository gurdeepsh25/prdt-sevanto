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
