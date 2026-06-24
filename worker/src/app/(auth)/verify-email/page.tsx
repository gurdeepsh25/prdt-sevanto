"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth";
import { AuthShell } from "@/components/auth/auth-shell";

function VerifyEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const api = useApi();
  const setUser = useAuthStore((s) => s.setUser);
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [message, setMessage] = useState("Verifying your email…");
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification link is missing its token.");
      return;
    }
    (async () => {
      try {
        const res = await api.verifyEmail(token);
        setUser(res.user);
        setStatus("success");
        setMessage("Your email is verified. Redirecting…");
        setTimeout(() => router.push("/dashboard"), 1500);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  return (
    <AuthShell title="Verify your email">
      <div
        className={
          status === "success"
            ? "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
            : status === "error"
              ? "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              : "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
        }
      >
        {message}
      </div>
      {status === "error" && (
        <div className="mt-4">
          <Link
            href="/login"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Back to log in →
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="p-10 text-center text-slate-500">Loading...</main>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
