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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    fullName: string;
    contactNumber: string;
    email: string;
    church: string;
    role: string;
    hasVehicle: boolean;
    plateNumber: string;
  } | null>(null);
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

  const startEdit = (row: Registration) => {
    setError(null);
    setEditingId(row.id);
    setEditDraft({
      fullName: row.fullName,
      contactNumber: row.contactNumber,
      email: row.email ?? "",
      church: row.church,
      role: row.role ?? "",
      hasVehicle: row.hasVehicle,
      plateNumber: row.plateNumber ?? ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = async (id: string) => {
    if (!editDraft) return;
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editDraft.fullName,
          contactNumber: editDraft.contactNumber,
          email: editDraft.email,
          church: editDraft.church,
          role: editDraft.role,
          hasVehicle: editDraft.hasVehicle,
          plateNumber: editDraft.plateNumber
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update registration.");

      setRows((prev) => prev.map((row) => (row.id === id ? data.registration : row)));
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update registration.");
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
                <th className="p-3">Role/Ministry</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Plate Number</th>
                <th className="p-3">Attendance</th>
                <th className="p-3">Date Registered</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-amber-900/10">
                  <td className="p-3">
                    {editingId === row.id && editDraft ? (
                      <input
                        value={editDraft.fullName}
                        onChange={(e) => setEditDraft({ ...editDraft, fullName: e.target.value })}
                        className="input-parchment min-w-44 py-1.5"
                      />
                    ) : row.fullName}
                  </td>
                  <td className="p-3">
                    {editingId === row.id && editDraft ? (
                      <input
                        value={editDraft.contactNumber}
                        onChange={(e) => setEditDraft({ ...editDraft, contactNumber: e.target.value })}
                        className="input-parchment min-w-36 py-1.5"
                      />
                    ) : row.contactNumber}
                  </td>
                  <td className="p-3">
                    {editingId === row.id && editDraft ? (
                      <input
                        value={editDraft.email}
                        onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })}
                        className="input-parchment min-w-44 py-1.5"
                      />
                    ) : row.email ?? "-"}
                  </td>
                  <td className="p-3">
                    {editingId === row.id && editDraft ? (
                      <input
                        value={editDraft.church}
                        onChange={(e) => setEditDraft({ ...editDraft, church: e.target.value })}
                        className="input-parchment min-w-44 py-1.5"
                      />
                    ) : row.church}
                  </td>
                  <td className="p-3">
                    {editingId === row.id && editDraft ? (
                      <input
                        value={editDraft.role}
                        onChange={(e) => setEditDraft({ ...editDraft, role: e.target.value })}
                        className="input-parchment min-w-36 py-1.5"
                      />
                    ) : row.role ?? "-"}
                  </td>
                  <td className="p-3">
                    {editingId === row.id && editDraft ? (
                      <select
                        value={editDraft.hasVehicle ? "yes" : "no"}
                        onChange={(e) => {
                          const hasVehicle = e.target.value === "yes";
                          setEditDraft({ ...editDraft, hasVehicle, plateNumber: hasVehicle ? editDraft.plateNumber : "" });
                        }}
                        className="input-parchment py-1.5"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    ) : row.hasVehicle ? "Yes" : "No"}
                  </td>
                  <td className="p-3">
                    {editingId === row.id && editDraft ? (
                      <input
                        value={editDraft.plateNumber}
                        onChange={(e) => setEditDraft({ ...editDraft, plateNumber: e.target.value })}
                        disabled={!editDraft.hasVehicle}
                        className="input-parchment min-w-32 py-1.5 disabled:opacity-50"
                      />
                    ) : row.plateNumber ?? "-"}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      disabled={updatingId === row.id || editingId === row.id}
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
                  <td className="p-3">
                    {editingId === row.id ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={updatingId === row.id}
                          onClick={() => saveEdit(row.id)}
                          className="btn-primary px-3 py-1.5 text-xs"
                        >
                          Save
                        </button>
                        <button type="button" onClick={cancelEdit} className="btn-secondary px-3 py-1.5 text-xs">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => startEdit(row)} className="btn-secondary px-3 py-1.5 text-xs">
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-5 text-center ink-muted">
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
