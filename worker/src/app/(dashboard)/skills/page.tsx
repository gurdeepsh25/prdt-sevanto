"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import type {
  MyWorkerSkill,
  SkillCatalogItem,
  SkillLevel,
} from "@sevanto/shared";

export default function SkillsPage() {
  const api = useApi();
  const [catalog, setCatalog] = useState<SkillCatalogItem[]>([]);
  const [mySkills, setMySkills] = useState<MyWorkerSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [filter, setFilter] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [cat, me] = await Promise.all([
        api.listSkills(),
        api.getMyWorkerProfile(),
      ]);
      setCatalog(cat.items);
      setMySkills(me.skills);
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

  function hasSkill(id: string): MyWorkerSkill | undefined {
    return mySkills.find((s) => s.id === id);
  }

  async function toggle(skill: SkillCatalogItem, level: SkillLevel) {
    const current = hasSkill(skill.id);
    const next = mySkills
      .filter((s) => s.id !== skill.id)
      .concat(current ? [] : [{ id: skill.id, name: skill.name, level }]);
    setMySkills(next);
    await persist(next);
  }

  async function changeLevel(id: string, name: string, level: SkillLevel) {
    const next = mySkills.map((s) => (s.id === id ? { ...s, level } : s));
    setMySkills(next);
    await persist(next);
  }

  async function persist(skills: MyWorkerSkill[]) {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await api.upsertMySkills({
        skills: skills.map((s) => ({ skillId: s.id, level: s.level })),
      });
      void res;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  const visibleCatalog = catalog.filter((s) =>
    filter ? s.name.toLowerCase().includes(filter.toLowerCase()) : true,
  );

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My skills</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pick the services you offer. Mark your proficiency level for each.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          {mySkills.length} selected
          {saving && " · saving…"}
        </p>
      </header>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Saved.
        </p>
      )}

      <input
        type="text"
        placeholder="Filter skills…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />

      {visibleCatalog.length === 0 ? (
        <p className="rounded-lg bg-slate-100 px-4 py-6 text-center text-sm text-slate-600">
          No skills match your filter.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCatalog.map((s) => {
            const current = hasSkill(s.id);
            return (
              <li
                key={s.id}
                className={`rounded-xl border p-4 ${
                  current
                    ? "border-brand-300 bg-brand-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <button
                    type="button"
                    onClick={() =>
                      void toggle(s, current ? current.level : "INTERMEDIATE")
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      current
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {current ? "Selected" : "Add"}
                  </button>
                </div>
                {current && (
                  <div className="mt-3 flex gap-1">
                    {(
                      ["BEGINNER", "INTERMEDIATE", "EXPERT"] as SkillLevel[]
                    ).map((lv) => (
                      <button
                        key={lv}
                        type="button"
                        onClick={() => void changeLevel(s.id, s.name, lv)}
                        className={`flex-1 rounded-md px-2 py-1 text-xs ${
                          current.level === lv
                            ? "bg-brand-600 text-white"
                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {lv.toLowerCase()}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
