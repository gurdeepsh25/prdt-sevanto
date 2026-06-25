"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getDefaultApi } from "@/lib/api";
import type {
  PublicCategoryListItem,
  PublicJobCard,
  PublicJobListResult,
  JobUrgency,
} from "@sevanto/shared";

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "urgency:desc", label: "Most urgent" },
  { value: "budgetMax:desc", label: "Highest budget" },
  { value: "budgetMax:asc", label: "Lowest budget" },
] as const;

function urgencyBadge(u: JobUrgency): string {
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

export default function PublicJobsBrowsePage() {
  const [categories, setCategories] = useState<PublicCategoryListItem[]>([]);
  const [data, setData] = useState<PublicJobListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [urgency, setUrgency] = useState<JobUrgency | "">("");
  const [categorySlug, setCategorySlug] = useState("");
  const [sort, setSort] = useState<string>("createdAt:desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    getDefaultApi()
      .listCategories()
      .then((res) => {
        if (!cancelled) setCategories(res.items);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDefaultApi()
      .listPublicJobs({
        page,
        pageSize: 12,
        search: search || undefined,
        city: city || undefined,
        urgency: urgency || undefined,
        categorySlug: categorySlug || undefined,
        sort: sort as
          | "createdAt:desc"
          | "createdAt:asc"
          | "urgency:desc"
          | "budgetMax:desc"
          | "budgetMax:asc"
          | "scheduledFor:asc",
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
  }, [page, search, city, urgency, categorySlug, sort]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  }, [data]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Open jobs near you
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse what other customers are requesting. Use the filters to narrow
          by category, city, urgency, or budget.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={categorySlug}
            onChange={(e) => {
              setCategorySlug(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={urgency}
            onChange={(e) => {
              setUrgency(e.target.value as JobUrgency | "");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Any urgency</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div className="mt-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {!loading && data && data.items.length === 0 && (
        <p className="rounded-lg bg-slate-100 px-4 py-6 text-center text-sm text-slate-600">
          No jobs match your filters yet.
        </p>
      )}

      {!loading && data && data.items.length > 0 && (
        <>
          <p className="text-xs text-slate-500">{data.total} open</p>
          <ul className="space-y-3">
            {data.items.map((job) => (
              <li
                key={job.id}
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300"
              >
                <Link href={`/jobs/${job.id}`} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-900">
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
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${urgencyBadge(
                        job.urgency,
                      )}`}
                    >
                      {job.urgency}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      {job.budgetMin !== null && job.budgetMax !== null
                        ? `${job.currency} ${(job.budgetMin / 100).toFixed(0)}–${(job.budgetMax / 100).toFixed(0)}`
                        : "Budget open"}
                    </span>
                    <span>{job.attachmentCount} attachments</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
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
