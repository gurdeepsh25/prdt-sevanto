import { redirect } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

/**
 * Authenticated route guard.
 * Use as the first thing inside a server component:
 *   import { requireAuth } from '@/lib/guard';
 *   export default function Page() { await requireAuth('/dashboard'); ... }
 *
 * Since zustand-persist is client-side, the client component should hydrate and
 * redirect if not authenticated. The pattern below uses a small client wrapper.
 */
export function assertClientAuth(): void {
  // Server-side guard placeholder. Real auth check happens via the client
  // <RequireAuth> wrapper.
}

export function redirectToLogin(from?: string): never {
  redirect(`/login${from ? `?from=${encodeURIComponent(from)}` : ""}`);
}

// Re-export for convenience
export { useAuthStore };
