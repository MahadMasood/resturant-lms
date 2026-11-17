"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import StatsCard from "@/components/ui/StatsCard";
import PortalLayout, { NavTabItem } from "@/components/ui/PortalLayout";
import Link from "next/link";

interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: "MANAGER" | "STAFF" | "SUPER_ADMIN";
  createdAt: string;
  certificatesCount?: number;
  quizAttemptsCount?: number;
}

interface EquipmentSummary {
  totalCookingPlates: number;
  averagePlateHealth: number;
  totalMetalRings: number;
  totalServingPlates: number;
  nearDepletedCount: number;
}

interface EquipmentItemData {
  id: string;
  name: string;
  type: "COOKING_PLATE" | "METAL_RING" | "SERVING_PLATE";
  cooksCount: number;
  maxCooks: number;
  quantity: number;
  status: "ACTIVE" | "MAINTENANCE" | "RETIRED";
  notes: string | null;
  updatedAt: string;
}

interface TenantData {
  id: string;
  name: string;
  createdAt: string;
  userCount: number;
  moduleCount: number;
  users?: TenantUser[];
  equipment?: EquipmentItemData[];
  equipmentSummary?: EquipmentSummary;
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "MANAGER" | "STAFF" | "SUPER_ADMIN";
  tenantId: string | null;
  tenantName: string;
  createdAt: string;
  certificatesCount: number;
  quizAttemptsCount: number;
  watchCount: number;
}

