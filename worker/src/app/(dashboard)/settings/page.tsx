"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth";
import { validatePassword } from "@sevanto/shared";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const router = useRouter();
  const api = useApi();
  const clear = useAuthStore((s) => s.clear);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    const pwErr = validatePassword(newPassword);
    if (pwErr) {
      setError(pwErr);
      return;
    }
    setSaving(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    if (!confirm("Delete your account? This cannot be undone.")) return;
    try {
      await api.deleteAccount(refreshToken ?? undefined);
    } catch {}
    clear();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-10">
      <h1 className="text-2xl font-bold">Settings</h1>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Change password</h2>
        <form onSubmit={changePassword} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Password updated.
            </div>
          )}
          <FormField label="Current password" htmlFor="current">
            <Input
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </FormField>
          <FormField
            label="New password"
            htmlFor="new"
            hint="Min 8 characters, letters and numbers."
          >
            <Input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Confirm new password" htmlFor="confirm">
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </FormField>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-slate-300"
          >
            {saving && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            Update password
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="text-lg font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-sm text-slate-700">
          Deleting soft-deletes your profile, anonymizes PII, and revokes
          sessions.
        </p>
        <button
          onClick={deleteAccount}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Delete my account
        </button>
      </section>
    </div>
  );
}
