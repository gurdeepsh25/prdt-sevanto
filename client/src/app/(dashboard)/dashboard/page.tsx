"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <p className="p-10 text-center text-slate-500">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold">Welcome, {user.fullName}</h1>
      <p className="mt-2 text-slate-600">
        Role: <strong>{user.role}</strong>
      </p>

      {!user.isEmailVerified && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Your email is not verified yet. Check your inbox for the verification
          link.
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/profile"
          className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-brand-300 hover:bg-brand-50/40"
        >
          <h2 className="text-lg font-semibold">Edit profile</h2>
          <p className="mt-1 text-sm text-slate-600">
            Update your name, phone, and addresses.
          </p>
        </Link>
        <Link
          href="/settings"
          className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-brand-300 hover:bg-brand-50/40"
        >
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="mt-1 text-sm text-slate-600">
            Change password or delete your account.
          </p>
        </Link>
      </div>
    </div>
  );
}
