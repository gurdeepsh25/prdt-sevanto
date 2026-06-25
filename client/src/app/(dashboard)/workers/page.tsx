"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDefaultApi } from "@/lib/api";
import type { PublicWorkerCard, PublicWorkerList } from "@sevanto/shared";

const PAGE_SIZE = 12;

export default function WorkersListPage() {
  const [data, setData] = useState<PublicWorkerList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skill, setSkill] = useState("");
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDefaultApi()
      .listPublicWorkers({
        page,
        pageSize: PAGE_SIZE,
        skill: skill || undefined,
        city: city || undefined,
        minRating: minRating > 0 ? minRating : undefined,
        verifiedOnly: verifiedOnly || undefined,
        sort: "avgRating:desc",
      })
      .then((res) => {
        if (!cancelled) setData(res);
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
  }, [page, skill, city, minRating, verifiedOnly]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Find workers</h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse verified professionals in your city.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Filter by skill (e.g. plumbing)"
            value={skill}
            onChange={(e) => {
              setSkill(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <select
            value={minRating}
            onChange={(e) => {
              setMinRating(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            <option value={0}>Any rating</option>
            <option value={3}>3+ stars</option>
            <option value={4}>4+ stars</option>
            <option value={4.5}>4.5+ stars</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => {
                setVerifiedOnly(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Verified only
          </label>
        </div>
      </section>

      {loading && <p className="text-sm text-slate-500">Loading workers…</p>}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {data && data.items.length === 0 && !loading && (
        <p className="rounded-lg bg-slate-100 px-4 py-6 text-center text-sm text-slate-600">
          No workers match your filters yet. Try widening your search.
        </p>
      )}
      {data && data.items.length > 0 && (
        <>
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, data.total)} of {data.total}
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((w) => (
              <WorkerCard key={w.id} worker={w} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function WorkerCard({ worker }: { worker: PublicWorkerCard }) {
  return (
    <Link
      href={`/workers/${worker.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {worker.fullName}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">{worker.city}</p>
        </div>
        {worker.isVerified && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Verified
          </span>
        )}
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-700">
        {worker.headline}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {worker.skills.slice(0, 4).map((s) => (
          <span
            key={`${s.name}-${s.level}`}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
          >
            {s.name}
          </span>
        ))}
        {worker.skills.length > 4 && (
          <span className="text-xs text-slate-500">
            +{worker.skills.length - 4}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
        <span>
          {worker.avgRating.toFixed(1)} ★ · {worker.totalReviews} reviews
        </span>
        <span>{worker.yearsExperience} yrs exp</span>
      </div>
    </Link>
  );
}
