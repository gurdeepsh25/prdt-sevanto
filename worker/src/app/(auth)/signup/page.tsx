"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  validateEmail,
  validatePassword,
  validateFullName,
  ApiError,
} from "@sevanto/shared";
import { useAuthStore } from "@/stores/auth";
import { useApi } from "@/hooks/use-api";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const api = useApi();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);

  return (
    <AuthShell
      title="Join Sevanto as a worker"
      subtitle="Get discovered by customers near you."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-600 hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <AuthForm
        submitLabel="Create worker account"
        loading={loading}
        onSubmit={async (e) => {
          const fd = new FormData(e.currentTarget);
          const email = String(fd.get("email") ?? "");
          const password = String(fd.get("password") ?? "");
          const fullName = String(fd.get("fullName") ?? "");
          const errors: Record<string, string> = {};
          const e1 = validateEmail(email);
          if (e1) errors.email = e1;
          const e2 = validatePassword(password);
          if (e2) errors.password = e2;
          const e3 = validateFullName(fullName);
          if (e3) errors.fullName = e3;
          if (Object.keys(errors).length > 0) {
            const ae = new ApiError(
              400,
              "VALIDATION_ERROR",
              "Please fix the errors below",
            );
            (ae as unknown as { details: unknown[] }).details = Object.entries(
              errors,
            ).map(([p, i]) => ({ path: p, issue: i }));
            throw ae;
          }
          setLoading(true);
          try {
            const res = await api.signup({
              email,
              password,
              fullName,
              role: "WORKER",
            });
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
            <FormField
              label="Full name"
              htmlFor="fullName"
              error={fieldErrors.fullName}
            >
              <Input
                id="fullName"
                name="fullName"
                autoComplete="name"
                required
              />
            </FormField>
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
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
              You're signing up as a <strong>Worker</strong>.
            </p>
          </>
        )}
      </AuthForm>
    </AuthShell>
  );
}
