import { describe, it, expect } from "vitest";

/**
 * Integration test scaffold — left as `describe.skip` to keep the default
 * `npm test` runnable without a live Postgres.
 *
 * To enable:
 *   1. Set DATABASE_URL to a throwaway Postgres database.
 *   2. Run `npx prisma migrate deploy`.
 *   3. Change `describe.skip` → `describe` below.
 *   4. Run `npm run test:integration`.
 */

describe.skip("auth flow (integration)", () => {
  it("placeholder", () => {
    expect(true).toBe(true);
  });
});
