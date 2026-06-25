"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDefaultApi } from "@/lib/api";
import type { JobListResult, JobStatus } from "@sevanto/shared";

const STATUS_FILTERS: Array<JobStatus | "ALL"> = [
  "ALL",
  "DRAFT",
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

function statusBadge(s: JobStatus): string {
  switch (s) {
    case "DRAFT":
      return "bg-slate-100 text-slate-700";
    case "OPEN":
      return "bg-emerald-50 text-emerald-700";
    case "ASSIGNED":
      return "bg-sky-50 text-sky-700";
    case "IN_PROGRESS":
      return "bg-indigo-50 text-indigo-700";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700";
    case "EXPIRED":
      return "bg-amber-50 text-amber-800";
  }
}

export default function MyJobsPage() {
  const [data, setData] = useState<JobListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDefaultApi()
      .listMyJobs({
        status: status === "ALL" ? undefined : status,
        page,
        pageSize: 20,
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
  }, [status, page]);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My jobs</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track jobs you have posted. Cancel or edit while they are still
            open.
          </p>
        </div>
        <Link
          href="/my-jobs/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Post a new job
        </Link>
      </header>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              status === s
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {s.replace("_", " ").toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {loading && <p className="text-sm text-slate-500">Loading jobs…</p>}
      {!loading && data && data.items.length === 0 && (
        <p className="rounded-lg bg-slate-100 px-4 py-6 text-center text-sm text-slate-600">
          You haven&apos;t posted any jobs yet. Try posting one.
        </p>
      )}

      {!loading && data && data.items.length > 0 && (
        <>
          <p className="text-xs text-slate-500">{data.total} total</p>
          <ul className="space-y-3">
            {data.items.map((job) => (
              <li
                key={job.id}
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300"
              >
                <Link href={`/my-jobs/${job.id}`} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {job.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {job.categoryName}
                        {job.subcategoryName
                          ? ` · ${job.subcategoryName}`
                          : ""}{" "}
                        · {job.city} ·{" "}
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusBadge(
                        job.status,
                      )}`}
                    >
                      {job.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      {job.budgetMin !== null && job.budgetMax !== null
                        ? `${job.currency} ${(job.budgetMin / 100).toFixed(
                            0,
                          )}–${(job.budgetMax / 100).toFixed(0)}`
                        : "Budget open"}
                    </span>
                    <span>{job.attachmentCount} attachments</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {data.total > data.pageSize && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * data.pageSize >= data.total}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
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
