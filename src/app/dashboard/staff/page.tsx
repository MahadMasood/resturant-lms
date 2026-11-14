export const instant = false;

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StaffView from "@/components/ui/StaffView";

export default async function StaffDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const staffName = session.user.name || "Staff Member";
  const tenantName = session.user.tenantName || "Restaurant";

  return <StaffView staffName={staffName} tenantName={tenantName} />;
}
