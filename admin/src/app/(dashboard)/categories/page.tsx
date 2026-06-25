"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import type {
  CategoryWithSubs,
  SubcategoryRef,
} from "@sevanto/shared";

export default function AdminCategoriesPage() {
  const api = useApi();
  const [items, setItems] = useState<CategoryWithSubs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ name: "", iconKey: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminListCategories();
      setItems(res.items);
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

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    setBusy(true);
    try {
      await api.adminCreateCategory({
        name: newCat.name.trim(),
        iconKey: newCat.iconKey.trim() || null,
      });
      setNewCat({ name: "", iconKey: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(cat: CategoryWithSubs) {
    try {
      await api.adminUpdateCategory(cat.id, { isActive: !cat.isActive });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function addSub(cat: CategoryWithSubs, name: string) {
    if (!name.trim()) return;
    try {
      await api.adminAddSubcategory(cat.id, { name: name.trim() });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add subcategory");
    }
  }

  async function toggleSub(sub: SubcategoryRef, active: boolean) {
    try {
      await api.adminUpdateSubcategory(sub.id, { isActive: !active });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Job categories</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage the category tree used to filter workers and jobs.
        </p>
      </header>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form
        onSubmit={createCategory}
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <h2 className="text-sm font-semibold text-slate-800">New category</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Name (e.g. Pet Care)"
            value={newCat.name}
            onChange={(e) =>
              setNewCat((p) => ({ ...p, name: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <input
            type="text"
            placeholder="Icon key (optional)"
            value={newCat.iconKey}
            onChange={(e) =>
              setNewCat((p) => ({ ...p, iconKey: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <button
            type="submit"
            disabled={busy || !newCat.name.trim()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create category"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-lg bg-slate-100 px-4 py-6 text-center text-sm text-slate-600">
          No categories yet. Create one above to get started.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((cat) => (
            <CategoryRow
              key={cat.id}
              cat={cat}
              onToggleActive={() => void toggleActive(cat)}
              onAddSub={(name) => void addSub(cat, name)}
              onToggleSub={(sub, active) => void toggleSub(sub, active)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryRow({
  cat,
  onToggleActive,
  onAddSub,
  onToggleSub,
}: {
  cat: CategoryWithSubs;
  onToggleActive: () => void;
  onAddSub: (name: string) => void;
  onToggleSub: (sub: SubcategoryRef, active: boolean) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const isActive = (cat as CategoryWithSubs & { isActive?: boolean })
    .isActive ?? true;

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{cat.name}</p>
          <p className="text-xs text-slate-500">/{cat.slug}</p>
        </div>
        <button
          type="button"
          onClick={onToggleActive}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </button>
      </div>

      <div className="mt-3 space-y-1.5">
        {cat.subcategories.length === 0 ? (
          <p className="text-xs text-slate-500">No subcategories yet.</p>
        ) : (
          cat.subcategories.map((sub) => {
            const subActive = (sub as SubcategoryRef & { isActive?: boolean })
              .isActive ?? true;
            return (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5"
              >
                <span className="text-sm text-slate-700">{sub.name}</span>
                <button
                  type="button"
                  onClick={() => onToggleSub(sub, subActive)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    subActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {subActive ? "Active" : "Inactive"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAddSub(name);
            setName("");
            setAdding(false);
          }}
          className="mt-3 flex gap-2"
        >
          <input
            type="text"
            placeholder="Subcategory name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 text-xs font-medium text-brand-600 hover:underline"
        >
          + Add subcategory
        </button>
      )}
    </li>
  );
}