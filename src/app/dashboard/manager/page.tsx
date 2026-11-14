export const instant = false;

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ManagerView from "@/components/ui/ManagerView";

export default async function ManagerDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const tenantName = session.user.tenantName || "Restaurant";
  const managerName = session.user.name || "Manager";

  return <ManagerView tenantName={tenantName} managerName={managerName} />;
}
