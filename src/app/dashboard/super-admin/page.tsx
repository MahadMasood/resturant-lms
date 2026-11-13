export const instant = false;

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import StatsCard from "@/components/ui/StatsCard";

const TENANTS = [
  { name: "Restaurant A", id: "Rest-A", manager: "Alex Manager", users: 3, status: "Active" },
];

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar title="LMS Portal — Super Admin" />

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome, Super Admin</h1>
          <p className="mt-1 text-sm text-neutral-400">Platform-wide overview and tenant management.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatsCard
            label="Total Tenants"
            value={1}
            icon={
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
            }
            accent="text-indigo-400"
          />
          <StatsCard
            label="Active Users"
            value={3}
            icon={
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            }
            accent="text-emerald-400"
          />
          <StatsCard
            label="Modules Published"
            value={1}
            icon={
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            }
            accent="text-amber-400"
          />
        </div>

        {/* Provision new tenant */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">
            Provision New Restaurant Tenant
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Restaurant name…"
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="email"
              placeholder="Manager email…"
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={undefined}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Provision
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            (Prototype: triggers console.log — DB write in Phase 2)
          </p>
        </div>

        {/* Tenant table */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
          <div className="border-b border-neutral-800 px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Current Tenants</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                <th className="px-6 py-3">Tenant</th>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Manager</th>
                <th className="px-6 py-3">Users</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {TENANTS.map((t) => (
                <tr key={t.id} className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-800/40 transition">
                  <td className="px-6 py-4 font-medium text-white">{t.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-neutral-400">{t.id}</td>
                  <td className="px-6 py-4 text-neutral-300">{t.manager}</td>
                  <td className="px-6 py-4 text-neutral-300">{t.users}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

