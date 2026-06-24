"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import type { User } from "@sevanto/shared";

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const api = useApi();
  const id = String(params.id ?? "");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminGetUser(id);
      setUser(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [id]);

  async function toggleSuspend() {
    if (!user) return;
    if (user.role === "ADMIN") return;
    const next = !user.isActive;
    const msg = next ? "Suspend this user?" : "Reactivate this user?";
    if (!confirm(msg)) return;
    setActionPending(true);
    try {
      const res = await api.adminUpdateUser(user.id, { isActive: next });
      setUser(res.user);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={() => router.push("/users")}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to users
      </button>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading…</p>
      ) : error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : user ? (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h1 className="text-xl font-bold text-slate-900">
              {user.fullName}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{user.email}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Detail label="Role" value={user.role} />
              <Detail
                label="Status"
                value={user.isActive ? "Active" : "Suspended"}
              />
              <Detail label="Phone" value={user.phone ?? "—"} />
              <Detail
                label="Email verified"
                value={user.isEmailVerified ? "Yes" : "No"}
              />
              <Detail
                label="Joined"
                value={new Date(user.createdAt).toLocaleString()}
              />
              <Detail label="User ID" value={user.id} mono />
            </dl>
          </div>

          {user.role !== "ADMIN" && (
            <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6">
              <h2 className="text-sm font-semibold text-red-700">Moderation</h2>
              <p className="mt-1 text-sm text-slate-700">
                Suspending will revoke all active sessions and block future
                logins.
              </p>
              <button
                disabled={actionPending}
                onClick={toggleSuspend}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionPending
                  ? "Working…"
                  : user.isActive
                    ? "Suspend user"
                    : "Reactivate user"}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs uppercase text-slate-500">{label}</dt>
      <dd
        className={
          mono
            ? "mt-0.5 font-mono text-xs text-slate-700"
            : "mt-0.5 text-sm text-slate-800"
        }
      >
        {value}
      </dd>
    </div>
  );
}
