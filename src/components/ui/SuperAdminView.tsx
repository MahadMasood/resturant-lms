"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import StatsCard from "@/components/ui/StatsCard";
import Link from "next/link";

interface TenantData {
  id: string;
  name: string;
  createdAt: string;
  userCount: number;
  moduleCount: number;
}

export default function SuperAdminView() {
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [tenantName, setTenantName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("manager123");
  const [provisioning, setProvisioning] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadTenants = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tenants", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setTenants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setProvisioning(true);

    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName,
          managerName,
          managerEmail,
          managerPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to provision tenant.");
      }

      setSuccessMsg(`Venue "${data.tenantName}" successfully provisioned with manager account.`);
      setTenantName("");
      setManagerName("");
      setManagerEmail("");
      setManagerPassword("manager123");
      loadTenants();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error provisioning tenant");
    } finally {
      setProvisioning(false);
    }
  };

  const handleDeleteTenant = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This cascades all staff, modules, and certificates.`)) {
      return;
    }

    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tenants/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete tenant");
      setSuccessMsg(`Tenant "${name}" successfully deleted.`);
      loadTenants();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error deleting tenant");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTenants = useMemo(() => {
    if (!searchQuery.trim()) return tenants;
    const q = searchQuery.toLowerCase();
    return tenants.filter((t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
  }, [tenants, searchQuery]);

  const totalUsers = tenants.reduce((acc, t) => acc + t.userCount, 0);
  const totalModules = tenants.reduce((acc, t) => acc + t.moduleCount, 0);

  return (
    <div className="space-y-8">
      {/* Welcome & Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-3 py-1 text-xs text-neutral-400 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Platform Administration
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Super Admin Console
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Provision enterprise restaurant venues, manage tenant isolation, and audit compliance across organizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Verification Portal</span>
          </Link>
          <button
            onClick={loadTenants}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
          >
            <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard
          label="Active Venues"
          value={tenants.length}
          icon={
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
          }
          accent="text-blue-400"
        />
        <StatsCard
          label="Total Staff & Managers"
          value={totalUsers}
          icon={
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
          accent="text-emerald-400"
        />
        <StatsCard
          label="Published Curriculums"
          value={totalModules}
          icon={
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          }
          accent="text-amber-400"
        />
        <StatsCard
          label="Database Isolation"
          value="RLS Tenant"
          icon={
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
          accent="text-purple-400"
        />
      </div>

      {/* Provision New Venue Section */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 md:p-8 space-y-5 shadow-xl">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Provision New Restaurant Organization
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Instantly establish an isolated multi-tenant boundary, assign database schemas, and create the venue general manager account.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-3.5 text-xs text-red-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleProvision} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            required
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            placeholder="Restaurant Name..."
            className="rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500"
          />
          <input
            type="text"
            required
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            placeholder="Manager Full Name..."
            className="rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500"
          />
          <input
            type="email"
            required
            value={managerEmail}
            onChange={(e) => setManagerEmail(e.target.value)}
            placeholder="Manager Work Email..."
            className="rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500"
          />
          <input
            type="text"
            required
            value={managerPassword}
            onChange={(e) => setManagerPassword(e.target.value)}
            placeholder="Manager Password..."
            className="rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 font-mono"
          />
          <button
            type="submit"
            disabled={provisioning}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/25 disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{provisioning ? "Provisioning..." : "Provision Venue"}</span>
          </button>
        </form>
      </div>

      {/* Tenant Table Section */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-xl">
        <div className="border-b border-neutral-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              Registered Hospitality Venues
            </h2>
            <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-neutral-400">
              {filteredTenants.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by venue name or ID..."
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 transition w-56"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Querying Neon Postgres database...</span>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            {searchQuery ? "No venues match your search query." : "No venues provisioned yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 bg-neutral-950/40">
                  <th className="px-6 py-3.5">Venue Name</th>
                  <th className="px-6 py-3.5">Tenant ID</th>
                  <th className="px-6 py-3.5">Registered Users</th>
                  <th className="px-6 py-3.5">Active Modules</th>
                  <th className="px-6 py-3.5">Provisioned Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-neutral-800/40 last:border-0 hover:bg-neutral-800/30 transition"
                  >
                    <td className="px-6 py-4 font-semibold text-white">{t.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-400">{t.id}</td>
                    <td className="px-6 py-4 text-neutral-300 text-xs">
                      {t.userCount} Accounts
                    </td>
                    <td className="px-6 py-4 text-neutral-300 text-xs">
                      {t.moduleCount} Modules
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteTenant(t.id, t.name)}
                        disabled={deletingId === t.id}
                        className="text-xs text-red-400/80 hover:text-red-300 transition font-medium disabled:opacity-50 inline-flex items-center gap-1"
                        title="Delete tenant organization"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>{deletingId === t.id ? "Deleting..." : "Delete"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
