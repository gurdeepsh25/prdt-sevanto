"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated) {
      if (!user) router.push("/login");
      else if (user.role !== "ADMIN") router.push("/login");
    }
  }, [isHydrated, user, router]);

  if (!isHydrated || !user) {
    return <main className="p-10 text-center text-slate-500">Loading…</main>;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold">Admin overview</h1>
      <p className="mt-2 text-slate-600">
        Signed in as {user.email}. Phase 1 complete.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase text-slate-500">Signups</p>
          <p className="mt-2 text-2xl font-bold">—</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase text-slate-500">Jobs posted</p>
          <p className="mt-2 text-2xl font-bold">—</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase text-slate-500">Open reports</p>
          <p className="mt-2 text-2xl font-bold">—</p>
        </div>
      </div>
    </main>
  );
}
