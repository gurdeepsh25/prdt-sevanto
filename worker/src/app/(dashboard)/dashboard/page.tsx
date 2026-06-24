"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  useEffect(() => {
    if (isHydrated && !user) router.push("/login");
  }, [isHydrated, user, router]);
  if (!isHydrated || !user)
    return <main className="p-10 text-center text-slate-500">Loading…</main>;
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Welcome, {user.fullName}</h1>
      <p className="mt-2 text-slate-600">
        Worker dashboard shell — Phase 1 complete.
      </p>
      {!user.isEmailVerified && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Verify your email to unlock job discovery.
        </div>
      )}
    </main>
  );
}
