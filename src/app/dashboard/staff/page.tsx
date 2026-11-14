export const instant = false;

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import StaffView from "@/components/ui/StaffView";

export default async function StaffDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const staffName = session.user.name || "Staff Member";
  const tenantName = session.user.tenantName || "Restaurant";

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar title={`${tenantName} — Training Portal`} />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <StaffView staffName={staffName} tenantName={tenantName} />
      </main>
    </div>
  );
}
