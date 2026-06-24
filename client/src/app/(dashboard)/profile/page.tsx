"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth";
import { ApiError, type User } from "@sevanto/shared";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

const E164_RE = /^\+[1-9]\d{6,14}$/;

export default function ProfilePage() {
  const api = useApi();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getMe();
        setUser(res.user);
        setFullName(res.user.fullName);
        setPhone(res.user.phone ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (fullName.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (phone && !E164_RE.test(phone)) {
      setError("Phone must be in E.164 format (e.g. +919876543210)");
      return;
    }

    setSaving(true);
    try {
      const res = await api.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || null,
      });
      setUser(res.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-8 text-slate-500">Loading profile…</p>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-slate-600">
        Update your personal information.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Profile saved.
          </div>
        )}
        <FormField
          label="Email"
          htmlFor="email"
          hint="Contact support to change your email."
        >
          <Input id="email" value={user?.email ?? ""} disabled />
        </FormField>
        <FormField label="Full name" htmlFor="fullName">
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </FormField>
        <FormField
          label="Phone"
          htmlFor="phone"
          hint="E.164 format with leading + and country code."
        >
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
          />
        </FormField>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-slate-300"
        >
          {saving && (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          Save changes
        </button>
      </form>

      <AddressesSection />
    </div>
  );
}

// =====================================================
// Inline addresses section (Phase 2)
// =====================================================
function AddressesSection() {
  const api = useApi();
  const [addresses, setAddresses] = useState<
    import("@sevanto/shared").Address[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.listAddresses();
      setAddresses(res.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Addresses</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Add address
        </button>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Loading…</p>
      ) : addresses.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No addresses yet. Add one to use for job postings.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {addresses.map((a) => (
            <li key={a.id} className="flex items-start justify-between py-3">
              <div>
                <p className="text-sm font-medium">
                  {a.label ? `${a.label} · ` : ""}
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                </p>
                <p className="text-xs text-slate-500">
                  {a.city}, {a.state} {a.postalCode} · {a.country}
                </p>
                {a.isDefault && (
                  <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                    Default
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(a.id);
                    setShowForm(true);
                  }}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Delete this address?")) return;
                    await api.deleteAddress(a.id);
                    await load();
                  }}
                  className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <AddressForm
          address={addresses.find((a) => a.id === editingId)}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          onSaved={async () => {
            setShowForm(false);
            setEditingId(null);
            await load();
          }}
        />
      )}
    </section>
  );
}

function AddressForm({
  address,
  onClose,
  onSaved,
}: {
  address?: import("@sevanto/shared").Address;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const api = useApi();
  const [line1, setLine1] = useState(address?.line1 ?? "");
  const [line2, setLine2] = useState(address?.line2 ?? "");
  const [city, setCity] = useState(address?.city ?? "");
  const [state, setState] = useState(address?.state ?? "");
  const [postalCode, setPostalCode] = useState(address?.postalCode ?? "");
  const [label, setLabel] = useState(address?.label ?? "");
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        label: label.trim() || null,
        line1: line1.trim(),
        line2: line2.trim() || null,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        isDefault,
      };
      if (address) {
        await api.updateAddress(address.id, payload);
      } else {
        await api.createAddress(payload);
      }
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold">
          {address ? "Edit address" : "New address"}
        </h3>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <FormField label="Label (optional)" htmlFor="label">
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Home, Office"
          />
        </FormField>
        <FormField label="Address line 1" htmlFor="line1">
          <Input
            id="line1"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Address line 2 (optional)" htmlFor="line2">
          <Input
            id="line2"
            value={line2 ?? ""}
            onChange={(e) => setLine2(e.target.value)}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="City" htmlFor="city">
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </FormField>
          <FormField label="State" htmlFor="state">
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </FormField>
        </div>
        <FormField label="Postal code" htmlFor="postal">
          <Input
            id="postal"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="rounded border-slate-300"
          />
          Set as default address
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-slate-300"
          >
            {saving && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
