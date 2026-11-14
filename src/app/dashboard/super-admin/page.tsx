export const instant = false;

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import SuperAdminView from "@/components/ui/SuperAdminView";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar title="LMS Platform — Super Admin" />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <SuperAdminView />
      </main>
    </div>
  );
}
