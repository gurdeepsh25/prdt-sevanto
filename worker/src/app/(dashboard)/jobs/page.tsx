"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getDefaultApi } from "@/lib/api";
import type {
  PublicCategoryListItem,
  PublicJobCard,
  PublicJobListResult,
} from "@sevanto/shared";
import type { JobUrgency } from "@sevanto/shared";

const URGENCY_OPTIONS: Array<JobUrgency | "ALL"> = [
  "ALL",
  "URGENT",
  "HIGH",
  "NORMAL",
  "LOW",
];

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "urgency:desc", label: "Most urgent" },
  { value: "budgetMax:desc", label: "Highest budget" },
  { value: "budgetMax:asc", label: "Lowest budget" },
  { value: "scheduledFor:asc", label: "Soonest scheduled" },
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

export default function JobsBrowsePage() {
  const [categories, setCategories] = useState<PublicCategoryListItem[]>([]);
  const [data, setData] = useState<PublicJobListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [urgency, setUrgency] = useState<JobUrgency | "ALL">("ALL");
  const [categoryId, setCategoryId] = useState<string>("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [sort, setSort] = useState<string>("createdAt:desc");
  const [page, setPage] = useState(1);

  // Load categories for the category filter
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

  // Load jobs whenever filters change
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
        urgency: urgency === "ALL" ? undefined : urgency,
        categoryId: categoryId || undefined,
        minBudget:
          minBudget === "" ? undefined : Math.round(Number(minBudget) * 100),
        maxBudget:
          maxBudget === "" ? undefined : Math.round(Number(maxBudget) * 100),
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
  }, [page, search, city, urgency, categoryId, minBudget, maxBudget, sort]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.pageSize));
  }, [data]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Browse open jobs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Find work in your neighborhood.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Search title / description"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={urgency}
            onChange={(e) => {
              setUrgency(e.target.value as JobUrgency | "ALL");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            {URGENCY_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u === "ALL" ? "Any urgency" : u.toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            type="number"
            min="0"
            placeholder="Min budget"
            value={minBudget}
            onChange={(e) => {
              setMinBudget(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <input
            type="number"
            min="0"
            placeholder="Max budget"
            value={maxBudget}
            onChange={(e) => {
              setMaxBudget(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
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
      {loading && <p className="text-sm text-slate-500">Loading jobs…</p>}

      {!loading && data && data.items.length === 0 && (
        <p className="rounded-lg bg-slate-100 px-4 py-6 text-center text-sm text-slate-600">
          No jobs match your filters yet.
        </p>
      )}

      {!loading && data && data.items.length > 0 && (
        <>
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * data.pageSize + 1}–
            {Math.min(page * data.pageSize, data.total)} of {data.total}
          </p>
          <ul className="space-y-3">
            {data.items.map((job) => (
              <JobCard key={job.id} job={job} />
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

function JobCard({ job }: { job: PublicJobCard }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300">
      <Link href={`/jobs/${job.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-900">
              {job.title}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {job.categoryName}
              {job.subcategoryName ? ` · ${job.subcategoryName}` : ""} ·{" "}
              {job.city} · {new Date(job.createdAt).toLocaleDateString()}
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
              ? `${job.currency} ${(job.budgetMin / 100).toFixed(0)}–${(
                  job.budgetMax / 100
                ).toFixed(0)}`
              : "Budget open"}
          </span>
          <span>{job.attachmentCount} attachments</span>
        </div>
      </Link>
    </li>
  );
}
