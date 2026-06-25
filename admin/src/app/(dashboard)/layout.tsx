"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const clear = useAuthStore((s) => s.clear);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  useEffect(() => {
    if (isHydrated) {
      if (!user) router.push("/login");
      else if (user.role !== "ADMIN") router.push("/login");
    }
  }, [isHydrated, user, router]);

  if (!isHydrated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </main>
    );
  }

  async function handleLogout() {
    try {
      const { getDefaultApi } = await import("@/lib/api");
      await getDefaultApi().logout(refreshToken ?? undefined);
    } catch {}
    clear();
    router.push("/login");
  }

  const nav = [
    { href: "/dashboard", label: "Overview" },
    { href: "/users", label: "Users" },
    { href: "/jobs", label: "Jobs" },
    { href: "/workers/pending", label: "Worker Verification" },
    { href: "/categories", label: "Categories" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white sm:flex sm:flex-col">
        <div className="px-6 py-5 text-xl font-bold text-slate-900">
          Sevanto Admin
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <p className="truncate text-sm font-medium text-slate-700">
            {user.fullName}
          </p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
