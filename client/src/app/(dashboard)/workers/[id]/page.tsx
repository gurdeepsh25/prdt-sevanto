"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDefaultApi } from "@/lib/api";
import type { PublicWorkerDetail } from "@sevanto/shared";

export default function WorkerDetailPage() {
  const params = useParams<{ id: string }>();
  const [worker, setWorker] = useState<PublicWorkerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDefaultApi()
      .getPublicWorker(params.id)
      .then((res) => {
        if (!cancelled) setWorker(res);
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
  }, [params?.id]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading worker…</p>;
  }
  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    );
  }
  if (!worker) return null;

  return (
    <article className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {worker.fullName}
              {worker.isVerified && (
                <span className="ml-3 align-middle rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Verified
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {worker.city} · {worker.yearsExperience} years experience
            </p>
            <p className="mt-3 text-base text-slate-800">{worker.headline}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              {worker.avgRating.toFixed(1)}
              <span className="ml-1 text-sm text-amber-500">★</span>
            </p>
            <p className="text-xs text-slate-500">
              {worker.totalReviews} reviews
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-4">
          <Stat label="Jobs completed" value={String(worker.totalJobsCompleted)} />
          <Stat
            label="Hourly rate"
            value={
              worker.hourlyRate !== null
                ? `₹${(worker.hourlyRate / 100).toFixed(0)}/hr`
                : "—"
            }
          />
          <Stat label="Service radius" value={`${worker.serviceRadiusKm} km`} />
          <Stat label="Skills" value={String(worker.skills.length)} />
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">About</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
          {worker.bio}
        </p>
      </section>

      {worker.skills.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {worker.skills.map((s) => (
              <span
                key={`${s.name}-${s.level}`}
                className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
              >
                {s.name} · {s.level.toLowerCase()}
              </span>
            ))}
          </div>
        </section>
      )}

      {worker.portfolio.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Portfolio</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {worker.portfolio.map((item) => (
              <figure
                key={item.id}
                className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.caption ?? "Portfolio item"}
                  className="h-40 w-full object-cover"
                />
                {item.caption && (
                  <figcaption className="px-3 py-2 text-xs text-slate-600">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}