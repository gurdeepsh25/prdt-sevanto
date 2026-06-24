# 10 — API Documentation

## Decision: **OpenAPI 3.1** generated from Zod schemas via `zod-to-openapi`, served via **Swagger UI** at `/docs`.

**Tag:** Required For MVP.

## Generation Pipeline

1. Define Zod schemas in `server/src/modules/<m>/<m>.validators.ts`.
2. Register them with `@asteasolutions/zod-to-openapi` (`.openapi('OperationId', schema)`.
3. Build OpenAPI doc in `server/src/openapi/registry.ts`.
4. Mount Swagger UI at `/docs` (admin-internal in prod).
5. Export JSON at `/openapi.json`.

## Benefits

- **Single source of truth** — schemas define both runtime validation and docs.
- Always accurate.
- Codegen possible (future): client SDKs.

## API Versioning

### URL-based versioning (chosen)

- All routes prefixed `/api/v1`.
- Breaking changes → new `/api/v2`.
- Old version supported for **at least 6 months** after deprecation announcement.

### Deprecation Headers

On deprecated endpoints:

```
Deprecation: true
Sunset: Sat, 01 Jan 2027 00:00:00 GMT
Link: </api/v2/...>; rel="successor-version"
```

### Backwards-Compatibility Rules

- Adding new optional fields → non-breaking.
- Adding new endpoints → non-breaking.
- Removing fields, renaming, changing types → breaking.
- Changing error codes → breaking.

### Change Log

- Every endpoint mutation logged in `docs/api/CHANGELOG.md`.
- Annotated with semver (`MAJOR`/`MINOR`/`PATCH`).

## Conventions

- OperationId: `<verb><Resource>` (e.g., `postJob`, `listMyJobs`).
- Tags: match module (`Auth`, `Users`, `Workers`, `Jobs`, etc.).
- Error responses always include the standard envelope.

## Example Skeleton

```ts
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

const PostJobBody = z
  .object({
    title: z.string().min(5).max(120).openapi({ example: "Fix kitchen sink" }),
    description: z.string().min(20).max(4000),
    budgetMin: z.number().int().nonnegative(),
    budgetMax: z.number().int().nonnegative(),
    categoryId: z.string().uuid(),
    addressId: z.string().uuid(),
    urgency: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  })
  .openapi("PostJobBody");
```

## Tagging Summary

| Tech               | Tag                |
| ------------------ | ------------------ |
| OpenAPI 3.1        | Required For MVP   |
| Swagger UI         | Required For MVP   |
| `zod-to-openapi`   | Required For MVP   |
| Client SDK codegen | Future Enhancement |
