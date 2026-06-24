# 07 — Validation

## Decision: **Zod for everything.**

**Tag:** Required For MVP.

## Why Zod

| Criterion                    | Zod                             | express-validator   |
| ---------------------------- | ------------------------------- | ------------------- |
| TypeScript inference         | ✅ Native (`z.infer<typeof S>`) | ❌ Custom types     |
| Shared client+server         | ✅                              | ❌ Server-only      |
| Composable                   | ✅                              | Partial             |
| Async validators (db checks) | ✅ via `.refine`                | ✅                  |
| Error format                 | Structured (path + message)     | Inconsistent        |
| Test ergonomics              | Pure functions                  | Needs request mocks |
| Bundle size (frontend)       | Small + tree-shakeable          | n/a                 |
| Documentation                | Excellent                       | OK                  |

## Where It's Used

### Backend (Express)

- Request body validation in middleware: `validate({ body, query, params })`.
- Every route defines a Zod schema in `*.validators.ts`.
- Errors mapped to `400 VALIDATION_ERROR` envelope.

```ts
const signupSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(120),
  role: z.enum(["CUSTOMER", "WORKER"]),
});
```

### Frontend (React Hook Form + Zod)

- `zodResolver(schema)` on every form.
- Same schema imported from `shared/validators` (a workspace package) where possible.

### Shared Workspace (Recommended)

- `packages/shared/validators/*.ts` — Zod schemas used by both backend and frontend.
- Imported by all 3 apps + server.
- This is the **single source of truth** for validation rules and types.

## Convention

- One schema per route / form.
- Schemas named `<action>Schema` (e.g., `postJobSchema`).
- Reuse small pieces (e.g., `emailSchema`, `passwordSchema`) for consistency.

## Error Envelope (Server)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [{ "path": "email", "issue": "Invalid email" }]
  }
}
```

## Async Refinements

For DB-backed validation (e.g., "category exists and active"):

```ts
.refine(async (id) => {
  const cat = await prisma.category.findUnique({ where: { id } });
  return !!cat?.isActive;
}, { message: 'Category not available' })
```

Wrapped by `validateAsync` middleware that awaits refinements.

## Tagging Summary

| Tech              | Tag                            |
| ----------------- | ------------------------------ |
| Zod               | Required For MVP               |
| `zod-to-openapi`  | Required For MVP (for Swagger) |
| `react-hook-form` | Required For MVP               |
| express-validator | ❌ Rejected                    |
