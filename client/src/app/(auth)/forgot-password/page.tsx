"use client";

import Link from "next/link";
import { useState } from "react";
import { validateEmail } from "@sevanto/shared";
import { useApi } from "@/hooks/use-api";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const api = useApi();
  const [submitted, setSubmitted] = useState(false);

  return (
    <AuthShell
      title="Forgot password"
      subtitle="We'll email you a link to reset your password."
      footer={
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:underline"
        >
          Back to log in
        </Link>
      }
    >
      {submitted ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          If an account exists for that email, we've sent a reset link.
        </div>
      ) : (
        <AuthForm
          submitLabel="Send reset link"
          onSubmit={async (e) => {
            const fd = new FormData(e.currentTarget);
            const email = String(fd.get("email") ?? "");
            const err = validateEmail(email);
            if (err) {
              const ae = new Error(err);
              (ae as Error & { details?: unknown }).details = [
                { path: "email", issue: err },
              ];
              throw ae;
            }
            await api.forgotPassword({ email });
            setSubmitted(true);
          }}
        >
          {({ fieldErrors }) => (
            <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </FormField>
          )}
        </AuthForm>
      )}
    </AuthShell>
  );
}
