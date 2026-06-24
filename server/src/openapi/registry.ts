import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Register the User schema for /auth/me
export const UserSchema = z
  .object({
    id: z
      .string()
      .uuid()
      .openapi({ example: "6f0a4b3a-5a1f-4d8e-b7c3-2a7f3b9d2c10" }),
    email: z.string().email(),
    fullName: z.string(),
    role: z.enum(["CUSTOMER", "WORKER", "ADMIN"]),
    isEmailVerified: z.boolean(),
    createdAt: z.string().datetime(),
  })
  .openapi("User");

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

registry.registerPath({
  method: "get",
  path: "/auth/me",
  summary: "Get current authenticated user",
  tags: ["Auth"],
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

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});
