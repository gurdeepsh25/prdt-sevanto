"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDefaultApi } from "@/lib/api";
import type { PublicCategoryListItem } from "@sevanto/shared";

export default function CategoriesPage() {
  const [items, setItems] = useState<PublicCategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDefaultApi()
      .listCategories()
      .then((res) => {
        if (!cancelled) setItems(res.items);
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
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Browse categories</h1>
        <p className="mt-1 text-sm text-slate-600">
          Pick a service category to discover workers near you.
        </p>
      </header>

      {loading && (
        <p className="text-sm text-slate-500">Loading categories…</p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="rounded-lg bg-slate-100 px-4 py-6 text-center text-sm text-slate-600">
          No categories are available yet.
        </p>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md"
            >
              <h2 className="text-base font-semibold text-slate-900">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  {cat.description}
                </p>
              )}
              <p className="mt-3 text-xs text-slate-500">
                {cat.subcategoriesCount} subcategor
                {cat.subcategoriesCount === 1 ? "y" : "ies"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}