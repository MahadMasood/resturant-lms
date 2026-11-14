export const instant = false;

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import ManagerView from "@/components/ui/ManagerView";

export default async function ManagerDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const tenantName = session.user.tenantName || "Restaurant";
  const managerName = session.user.name || "Manager";

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar title={`${tenantName} — Manager Portal`} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <ManagerView tenantName={tenantName} managerName={managerName} />
      </main>
    </div>
  );
}
