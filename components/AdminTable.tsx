"use client";

import { useEffect, useMemo, useState } from "react";
import { Registration } from "@/types/registration";

type VehicleFilter = "all" | "yes" | "no";

export default function AdminTable() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (vehicleFilter !== "all") params.set("vehicle", vehicleFilter);

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
  }, [search, vehicleFilter]);

  const csvLink = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (vehicleFilter !== "all") params.set("vehicle", vehicleFilter);
    return `/api/registrations/export?${params.toString()}`;
  }, [search, vehicleFilter]);

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
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value as VehicleFilter)}
            className="input-parchment"
          >
            <option value="all">All attendees</option>
            <option value="yes">With vehicle</option>
            <option value="no">Without vehicle</option>
          </select>
        </div>
        <a href={csvLink} className="btn-secondary text-center text-sm">
          Export CSV
        </a>
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
                <th className="p-3">Church</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Plate Number</th>
                <th className="p-3">Date Registered</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-amber-900/10">
                  <td className="p-3">{row.fullName}</td>
                  <td className="p-3">{row.contactNumber}</td>
                  <td className="p-3">{row.church}</td>
                  <td className="p-3">{row.hasVehicle ? "Yes" : "No"}</td>
                  <td className="p-3">{row.plateNumber ?? "-"}</td>
                  <td className="p-3">{new Date(row.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-5 text-center ink-muted">
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
