"use client";

import { useEffect, useMemo, useState } from "react";
import { Registration } from "@/types/registration";

type VehicleFilter = "all" | "yes" | "no";
type ConfirmedFilter = "all" | "yes" | "no";
type QuickFilter = "all" | "confirmed_yes" | "confirmed_no" | "vehicle_yes" | "vehicle_no";

export default function AdminTable() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vehicleFilter: VehicleFilter = "all";
    let confirmedFilter: ConfirmedFilter = "all";
    if (quickFilter === "vehicle_yes") vehicleFilter = "yes";
    if (quickFilter === "vehicle_no") vehicleFilter = "no";
    if (quickFilter === "confirmed_yes") confirmedFilter = "yes";
    if (quickFilter === "confirmed_no") confirmedFilter = "no";

    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (vehicleFilter !== "all") params.set("vehicle", vehicleFilter);
    if (confirmedFilter !== "all") params.set("confirmed", confirmedFilter);

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/registrations?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load data.");
        setRows(data.registrations);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [search, quickFilter]);

  const csvLink = useMemo(() => {
    let vehicleFilter: VehicleFilter = "all";
    let confirmedFilter: ConfirmedFilter = "all";
    if (quickFilter === "vehicle_yes") vehicleFilter = "yes";
    if (quickFilter === "vehicle_no") vehicleFilter = "no";
    if (quickFilter === "confirmed_yes") confirmedFilter = "yes";
    if (quickFilter === "confirmed_no") confirmedFilter = "no";

    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (vehicleFilter !== "all") params.set("vehicle", vehicleFilter);
    if (confirmedFilter !== "all") params.set("confirmed", confirmedFilter);
    return `/api/registrations/export?${params.toString()}`;
  }, [search, quickFilter]);

  const report = useMemo(() => {
    const total = rows.length;
    const confirmed = rows.filter((row) => row.confirmedAttendance).length;
    const notConfirmed = total - confirmed;
    return { total, confirmed, notConfirmed };
  }, [rows]);

  const toggleAttendance = async (id: string, nextValue: boolean) => {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/registrations/${id}/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmedAttendance: nextValue })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update attendance.");

      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, confirmedAttendance: nextValue } : row)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update attendance.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="paper-panel p-5 md:p-6 animate-rise-in">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or contact"
            className="input-parchment min-w-64"
          />
          <select
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value as QuickFilter)}
            className="input-parchment"
          >
            <option value="all">All registrations</option>
            <option value="confirmed_yes">Confirmed only</option>
            <option value="confirmed_no">Not confirmed only</option>
            <option value="vehicle_yes">With vehicle</option>
            <option value="vehicle_no">Without vehicle</option>
          </select>
        </div>
        <a href={csvLink} className="btn-secondary text-center text-sm">
          Export CSV
        </a>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-amber-900/20 bg-amber-50/60 p-3">
          <p className="text-xs uppercase tracking-[0.12em] ink-muted">Total Registrations</p>
          <p className="mt-1 text-xl font-semibold text-sepia-900">{report.total}</p>
        </div>
        <div className="rounded-lg border border-green-900/20 bg-green-50/60 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-green-900/70">Confirmed</p>
          <p className="mt-1 text-xl font-semibold text-green-900">{report.confirmed}</p>
        </div>
        <div className="rounded-lg border border-amber-900/20 bg-amber-100/55 p-3">
          <p className="text-xs uppercase tracking-[0.12em] ink-muted">Not Confirmed</p>
          <p className="mt-1 text-xl font-semibold text-sepia-900">{report.notConfirmed}</p>
        </div>
      </div>

      {loading ? <p className="ink-muted">Loading registrations...</p> : null}
      {error ? <p className="text-red-700">{error}</p> : null}

      {!loading && !error ? (
        <div className="overflow-auto rounded-xl border border-amber-900/20 bg-amber-50/55">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-amber-900/30 bg-amber-100/45 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Email</th>
                <th className="p-3">Church</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Plate Number</th>
                <th className="p-3">Attendance</th>
                <th className="p-3">Date Registered</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-amber-900/10">
                  <td className="p-3">{row.fullName}</td>
                  <td className="p-3">{row.contactNumber}</td>
                  <td className="p-3">{row.email ?? "-"}</td>
                  <td className="p-3">{row.church}</td>
                  <td className="p-3">{row.hasVehicle ? "Yes" : "No"}</td>
                  <td className="p-3">{row.plateNumber ?? "-"}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      disabled={updatingId === row.id}
                      onClick={() => toggleAttendance(row.id, !row.confirmedAttendance)}
                      className={`rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.08em] transition ${
                        row.confirmedAttendance
                          ? "border-green-700/70 bg-green-100 text-green-900"
                          : "border-amber-900/30 bg-amber-50 text-sepia-900"
                      } disabled:opacity-60`}
                    >
                      {row.confirmedAttendance ? "Confirmed" : "Mark Confirmed"}
                    </button>
                  </td>
                  <td className="p-3">{new Date(row.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-5 text-center ink-muted">
                    No registrations found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
