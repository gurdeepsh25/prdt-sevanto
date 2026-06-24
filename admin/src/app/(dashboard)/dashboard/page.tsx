"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <p className="p-10 text-center text-slate-500">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Admin overview</h1>
      <p className="mt-2 text-slate-600">Signed in as {user.email}.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/users"
          className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-300"
        >
          <p className="text-xs uppercase text-slate-500">Manage</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Users</p>
          <p className="mt-1 text-sm text-slate-600">
            List, suspend, reactivate.
          </p>
        </Link>
      </div>
    </div>
  );
}
