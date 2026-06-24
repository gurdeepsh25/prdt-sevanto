"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import type { MyWorkerProfileResponse } from "@sevanto/shared";

export default function WorkerProfilePage() {
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<MyWorkerProfileResponse | null>(null);

  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState(0);
  const [hourlyRateRupees, setHourlyRateRupees] = useState("");
  const [city, setCity] = useState("");
  const [serviceRadiusKm, setServiceRadiusKm] = useState(10);

  async function load() {
    setLoading(true);
    try {
      const res = await api.getMyWorkerProfile();
      setData(res);
      setHeadline(res.profile.headline);
      setBio(res.profile.bio);
      setYearsExperience(res.profile.yearsExperience);
      setHourlyRateRupees(
        res.profile.hourlyRate !== null
          ? (res.profile.hourlyRate / 100).toFixed(0)
          : "",
      );
      setCity(res.profile.city);
      setServiceRadiusKm(res.profile.serviceRadiusKm);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load";
      if (!message.toLowerCase().includes("not yet created")) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (headline.trim().length < 5) {
      setError("Headline must be at least 5 characters");
      return;
    }
    if (bio.trim().length < 50) {
      setError("Bio must be at least 50 characters so customers can learn about you");
      return;
    }
    if (city.trim().length < 2) {
      setError("City is required");
      return;
    }
    if (hourlyRateRupees.trim() !== "" && (isNaN(parseFloat(hourlyRateRupees)) || parseFloat(hourlyRateRupees) < 0)) {
      setError("Hourly rate must be a positive number or empty");
      return;
    }

    const hourlyRateMinor =
      hourlyRateRupees.trim() === ""
        ? null
        : Math.round(parseFloat(hourlyRateRupees) * 100);

    setSaving(true);
    try {
      const res = await api.upsertMyWorkerProfile({
        headline: headline.trim(),
        bio: bio.trim(),
        yearsExperience: Math.max(0, Math.floor(yearsExperience)),
        hourlyRate: hourlyRateMinor,
        city: city.trim(),
        serviceRadiusKm: Math.max(1, Math.floor(serviceRadiusKm)),
      });
      setData(res);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Worker profile</h1>
          <p className="mt-1 text-sm text-slate-600">
            Show customers who you are, what you do, and where you work.
          </p>
        </div>
        {data && <CompletenessBar value={data.completeness} verified={data.profile.isVerified} />}
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {success && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Saved. Your profile is up to date.
          </p>
        )}

        <Field label="Headline" htmlFor="headline" hint="One short sentence about your specialty.">
          <input
            id="headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </Field>

        <Field
          label="Bio"
          htmlFor="bio"
          hint="At least 50 characters. Describe your experience, tools, and approach."
        >
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={6}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <p className="mt-1 text-xs text-slate-500">{bio.length} characters</p>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Years of experience" htmlFor="years">
            <input
              id="years"
              type="number"
              min={0}
              max={70}
              value={yearsExperience}
              onChange={(e) => setYearsExperience(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>
          <Field label="Hourly rate (₹)" htmlFor="rate" hint="Optional. Leave empty to hide.">
            <input
              id="rate"
              type="number"
              min={0}
              step={1}
              value={hourlyRateRupees}
              onChange={(e) => setHourlyRateRupees(e.target.value)}
              placeholder="500"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="City" htmlFor="city">
            <input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>
          <Field label="Service radius (km)" htmlFor="radius">
            <input
              id="radius"
              type="number"
              min={1}
              max={500}
              value={serviceRadiusKm}
              onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-slate-300"
        >
          {saving && (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {data ? "Save changes" : "Create profile"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      <div className="mt-1">{children}</div>
    </div>
  );
}

function CompletenessBar({ value, verified }: { value: number; verified: boolean }) {
  const tone = value >= 100 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="text-right">
      <p className="text-xs uppercase tracking-wide text-slate-500">Profile completeness</p>
      <p className="mt-0.5 text-xl font-bold text-slate-900">{value}%</p>
      <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
      {verified && (
        <p className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          Verified
        </p>
      )}
    </div>
  );
}