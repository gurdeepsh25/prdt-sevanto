"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDefaultApi } from "@/lib/api";
import type {
  Address,
  CategoryWithSubs,
  PublicCategoryListItem,
  JobUrgency,
} from "@sevanto/shared";

type Step = 1 | 2 | 3 | 4 | 5;

export default function NewJobPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [categories, setCategories] = useState<PublicCategoryListItem[]>([]);
  const [categoryDetail, setCategoryDetail] = useState<CategoryWithSubs | null>(
    null,
  );
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [categoryId, setCategoryId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [currency] = useState("INR");
  const [urgency, setUrgency] = useState<JobUrgency>("NORMAL");
  const [scheduledFor, setScheduledFor] = useState<string>("");
  const [addressId, setAddressId] = useState<string>("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getDefaultApi().listCategories(),
      getDefaultApi().listAddresses(),
    ])
      .then(([cats, addrs]) => {
        if (cancelled) return;
        setCategories(cats.items);
        setAddresses(addrs.items);
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

  useEffect(() => {
    if (!categoryId) {
      setCategoryDetail(null);
      return;
    }
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    let cancelled = false;
    getDefaultApi()
      .getCategoryBySlug(cat.slug)
      .then((res) => {
        if (!cancelled) setCategoryDetail(res.category);
      })
      .catch(() => {
        if (!cancelled) setCategoryDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId, categories]);

  const canNext = useMemo(() => {
    if (step === 1) return !!categoryId;
    if (step === 2)
      return title.trim().length >= 5 && description.trim().length >= 20;
    if (step === 3) {
      const min = budgetMin === "" ? null : Number(budgetMin);
      const max = budgetMax === "" ? null : Number(budgetMax);
      if (min !== null && max !== null && min > max) return false;
      return true;
    }
    if (step === 4) return !!addressId;
    return true;
  }, [step, categoryId, title, description, budgetMin, budgetMax, addressId]);

  async function submit(asDraft: boolean) {
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        subcategoryId: subcategoryId || null,
        addressId,
        budgetMin:
          budgetMin === "" ? null : Math.round(Number(budgetMin) * 100),
        budgetMax:
          budgetMax === "" ? null : Math.round(Number(budgetMax) * 100),
        currency,
        urgency,
        scheduledFor: scheduledFor
          ? new Date(scheduledFor).toISOString()
          : null,
        status: (asDraft ? "DRAFT" : "OPEN") as "DRAFT" | "OPEN",
      };
      const { job } = await getDefaultApi().createJob(payload);
      if (attachmentUrl) {
        try {
          await getDefaultApi().addJobAttachment(job.id, {
            url: attachmentUrl,
          });
        } catch {
          // Continue even if attachment fails; user can add later.
        }
      }
      router.push(`/my-jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Post a new job</h1>
        <p className="mt-1 text-sm text-slate-600">
          Step {step} of 5 — your progress is preserved as you go.
        </p>
      </header>

      {/* Step indicator */}
      <ol className="flex gap-2 text-xs">
        {[1, 2, 3, 4, 5].map((n) => (
          <li
            key={n}
            className={`flex-1 rounded-full px-3 py-1 text-center font-medium ${
              n <= step
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {n}. {["Category", "Details", "Budget", "Address", "Review"][n - 1]}
          </li>
        ))}
      </ol>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === 1 && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Choose a category
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategoryId(c.id);
                  setSubcategoryId("");
                }}
                className={`rounded-lg border p-3 text-left text-sm ${
                  categoryId === c.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <p className="font-medium text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500">
                  {c.subcategoriesCount} subcategories
                </p>
              </button>
            ))}
          </div>
          {categoryDetail && categoryDetail.subcategories.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-700">
                Subcategory (optional)
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSubcategoryId("")}
                  className={`rounded-full px-3 py-1 text-xs ${
                    !subcategoryId
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  None
                </button>
                {categoryDetail.subcategories.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubcategoryId(s.id)}
                    className={`rounded-full px-3 py-1 text-xs ${
                      subcategoryId === s.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-800">Job details</h2>
          <label className="block text-xs font-medium text-slate-700">
            Title (5–120 chars)
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <p className="text-[11px] text-slate-500">{title.length}/120</p>
          <label className="block text-xs font-medium text-slate-700">
            Description (20–4000 chars)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={4000}
              rows={8}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <p className="text-[11px] text-slate-500">
            {description.length}/4000
          </p>
          <label className="block text-xs font-medium text-slate-700">
            Urgency
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as JobUrgency)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-700">
            Scheduled for (optional)
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Budget (optional)
          </h2>
          <p className="text-xs text-slate-500">
            Enter in major units (rupees). Leave blank to keep the budget open.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-xs font-medium text-slate-700">
              Currency
              <input
                type="text"
                value={currency}
                disabled
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
              />
            </label>
            <label className="text-xs font-medium text-slate-700">
              Min
              <input
                type="number"
                min="0"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-slate-700">
              Max
              <input
                type="number"
                min="0"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Service address
          </h2>
          {addresses.length === 0 ? (
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You need to add an address in your profile before posting a job.{" "}
              <a href="/profile" className="font-medium underline">
                Go to profile →
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                    addressId === a.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={a.id}
                    checked={addressId === a.id}
                    onChange={() => setAddressId(a.id)}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-slate-900">
                      {a.label ?? "Address"}
                    </p>
                    <p className="text-xs text-slate-600">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state}{" "}
                      {a.postalCode}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <label className="block text-xs font-medium text-slate-700">
            Attachment URL (optional)
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </section>
      )}

      {step === 5 && (
        <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <h2 className="text-sm font-semibold text-slate-800">Review</h2>
          <p>
            <strong>Category:</strong>{" "}
            {categories.find((c) => c.id === categoryId)?.name}
            {subcategoryId && (
              <>
                {" · "}
                {categoryDetail?.subcategories.find(
                  (s) => s.id === subcategoryId,
                )?.name ?? "—"}
              </>
            )}
          </p>
          <p>
            <strong>Title:</strong> {title}
          </p>
          <p>
            <strong>Urgency:</strong> {urgency}
          </p>
          <p>
            <strong>Budget:</strong>{" "}
            {budgetMin || budgetMax
              ? `${currency} ${budgetMin || "0"}–${budgetMax || "∞"}`
              : "Open"}
          </p>
          <p>
            <strong>Address:</strong>{" "}
            {addresses.find((a) => a.id === addressId)?.line1}
          </p>
          {scheduledFor && (
            <p>
              <strong>Scheduled:</strong> {scheduledFor}
            </p>
          )}
          {attachmentUrl && (
            <p>
              <strong>Attachment:</strong>{" "}
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 underline"
              >
                {attachmentUrl}
              </a>
            </p>
          )}
        </section>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
          disabled={step === 1}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:opacity-50"
        >
          Back
        </button>
        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s < 5 ? ((s + 1) as Step) : s))}
            disabled={!canNext}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void submit(true)}
              disabled={submitting}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:opacity-50"
            >
              Save as draft
            </button>
            <button
              type="button"
              onClick={() => void submit(false)}
              disabled={submitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Post job"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
