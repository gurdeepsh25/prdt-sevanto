"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getDefaultApi } from "@/lib/api";
import type { JobDetail } from "@sevanto/shared";

function statusBadge(s: JobDetail["status"]): string {
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

const STATUS_TIMELINE: Array<JobDetail["status"]> = [
  "DRAFT",
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
];

export default function MyJobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newAttachment, setNewAttachment] = useState("");

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getDefaultApi().getMyJob(id);
      setJob(res.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function cancel() {
    if (!job) return;
    const reason = prompt("Optional reason for cancelling:");
    setBusy(true);
    try {
      await getDefaultApi().cancelMyJob(job.id, {
        reason: reason ?? undefined,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    if (!job) return;
    if (
      !confirm("Soft-delete this job? It will no longer appear in your list.")
    )
      return;
    setBusy(true);
    try {
      await getDefaultApi().deleteMyJob(job.id);
      window.location.href = "/my-jobs";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function addAttachment() {
    if (!job || !newAttachment) return;
    setBusy(true);
    try {
      await getDefaultApi().addJobAttachment(job.id, {
        url: newAttachment,
      });
      setNewAttachment("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeAttachment(attachmentId: string) {
    if (!job) return;
    setBusy(true);
    try {
      await getDefaultApi().deleteJobAttachment(job.id, attachmentId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error)
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    );
  if (!job) return <p className="text-sm text-slate-500">Job not found.</p>;

  const cancellable =
    job.status === "DRAFT" ||
    job.status === "OPEN" ||
    job.status === "ASSIGNED" ||
    job.status === "IN_PROGRESS";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/my-jobs"
          className="text-xs text-brand-600 hover:underline"
        >
          ← All my jobs
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
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge(
            job.status,
          )}`}
        >
          {job.status.replace("_", " ")}
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
        <Stat label="Urgency" value={job.urgency} />
        <Stat
          label="Scheduled"
          value={
            job.scheduledFor ? new Date(job.scheduledFor).toLocaleString() : "—"
          }
        />
        <Stat
          label="Created"
          value={new Date(job.createdAt).toLocaleDateString()}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">
          Status timeline
        </h2>
        <ol className="mt-3 flex flex-wrap gap-2 text-xs">
          {STATUS_TIMELINE.map((s) => {
            const reachedIdx = STATUS_TIMELINE.indexOf(job.status);
            const myIdx = STATUS_TIMELINE.indexOf(s);
            const reached =
              job.status !== "CANCELLED" &&
              job.status !== "EXPIRED" &&
              reachedIdx >= myIdx;
            return (
              <li
                key={s}
                className={`rounded-full px-3 py-1 font-medium ${
                  reached
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {s.replace("_", " ")}
              </li>
            );
          })}
        </ol>
        {job.status === "CANCELLED" && (
          <p className="mt-3 text-xs text-rose-700">
            Cancelled
            {job.cancelReason ? ` — ${job.cancelReason}` : ""}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">
          Attachments ({job.attachments.length})
        </h2>
        {job.attachments.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">No attachments.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {job.attachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5 text-xs"
              >
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-brand-600 underline"
                >
                  {a.caption || a.url}
                </a>
                <button
                  type="button"
                  onClick={() => void removeAttachment(a.id)}
                  className="text-rose-600 hover:underline"
                  disabled={busy}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        {job.status === "DRAFT" || job.status === "OPEN" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void addAttachment();
            }}
            className="mt-3 flex gap-2"
          >
            <input
              type="url"
              placeholder="Attachment URL"
              value={newAttachment}
              onChange={(e) => setNewAttachment(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
            />
            <button
              type="submit"
              disabled={busy || !newAttachment}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              Add
            </button>
          </form>
        ) : null}
      </section>

      <section className="flex flex-wrap gap-2">
        {cancellable && (
          <button
            type="button"
            onClick={() => void cancel()}
            disabled={busy}
            className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
          >
            Cancel job
          </button>
        )}
        {(job.status === "DRAFT" || job.status === "OPEN") && (
          <button
            type="button"
            onClick={() => void del()}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Delete
          </button>
        )}
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
