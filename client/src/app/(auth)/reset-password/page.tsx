"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { validatePassword, ApiError } from "@sevanto/shared";
import { useApi } from "@/hooks/use-api";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <AuthShell
        title="Invalid link"
        subtitle="This password reset link is missing its token."
      >
        <Link
          href="/forgot-password"
          className="text-brand-600 hover:underline"
        >
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you don't reuse."
    >
      {done ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Your password has been reset.
          </div>
          <button
            onClick={() => router.push("/login")}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Go to log in →
          </button>
        </div>
      ) : (
        <AuthForm
          submitLabel="Update password"
          loading={loading}
          onSubmit={async (e) => {
            const fd = new FormData(e.currentTarget);
            const password = String(fd.get("password") ?? "");
            const confirm = String(fd.get("confirm") ?? "");

            const errors: Record<string, string> = {};
            const e1 = validatePassword(password);
            if (e1) errors.password = e1;
            if (password !== confirm) errors.confirm = "Passwords do not match";
            if (Object.keys(errors).length > 0) {
              const ae = new ApiError(
                400,
                "VALIDATION_ERROR",
                "Please fix the errors below",
              );
              (ae as unknown as { details: unknown[] }).details =
                Object.entries(errors).map(([p, i]) => ({
                  path: p,
                  issue: i,
                }));
              throw ae;
            }
            setLoading(true);
            try {
              await api.resetPassword({ token, password });
              setDone(true);
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ fieldErrors }) => (
            <>
              <FormField
                label="New password"
                htmlFor="password"
                error={fieldErrors.password}
                hint="Min 8 characters, letters and numbers."
              >
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </FormField>
              <FormField
                label="Confirm password"
                htmlFor="confirm"
                error={fieldErrors.confirm}
              >
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </FormField>
            </>
          )}
        </AuthForm>
      )}
    </AuthShell>
  );
}
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="p-10 text-center text-slate-500">Loading...</main>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
