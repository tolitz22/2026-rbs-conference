"use client";

import Header from "@/components/Header";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import Link from "next/link";
import { useEffect, useState } from "react";

type SettingsState = {
  enabled: boolean;
  startsAt: string;
  endsAt: string;
  maxCapacity: string;
};

function isoToLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function localInputToIso(value: string) {
  if (!value.trim()) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export default function AdminRegistrationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentCount, setCurrentCount] = useState(0);
  const [form, setForm] = useState<SettingsState>({
    enabled: true,
    startsAt: "",
    endsAt: "",
    maxCapacity: ""
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, statusRes] = await Promise.all([
        fetch("/api/register/settings"),
        fetch("/api/register/status")
      ]);
      const settingsData = await settingsRes.json();
      const statusData = await statusRes.json();

      if (!settingsRes.ok) throw new Error(settingsData.message || "Failed to load settings.");
      if (!statusRes.ok) throw new Error(statusData.message || "Failed to load status.");

      setForm({
        enabled: settingsData.enabled,
        startsAt: isoToLocalInput(settingsData.startsAt),
        endsAt: isoToLocalInput(settingsData.endsAt),
        maxCapacity: settingsData.maxCapacity ? String(settingsData.maxCapacity) : ""
      });
      setCurrentCount(statusData.currentCount ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = {
        enabled: form.enabled,
        startsAt: localInputToIso(form.startsAt),
        endsAt: localInputToIso(form.endsAt),
        maxCapacity: form.maxCapacity.trim() ? Number(form.maxCapacity) : null
      };

      const res = await fetch("/api/register/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save settings.");

      setMessage("Registration settings updated.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen px-4 pb-16 pt-4 md:pt-8">
      <div className="mx-auto max-w-5xl">
        <Header />
        <section className="paper-panel mx-auto mt-4 max-w-3xl p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] ink-muted">Admin</p>
              <h1 className="mt-1 font-serif text-2xl md:text-3xl">Registration Controls</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin" className="btn-secondary text-sm">
                Back to Admin
              </Link>
              <AdminLogoutButton />
            </div>
          </div>

          {loading ? <p className="ink-muted">Loading settings...</p> : null}
          {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="mb-3 text-sm text-green-800">{message}</p> : null}

          {!loading ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-amber-900/20 bg-amber-50/70 p-3">
                <p className="text-xs uppercase tracking-[0.14em] ink-muted">Current Registrations</p>
                <p className="mt-1 text-2xl font-semibold text-sepia-900">{currentCount}</p>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
                <span className="text-sm text-sepia-900">Enable registration</span>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.14em] text-sepia-900/80">Registration Start</label>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, startsAt: e.target.value }))}
                    className="input-parchment mt-2"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.14em] text-sepia-900/80">Registration End</label>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, endsAt: e.target.value }))}
                    className="input-parchment mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.14em] text-sepia-900/80">Max Capacity</label>
                <input
                  type="number"
                  min={1}
                  placeholder="Leave blank for unlimited"
                  value={form.maxCapacity}
                  onChange={(e) => setForm((prev) => ({ ...prev, maxCapacity: e.target.value }))}
                  className="input-parchment mt-2"
                />
              </div>

              <button onClick={onSave} disabled={saving} className="btn-primary w-full py-3">
                {saving ? "Saving..." : "Save Controls"}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
