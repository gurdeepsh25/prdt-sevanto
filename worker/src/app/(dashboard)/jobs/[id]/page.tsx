"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getDefaultApi } from "@/lib/api";
import type { JobDetail } from "@sevanto/shared";

function urgencyBadge(u: JobDetail["urgency"]): string {
  switch (u) {
    case "URGENT":
      return "bg-rose-50 text-rose-700";
    case "HIGH":
      return "bg-orange-50 text-orange-700";
    case "NORMAL":
      return "bg-slate-100 text-slate-700";
    case "LOW":
      return "bg-sky-50 text-sky-700";
  }
}

export default function PublicJobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDefaultApi()
      .getPublicJob(id)
      .then((res) => {
        if (!cancelled) setJob(res.job);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error)
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    );
  if (!job) return <p className="text-sm text-slate-500">Job not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/jobs" className="text-xs text-brand-600 hover:underline">
          ← All open jobs
        </Link>
      </div>

      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {job.categoryName}
            {job.subcategoryName ? ` · ${job.subcategoryName}` : ""} ·{" "}
            {job.city}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${urgencyBadge(
            job.urgency,
          )}`}
        >
          {job.urgency}
        </span>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
          {job.description}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat
          label="Budget"
          value={
            job.budgetMin !== null && job.budgetMax !== null
              ? `${job.currency} ${(job.budgetMin / 100).toFixed(0)}–${(job.budgetMax / 100).toFixed(0)}`
              : "Open"
          }
        />
        <Stat label="City" value={job.city} />
        <Stat
          label="Scheduled"
          value={
            job.scheduledFor ? new Date(job.scheduledFor).toLocaleString() : "—"
          }
        />
        <Stat
          label="Posted"
          value={new Date(job.createdAt).toLocaleDateString()}
        />
      </section>

      {job.attachments.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Reference attachments
          </h2>
          <ul className="mt-2 space-y-1">
            {job.attachments.map((a) => (
              <li key={a.id} className="flex items-center gap-2 text-xs">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-brand-600 underline"
                >
                  {a.caption || a.url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <strong className="block">Apply to this job</strong>
        Job applications ship in Phase 7. Until then, contact the customer via
        the in-app messaging introduced in Phase 15.
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
