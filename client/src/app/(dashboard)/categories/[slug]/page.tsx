"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getDefaultApi } from "@/lib/api";
import type { CategoryWithSubs } from "@sevanto/shared";

export default function CategoryDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [data, setData] = useState<CategoryWithSubs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDefaultApi()
      .getCategoryBySlug(slug)
      .then((res) => {
        if (!cancelled) setData(res.category);
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
  }, [slug]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/categories"
          className="text-xs text-brand-600 hover:underline"
        >
          ← All categories
        </Link>
      </div>

      {loading && (
        <p className="text-sm text-slate-500">Loading category…</p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {data && (
        <>
          <header>
            <h1 className="text-2xl font-bold text-slate-900">{data.name}</h1>
            {data.description && (
              <p className="mt-1 text-sm text-slate-600">{data.description}</p>
            )}
          </header>

          <section>
            <h2 className="text-sm font-semibold text-slate-700">
              Subcategories
            </h2>
            {data.subcategories.length === 0 ? (
              <p className="mt-2 rounded-lg bg-slate-100 px-4 py-6 text-center text-sm text-slate-600">
                No subcategories yet for this category.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/workers?subcategory=${sub.id}`}
                    className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {sub.name}
                    </p>
                    {sub.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                        {sub.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <Link
              href={`/workers?category=${encodeURIComponent(data.slug)}`}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              See all workers in {data.name} →
            </Link>
          </section>
        </>
      )}
    </div>
  );
}