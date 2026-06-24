"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import type { MyWorkerPortfolioItem } from "@sevanto/shared";

export default function PortfolioPage() {
  const api = useApi();
  const [items, setItems] = useState<MyWorkerPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");

  async function load() {
    setLoading(true);
    try {
      // We piggy-back on getMyWorkerProfile which already returns portfolio.
      const me = await api.getMyWorkerProfile();
      setItems(me.portfolio);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load";
      if (!message.toLowerCase().includes("not yet created")) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!imageUrl.trim()) {
      setError("Image URL is required");
      return;
    }
    setSubmitting(true);
    try {
      await api.addMyPortfolioItem({
        imageUrl: imageUrl.trim(),
        caption: caption.trim() || null,
        sortOrder: items.length,
      });
      setImageUrl("");
      setCaption("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this portfolio item?")) return;
    try {
      await api.deleteMyPortfolioItem(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Portfolio</h1>
        <p className="mt-1 text-sm text-slate-600">
          Showcase your best work to win more jobs.
        </p>
      </header>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_2fr_auto]"
      >
        <input
          type="url"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <input
          type="text"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-slate-300"
        >
          {submitting ? "Adding…" : "Add"}
        </button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-lg bg-slate-100 px-4 py-6 text-center text-sm text-slate-600">
          No portfolio items yet. Add your first one above.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure
              key={item.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.caption ?? "Portfolio item"}
                className="h-40 w-full object-cover"
              />
              <figcaption className="flex items-center justify-between px-3 py-2">
                <p className="truncate text-xs text-slate-600">
                  {item.caption ?? <span className="italic text-slate-400">No caption</span>}
                </p>
                <button
                  type="button"
                  onClick={() => void handleDelete(item.id)}
                  className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}