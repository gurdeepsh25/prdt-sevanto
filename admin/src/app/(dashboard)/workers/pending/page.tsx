"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import type { PendingWorkerQueue } from "@sevanto/shared";

export default function PendingWorkersPage() {
  const api = useApi();
  const [data, setData] = useState<PendingWorkerQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminListPendingWorkers();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVerify(profileId: string) {
    setBusyId(profileId);
    try {
      await api.adminVerifyWorker(profileId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Worker verification queue
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review worker profiles and approve legitimate service providers.
        </p>
      </header>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading queue…</p>
      ) : data && data.items.length === 0 ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-800">
          Queue is clear — no pending worker profiles.
        </p>
      ) : (
        data && (
          <>
            <p className="text-xs text-slate-500">
              {data.items.length} pending
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Headline</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Completeness</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.items.map((w) => (
                    <tr key={w.profileId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {w.fullName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{w.email}</td>
                      <td className="px-4 py-3 text-slate-600">{w.city}</td>
                      <td className="px-4 py-3 text-slate-600">{w.headline}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {w.yearsExperience} yrs
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {w.hourlyRate !== null
                          ? `₹${(w.hourlyRate / 100).toFixed(0)}/hr`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            w.completeness >= 100
                              ? "bg-emerald-50 text-emerald-700"
                              : w.completeness >= 50
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {w.completeness}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={busyId === w.profileId}
                          onClick={() => void handleVerify(w.profileId)}
                          className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:bg-slate-300"
                        >
                          {busyId === w.profileId ? "…" : "Verify"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </div>
  );
}
