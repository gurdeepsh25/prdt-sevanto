"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import type { AdminJobRow, JobStatus } from "@sevanto/shared";

const STATUS_FILTERS: Array<JobStatus | "ALL"> = [
  "ALL",
  "DRAFT",
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
];

function badge(s: JobStatus): string {
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

export default function AdminJobsPage() {
  const api = useApi();
  const [items, setItems] = useState<AdminJobRow[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<JobStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminListJobs({
        status: status === "ALL" ? undefined : status,
        pageSize: 50,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">All jobs</h1>
        <p className="mt-1 text-sm text-slate-600">
          Read-only overview of customer job posts. Moderation actions come in a
          later phase.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
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
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="rounded-lg bg-slate-100 px-4 py-6 text-center text-sm text-slate-600">
          No jobs match this filter.
        </p>
      )}

      {!loading && items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">City</th>
                <th className="px-3 py-2">Budget</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Urgency</th>
                <th className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50">
                  <td className="max-w-xs truncate px-3 py-2 font-medium text-slate-900">
                    {j.title}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    <div>{j.customerName}</div>
                    <div className="text-slate-500">{j.customerEmail}</div>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    {j.categoryName}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">{j.city}</td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    {j.budgetMin !== null && j.budgetMax !== null
                      ? `${j.currency} ${(j.budgetMin / 100).toFixed(0)}–${(j.budgetMax / 100).toFixed(0)}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge(
                        j.status,
                      )}`}
                    >
                      {j.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    {j.urgency}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {new Date(j.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Showing {items.length} of {total}
          </p>
        </div>
      )}
    </div>
  );
}
