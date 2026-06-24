"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ApiError } from "@sevanto/shared";
import { cn } from "@/lib/utils";

export type FieldErrors = Record<string, string | undefined>;

export function AuthForm({
  onSubmit,
  children,
  submitLabel = "Submit",
  loading,
  className,
}: {
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> | void;
  children: (h: { fieldErrors: FieldErrors }) => ReactNode;
  submitLabel?: string;
  loading?: boolean;
  className?: string;
}) {
  const [topError, setTopError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTopError(null);
    setFieldErrors({});
    try {
      await onSubmit(e);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details) {
          const map: FieldErrors = {};
          for (const d of err.details) if (d.path) map[d.path] = d.issue;
          setFieldErrors(map);
        }
        setTopError(err.message);
      } else if (err instanceof Error) {
        setTopError(err.message);
      } else {
        setTopError("Something went wrong");
      }
    }
  }

  return (
    <form onSubmit={handle} className={cn("space-y-4", className)} noValidate>
      {topError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {topError}
        </div>
      )}
      {children({ fieldErrors })}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-slate-300"
      >
        {loading && (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {submitLabel}
      </button>
    </form>
  );
}
