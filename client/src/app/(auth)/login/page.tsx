"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { validateEmail, ApiError } from "@sevanto/shared";
import { useAuthStore } from "@/stores/auth";
import { useApi } from "@/hooks/use-api";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const api = useApi();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your Sevanto account."
      footer={
        <>
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-brand-600 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <AuthForm
        submitLabel="Log in"
        loading={loading}
        onSubmit={async (e) => {
          const fd = new FormData(e.currentTarget);
          const email = String(fd.get("email") ?? "");
          const password = String(fd.get("password") ?? "");

          const errors: Record<string, string> = {};
          const e1 = validateEmail(email);
          if (e1) errors.email = e1;
          if (!password) errors.password = "Password is required";
          if (Object.keys(errors).length > 0) {
            const ae = new ApiError(
              400,
              "VALIDATION_ERROR",
              "Please fix the errors below",
            );
            (ae as unknown as { details: unknown[] }).details = Object.entries(
              errors,
            ).map(([p, i]) => ({
              path: p,
              issue: i,
            }));
            throw ae;
          }

          setLoading(true);
          try {
            const res = await api.login({ email, password });
            setSession({
              user: res.user,
              accessToken: res.tokens.accessToken,
              refreshToken: res.tokens.refreshToken,
            });
            router.push("/dashboard");
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ fieldErrors }) => (
          <>
            <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </FormField>
            <FormField
              label="Password"
              htmlFor="password"
              error={fieldErrors.password}
            >
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </FormField>
            <div className="text-right text-sm">
              <Link
                href="/forgot-password"
                className="text-brand-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </>
        )}
      </AuthForm>
    </AuthShell>
  );
}
