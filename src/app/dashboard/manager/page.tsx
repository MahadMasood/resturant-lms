export const instant = false;

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import StatsCard from "@/components/ui/StatsCard";
import UploadModuleButton from "@/components/ui/UploadModuleButton";
import StaffProgressTable from "@/components/ui/StaffProgressTable";

export default async function ManagerDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar title="Restaurant A — Manager Portal" />

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Restaurant A — Manager Portal</h1>
          <p className="mt-1 text-sm text-neutral-400">Manage training modules and track your team&apos;s progress.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatsCard
            label="Staff Members"
            value={2}
            icon={
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            }
            accent="text-indigo-400"
          />
          <StatsCard
            label="Completed"
            value={1}
            icon={
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
            accent="text-emerald-400"
          />
          <StatsCard
            label="Pending"
            value={1}
            icon={
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            }
            accent="text-amber-400"
          />
          <StatsCard
            label="Modules"
            value={1}
            icon={
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            }
            accent="text-purple-400"
          />
        </div>

        {/* Upload module */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">
            Training Modules
          </h2>
          <UploadModuleButton />

          {/* Existing module */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-700 text-neutral-300">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Module 1: Safety Protocols</p>
                <p className="text-xs text-neutral-400">Assigned to 2 staff</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              Active
            </span>
          </div>
        </div>

        {/* Live progress table (polls /api/progress/all every 10s) */}
        <StaffProgressTable />
      </main>
    </div>
  );
}