export default function SuperAdminView() {
  const [activeTab, setActiveTab] = useState("venues");

  // Tenants data
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);

  // Expanded tenant for viewing all employees directly under a restaurant
  const [expandedTenantId, setExpandedTenantId] = useState<string | null>(null);

  // Platform users data (all managers and staff under Super Admin)
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Error & Feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [tenantSearch, setTenantSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"ALL" | "MANAGER" | "STAFF">("ALL");
  const [userTenantFilter, setUserTenantFilter] = useState<string>("ALL");

  // Deletion state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Tenant Provisioning Form states
  const [tenantName, setTenantName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("manager123");
  const [provisioning, setProvisioning] = useState(false);

  // User/Manager Provisioning Modal states
  const [isProvisionUserModalOpen, setIsProvisionUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("manager123");
  const [newUserRole, setNewUserRole] = useState<"MANAGER" | "STAFF">("MANAGER");
  const [newUserTenantId, setNewUserTenantId] = useState("");
  const [provisionUserError, setProvisionUserError] = useState<string | null>(null);
  const [provisioningUser, setProvisioningUser] = useState(false);

  // Load Tenants
  const loadTenants = useCallback(async () => {
    try {
      setLoadingTenants(true);
      const res = await fetch("/api/admin/tenants", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setTenants(Array.isArray(data) ? data : []);
      // If none expanded yet, auto-expand the first tenant so employees are immediately visible
      if (Array.isArray(data) && data.length > 0 && !expandedTenantId) {
        setExpandedTenantId(data[0].id);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoadingTenants(false);
    }
  }, [expandedTenantId]);

  // Load Platform Users (Managers and Staff across all venues)
  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load platform users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
    loadUsers();
  }, [loadTenants, loadUsers]);

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
      loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error provisioning tenant");
    } finally {
      setProvisioning(false);
    }
  };

  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionUserError(null);
    setProvisioningUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          tenantId: newUserTenantId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to provision user.");
      }

      setSuccessMsg(`User "${newUserName}" successfully provisioned.`);
      setIsProvisionUserModalOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("manager123");
      loadUsers();
      loadTenants();
    } catch (err: unknown) {
      setProvisionUserError(err instanceof Error ? err.message : "Error provisioning user");
    } finally {
      setProvisioningUser(false);
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
      loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error deleting tenant");
    } finally {
      setDeletingId(null);
    }
  };

  // Switch to users tab filtered by a specific restaurant
  const handleInspectRestaurantEmployees = (tenantId: string) => {
    setUserTenantFilter(tenantId);
    setActiveTab("users");
  };

  // Metrics
  const totalManagers = useMemo(() => users.filter((u) => u.role === "MANAGER").length, [users]);
  const totalStaff = useMemo(() => users.filter((u) => u.role === "STAFF").length, [users]);
  const totalModules = useMemo(() => tenants.reduce((acc, t) => acc + t.moduleCount, 0), [tenants]);

  // Filtered lists
  const filteredTenants = useMemo(() => {
    if (!tenantSearch.trim()) return tenants;
    const q = tenantSearch.toLowerCase();
    return tenants.filter((t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
  }, [tenants, tenantSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (u.role === "SUPER_ADMIN") return false;

      const matchesSearch =
        !userSearch.trim() ||
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.tenantName.toLowerCase().includes(userSearch.toLowerCase());

      const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
      const matchesTenant = userTenantFilter === "ALL" || u.tenantId === userTenantFilter;

      return matchesSearch && matchesRole && matchesTenant;
    });
  }, [users, userSearch, userRoleFilter, userTenantFilter]);

  // Navigation Tabs (on the side)
  const tabs: NavTabItem[] = [
    {
      id: "venues",
      label: "Venues & Employees",
      description: "Click any restaurant to view its complete employee roster",
      badge: tenants.length,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: "users",
      label: "All Managers & Staff",
      description: "Global directory of all employees across all venues",
      badge: totalManagers + totalStaff,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "overview",
      label: "Platform Overview",
      description: "Platform KPIs and global system status",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: "verify",
      label: "Accreditation Portal",
      description: "Inspect official public verification engine",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <PortalLayout
      portalTitle="LMS Platform"
      portalSubtitle="Super Admin Console"
      portalType="super-admin"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-8">
        {/* Alerts */}
        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-xs text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white">&times;</button>
          </div>
        )}
        {successMsg && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs text-emerald-300 flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">&times;</button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: VENUES & RESTAURANT EMPLOYEES (CLICK TO VIEW)     */}
        {/* ======================================================== */}
        {activeTab === "venues" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Restaurant Venues &amp; Employee Rosters
                </h1>
                <p className="text-xs md:text-sm text-neutral-400 mt-1">
                  Click on any restaurant row to immediately expand and inspect all of its assigned managers and staff.
                </p>
              </div>

              <button
                onClick={loadTenants}
                className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
              >
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Sync Venues</span>
              </button>
            </div>

            {/* Venues Table with Interactive Click to View Employees */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-2xl">
              <div className="border-b border-neutral-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/90">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
                    Registered Restaurants ({filteredTenants.length})
                  </h2>
                  <span className="text-[11px] text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">
                    Click any venue to view staff
                  </span>
                </div>

                <input
                  type="text"
                  value={tenantSearch}
                  onChange={(e) => setTenantSearch(e.target.value)}
                  placeholder="Filter restaurant by name or ID..."
                  className="rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 transition w-full sm:w-64"
                />
              </div>

              {loadingTenants ? (
                <div className="p-12 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Loading restaurant database...</span>
                </div>
              ) : filteredTenants.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-500">
                  No venues match your search query.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 bg-neutral-950/60">
                        <th className="px-6 py-3.5">Restaurant Venue</th>
                        <th className="px-6 py-3.5">Tenant ID</th>
                        <th className="px-6 py-3.5">General Manager</th>
                        <th className="px-6 py-3.5">Total Employees</th>
                        <th className="px-6 py-3.5">Curriculums</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTenants.map((t) => {
                        const mgr = t.users?.find((u) => u.role === "MANAGER");
                        const isExpanded = expandedTenantId === t.id;
                        const tenantStaffList = t.users || [];

                        return (
                          <div key={t.id} className="contents">
                            {/* Main Restaurant Row (Clickable) */}
                            <tr
                              onClick={() => setExpandedTenantId(isExpanded ? null : t.id)}
                              className={`border-b border-neutral-800/60 cursor-pointer transition select-none ${
                                isExpanded
                                  ? "bg-blue-950/20 border-b-0"
                                  : "hover:bg-neutral-800/40"
                              }`}
                            >
                              <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                                <span
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${
                                    isExpanded
                                      ? "bg-blue-600 border-blue-400 text-white shadow-sm"
                                      : "bg-neutral-800 border-neutral-700 text-neutral-400"
                                  }`}
                                >
                                  <svg
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                      isExpanded ? "rotate-90" : ""
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                  </svg>
                                </span>
                                <div>
                                  <span className="text-sm">{t.name}</span>
                                  <span className="block text-[11px] text-neutral-400 font-normal">
                                    {isExpanded ? "Click to collapse" : "Click to view employees"}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4 font-mono text-xs text-neutral-400">
                                {t.id}
                              </td>

                              <td className="px-6 py-4 text-xs">
                                {mgr ? (
                                  <div>
                                    <span className="text-blue-400 font-semibold">{mgr.name}</span>
                                    <span className="block text-neutral-400 font-mono text-[10px]">{mgr.email}</span>
                                  </div>
                                ) : (
                                  <span className="text-neutral-500 italic">No Manager Provisioned</span>
                                )}
                              </td>

                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800 border border-neutral-700 px-2.5 py-1 text-xs font-semibold text-neutral-200">
                                  <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                  <span>{t.userCount} Employees</span>
                                </span>
                              </td>

                              <td className="px-6 py-4 text-xs font-mono text-neutral-300">
                                <div>
                                  <span>{t.moduleCount} Courses</span>
                                  {t.equipmentSummary && (
                                    <span className="block text-[10px] text-rose-400 font-sans mt-0.5 font-medium">
                                      {t.equipmentSummary.totalCookingPlates} Slabs &bull; {t.equipmentSummary.averagePlateHealth}% Health
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleInspectRestaurantEmployees(t.id)}
                                    className="rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition"
                                    title="Open detailed directory"
                                  >
                                    Inspect Full
                                  </button>

                                  <button
                                    onClick={() => handleDeleteTenant(t.id, t.name)}
                                    disabled={deletingId === t.id}
                                    className="rounded-lg bg-red-950/40 hover:bg-red-950/70 border border-red-500/20 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 transition font-medium disabled:opacity-50 inline-flex items-center gap-1"
                                    title="Delete venue"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>{deletingId === t.id ? "..." : "Delete"}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Nested Employee Drawer */}
                            {isExpanded && (
                              <tr className="bg-neutral-950 border-b border-neutral-800/80">
                                <td colSpan={6} className="p-5 md:p-6">
                                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 space-y-4">
                                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                                      <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">
                                          {t.name.charAt(0).toUpperCase()}
                                        </span>
                                        <h3 className="text-sm font-bold text-white tracking-tight">
                                          {t.name} &mdash; Team Employees Roster ({tenantStaffList.length})
                                        </h3>
                                      </div>

                                      <button
                                        onClick={() => handleInspectRestaurantEmployees(t.id)}
                                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition inline-flex items-center gap-1"
                                      >
                                        <span>View in Directory Tab</span>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </button>
                                    </div>

                                    {tenantStaffList.length === 0 ? (
                                      <div className="p-6 text-center text-xs text-neutral-500">
                                        No employees registered for this restaurant yet.
                                      </div>
                                    ) : (
                                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {tenantStaffList.map((emp) => (
                                          <div
                                            key={emp.id}
                                            className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2.5 transition hover:border-neutral-700"
                                          >
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex items-center gap-2.5">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-300">
                                                  {emp.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                  <p className="text-xs font-bold text-white leading-tight">
                                                    {emp.name}
                                                  </p>
                                                  <p className="text-[10px] text-neutral-400 font-mono leading-tight mt-0.5">
                                                    {emp.email}
                                                  </p>
                                                </div>
                                              </div>

                                              <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                                                  emp.role === "MANAGER"
                                                    ? "bg-blue-950 border-blue-500/30 text-blue-400"
                                                    : "bg-emerald-950 border-emerald-500/30 text-emerald-400"
                                                }`}
                                              >
                                                <span
                                                  className={`h-1 w-1 rounded-full ${
                                                    emp.role === "MANAGER" ? "bg-blue-400" : "bg-emerald-400"
                                                  }`}
                                                />
                                                {emp.role === "MANAGER" ? "Manager" : "Staff"}
                                              </span>
                                            </div>

                                            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/80">
                                              <span>Joined: {new Date(emp.createdAt).toLocaleDateString()}</span>
                                              {emp.role === "STAFF" && (
                                                <span className="font-semibold text-emerald-400">
                                                  {emp.certificatesCount ?? 0} Certified
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Salt Slabs & Equipment Section (Restaurant-Wise) */}
                                    <div className="pt-5 border-t border-neutral-800 space-y-4">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-600 text-white text-xs font-bold">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                            </svg>
                                          </span>
                                          <div>
                                            <h4 className="text-sm font-bold text-white tracking-tight">
                                              {t.name} &mdash; Salt Slabs &amp; Equipment Inventory
                                            </h4>
                                            <p className="text-[11px] text-neutral-400">
                                              Cooking slab 40-cook health meters, metal burner base rings, and cold steak serving plates.
                                            </p>
                                          </div>
                                        </div>

                                        {/* Equipment KPI summary pills */}
                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                          <span className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-neutral-300">
                                            <strong className="text-white font-mono">{t.equipmentSummary?.totalCookingPlates ?? 0}</strong> Cooking Slabs (Avg Health: <strong className="text-emerald-400 font-mono">{t.equipmentSummary?.averagePlateHealth ?? 100}%</strong>)
                                          </span>
                                          <span className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-neutral-300">
                                            <strong className="text-white font-mono">{t.equipmentSummary?.totalMetalRings ?? 0}</strong> Metal Rings
                                          </span>
                                          <span className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-neutral-300">
                                            <strong className="text-white font-mono">{t.equipmentSummary?.totalServingPlates ?? 0}</strong> Serving Plates
                                          </span>
                                          {(t.equipmentSummary?.nearDepletedCount ?? 0) > 0 && (
                                            <span className="rounded-lg border border-amber-500/30 bg-amber-950/60 px-2.5 py-1 text-amber-300 font-semibold animate-pulse">
                                              {t.equipmentSummary?.nearDepletedCount} Slabs Near 40 Cooks
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Equipment Grid */}
                                      {(!t.equipment || t.equipment.length === 0) ? (
                                        <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-950 rounded-xl border border-neutral-800/80">
                                          No equipment or salt slabs registered for this restaurant yet.
                                        </div>
                                      ) : (
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                          {t.equipment.map((eq) => {
                                            const isCookingPlate = eq.type === "COOKING_PLATE";
                                            const maxCooks = eq.maxCooks || 40;
                                            const percentage = Math.max(0, Math.round(((maxCooks - eq.cooksCount) / maxCooks) * 100));
                                            const usedPercentage = Math.min(100, Math.round((eq.cooksCount / maxCooks) * 100));
                                            const isDepleted = eq.cooksCount >= maxCooks;
                                            const isCritical = eq.cooksCount >= 36;

                                            return (
                                              <div
                                                key={eq.id}
                                                className={`rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2.5 transition hover:border-neutral-700 ${
                                                  eq.status === "RETIRED" ? "opacity-60" : ""
                                                }`}
                                              >
                                                <div className="flex items-start justify-between gap-2">
                                                  <div>
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                      <span
                                                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
                                                          eq.type === "COOKING_PLATE"
                                                            ? "bg-rose-950/80 border-rose-500/30 text-rose-300"
                                                            : eq.type === "METAL_RING"
                                                            ? "bg-blue-950/80 border-blue-500/30 text-blue-300"
                                                            : "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
                                                        }`}
                                                      >
                                                        {eq.type === "COOKING_PLATE"
                                                          ? "Cooking Slab"
                                                          : eq.type === "METAL_RING"
                                                          ? "Metal Ring"
                                                          : "Serving Platter"}
                                                      </span>

                                                      <span className="rounded-md bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-400">
                                                        {eq.status}
                                                      </span>
                                                    </div>

                                                    <h5 className="text-xs font-bold text-white leading-tight">
                                                      {eq.name}
                                                    </h5>
                                                  </div>

                                                  {!isCookingPlate && (
                                                    <span className="rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-0.5 text-xs font-bold text-white font-mono">
                                                      Qty: {eq.quantity}
                                                    </span>
                                                  )}
                                                </div>

                                                {/* 40-Cook Health Meter Bar for Cooking Slabs */}
                                                {isCookingPlate && (
                                                  <div className="space-y-1.5 pt-1 border-t border-neutral-800/80">
                                                    <div className="flex items-center justify-between text-[11px]">
                                                      <span className="text-neutral-400 font-medium">Health Meter:</span>
                                                      <span className={`font-mono font-bold ${
                                                        isDepleted ? "text-rose-400" : isCritical ? "text-amber-400" : "text-emerald-400"
                                                      }`}>
                                                        {eq.cooksCount} / {maxCooks} Cooks ({percentage}%)
                                                      </span>
                                                    </div>

                                                    <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                                                      <div
                                                        className={`h-full rounded-full transition-all duration-300 ${
                                                          isDepleted
                                                            ? "bg-rose-500"
                                                            : isCritical
                                                            ? "bg-amber-500"
                                                            : "bg-emerald-500"
                                                        }`}
                                                        style={{ width: `${usedPercentage}%` }}
                                                      />
                                                    </div>

                                                    <div className="flex items-center justify-between text-[9px] text-neutral-500">
                                                      <span>
                                                        {isDepleted ? "Lifespan Reached" : isCritical ? "Critical Wear" : "Prime Condition"}
                                                      </span>
                                                      <span>Target: 40 Cooks</span>
                                                    </div>
                                                  </div>
                                                )}

                                                {eq.notes && (
                                                  <p className="text-[10px] text-neutral-400 line-clamp-2 pt-1 border-t border-neutral-800/60">
                                                    {eq.notes}
                                                  </p>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </div>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Provision Form Card */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 md:p-8 space-y-5 shadow-xl">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Provision New Restaurant Venue
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Instantly establishes isolated tenant space in PostgreSQL and creates the venue General Manager.
                </p>
              </div>

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
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ALL MANAGERS & STAFF DIRECTORY (GLOBAL)           */}
        {/* ======================================================== */}
        {activeTab === "users" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Platform Managers &amp; Staff Directory
                </h1>
                <p className="text-xs md:text-sm text-neutral-400 mt-1">
                  Full visibility into all managers and staff accounts assigned across every restaurant organization.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={loadUsers}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Sync Directory</span>
                </button>
                <button
                  onClick={() => {
                    if (!newUserTenantId && tenants.length > 0) {
                      setNewUserTenantId(tenants[0].id);
                    }
                    setIsProvisionUserModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-900/30 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Provision User / Manager</span>
                </button>
              </div>
            </div>

            {/* Quick Venue Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-neutral-400 font-semibold shrink-0">Filter by Venue:</span>
              <button
                onClick={() => setUserTenantFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 border ${
                  userTenantFilter === "ALL"
                    ? "bg-blue-600 border-blue-400 text-white shadow-sm"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                All Venues
              </button>
              {tenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setUserTenantFilter(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 border ${
                    userTenantFilter === t.id
                      ? "bg-blue-600 border-blue-400 text-white shadow-sm"
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  {t.name} ({t.userCount})
                </button>
              ))}
            </div>

            {/* Search & Role Filter Bar */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-4 md:p-6 space-y-4 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                    Search Staff or Manager
                  </label>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, or venue..."
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                    Role Category
                  </label>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Roles ({totalManagers + totalStaff})</option>
                    <option value="MANAGER">Managers Only ({totalManagers})</option>
                    <option value="STAFF">Staff Only ({totalStaff})</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Directory Table */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-xl">
              <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
                    Directory Records ({filteredUsers.length})
                  </h2>
                </div>
                <div className="text-xs text-neutral-400">
                  <span className="text-blue-400 font-semibold">{totalManagers} Managers</span> &middot;{" "}
                  <span className="text-emerald-400 font-semibold">{totalStaff} Staff</span>
                </div>
              </div>

              {loadingUsers ? (
                <div className="p-12 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Loading user records...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-500">
                  No managers or staff match your criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 bg-neutral-950/40">
                        <th className="px-6 py-3.5">Employee Name</th>
                        <th className="px-6 py-3.5">Email Address</th>
                        <th className="px-6 py-3.5">Role</th>
                        <th className="px-6 py-3.5">Assigned Organization</th>
                        <th className="px-6 py-3.5">Certificates Earned</th>
                        <th className="px-6 py-3.5">Account Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-neutral-800/40 last:border-0 hover:bg-neutral-800/30 transition"
                        >
                          <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-300">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{u.name}</span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-neutral-400">
                            {u.email}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                                u.role === "MANAGER"
                                  ? "bg-blue-950/80 border-blue-500/30 text-blue-400"
                                  : "bg-emerald-950/80 border-emerald-500/30 text-emerald-400"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  u.role === "MANAGER" ? "bg-blue-400" : "bg-emerald-400"
                                }`}
                              />
                              {u.role === "MANAGER" ? "General Manager" : "Certified Staff"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-neutral-300">
                            {u.tenantName}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono">
                            {u.role === "STAFF" ? (
                              <span
                                className={`inline-flex items-center gap-1 font-bold ${
                                  u.certificatesCount > 0 ? "text-emerald-400" : "text-neutral-500"
                                }`}
                              >
                                {u.certificatesCount > 0 && (
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                                  </svg>
                                )}
                                <span>{u.certificatesCount} Verified</span>
                              </span>
                            ) : (
                              <span className="text-neutral-500 text-[11px]">N/A (Manager)</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-neutral-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PLATFORM OVERVIEW                                  */}
        {/* ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-3 py-1 text-xs text-neutral-400 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                Global Platform Architecture
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Enterprise Command Center
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                Centralized oversight for multi-tenant isolation, general managers, staff compliance, and certification integrity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatsCard
                label="Provisioned Venues"
                value={tenants.length}
                icon={
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                }
                accent="text-blue-400"
              />
              <StatsCard
                label="General Managers"
                value={totalManagers}
                icon={
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                }
                accent="text-purple-400"
              />
              <StatsCard
                label="Certified Staff"
                value={totalStaff}
                icon={
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                }
                accent="text-emerald-400"
              />
              <StatsCard
                label="Active Curriculums"
                value={totalModules}
                icon={
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                }
                accent="text-amber-400"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ACCREDITATION VERIFICATION SHORTCUT               */}
        {/* ======================================================== */}
        {activeTab === "verify" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-8 text-center space-y-4 max-w-2xl mx-auto shadow-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Public Accreditation Verification Engine
              </h2>
              <p className="text-xs md:text-sm text-neutral-400 max-w-md mx-auto">
                Open the official public portal used by food safety inspectors and state health auditors to verify certificates.
              </p>
              <div className="pt-2">
                <Link
                  href="/verify"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-xs font-semibold text-white transition shadow-lg shadow-emerald-600/30"
                >
                  <span>Launch Verification Portal in New Tab</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Provision User / Secondary Manager Modal */}
        {isProvisionUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-3xl border border-neutral-800 bg-neutral-900 p-6 md:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Provision User Account</h3>
                    <p className="text-xs text-neutral-400">Add a secondary manager or staff member to a venue</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProvisionUserModalOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {provisionUserError && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                  {provisionUserError}
                </div>
              )}

              <form onSubmit={handleProvisionUser} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="marcus@steakhouse.com"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                      Account Role
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as "MANAGER" | "STAFF")}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    >
                      <option value="MANAGER">Manager</option>
                      <option value="STAFF">Staff Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                      Target Venue
                    </label>
                    <select
                      required
                      value={newUserTenantId}
                      onChange={(e) => setNewUserTenantId(e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    >
                      <option value="" disabled>Select venue</option>
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                    Initial Password
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    The user can change this password after their initial login via their profile drawer.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsProvisionUserModalOpen(false)}
                    className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={provisioningUser}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-900/30 transition"
                  >
                    {provisioningUser ? "Provisioning..." : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
