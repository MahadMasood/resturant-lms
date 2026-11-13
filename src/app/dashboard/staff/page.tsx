export const instant = false;

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import StaffModuleCard from "@/components/ui/StaffModuleCard";

export default async function StaffDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const name = (session.user as { name?: string } | undefined)?.name ?? "Staff";

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar title="Training Portal" />

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome, {name}</h1>
          <p className="mt-1 text-sm text-neutral-400">Your training assignments for Restaurant A.</p>
        </div>

        {/* Progress summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Assigned", value: "1", color: "text-indigo-400" },
            { label: "Completed", value: "0", color: "text-emerald-400" },
            { label: "Pass Rate", value: "—", color: "text-amber-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-neutral-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Module card — handles video + quiz lock client-side */}
        <StaffModuleCard staffName={name} />
      </main>
    </div>
  );
}
