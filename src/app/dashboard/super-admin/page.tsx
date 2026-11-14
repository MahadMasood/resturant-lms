export const instant = false;

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SuperAdminView from "@/components/ui/SuperAdminView";

export default async function SuperAdminDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return <SuperAdminView />;
}
