"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const clear = useAuthStore((s) => s.clear);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  useEffect(() => {
    if (isHydrated && !user) router.push("/login");
  }, [isHydrated, user, router]);

  if (!isHydrated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading…</p>
      </main>
    );
  }

  async function handleLogout() {
    try {
      const { getDefaultApi } = await import("@/lib/api");
      await getDefaultApi().logout(refreshToken ?? undefined);
    } catch {
      // Ignore — clear locally regardless.
    }
    clear();
    router.push("/login");
  }

  const nav = [
    { href: "/dashboard", label: "Overview" },
    { href: "/workers", label: "Find Workers" },
    { href: "/profile", label: "Profile" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white sm:flex sm:flex-col">
        <Link
          href="/"
          className="block px-6 py-5 text-xl font-bold text-brand-600"
        >
          Sevanto
        </Link>
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
                    ? "bg-brand-50 text-brand-700"
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
