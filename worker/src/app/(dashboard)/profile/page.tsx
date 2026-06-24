"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth";
import { validatePassword } from "@sevanto/shared";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

const E164_RE = /^\+[1-9]\d{6,14}$/;

export default function ProfilePage() {
  const api = useApi();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getMe();
        setUser(res.user);
        setFullName(res.user.fullName);
        setPhone(res.user.phone ?? "");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (fullName.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (phone && !E164_RE.test(phone)) {
      setError("Phone must be in E.164 format (e.g. +919876543210)");
      return;
    }
    setSaving(true);
    try {
      const res = await api.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || null,
      });
      setUser(res.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-8 text-slate-500">Loading profile…</p>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-slate-600">
        Update your personal information.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Profile saved.
          </div>
        )}
        <FormField
          label="Email"
          htmlFor="email"
          hint="Contact support to change your email."
        >
          <Input
            id="email"
            value={useAuthStore.getState().user?.email ?? ""}
            disabled
          />
        </FormField>
        <FormField label="Full name" htmlFor="fullName">
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </FormField>
        <FormField
          label="Phone"
          htmlFor="phone"
          hint="E.164 format with leading + and country code."
        >
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
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
          Save changes
        </button>
      </form>
    </div>
  );
}
