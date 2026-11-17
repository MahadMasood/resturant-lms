import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function sanitizeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  // Neutralize spreadsheet formula triggers (=, +, -, @, tabs, returns)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const queryTenantId = req.nextUrl.searchParams.get("tenantId");
  const tenantId =
    session.user.role === "SUPER_ADMIN"
      ? (queryTenantId || session.user.tenantId)
      : session.user.tenantId;

  if (!tenantId && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Tenant ID required for compliance export" }, { status: 400 });
  }

  const tenantName = session.user.tenantName || "Restaurant";

  // Fetch all staff members in this tenant with progress and certificates
  const whereClause: { role: "STAFF"; tenantId?: string } = { role: "STAFF" };
  if (tenantId) {
    whereClause.tenantId = tenantId;
  }

  const staff = await prisma.user.findMany({
    where: whereClause,
    include: {
      watchProgress: {
        include: { module: { select: { title: true } } },
      },
      quizAttempts: {
        orderBy: { createdAt: "desc" },
      },
      certificates: {
        include: { module: { select: { title: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const headers = [
    "Venue",
    "Staff Name",
    "Email",
    "Module Name",
    "Video Progress (%)",
    "Time Watched (sec)",
    "Video Completed",
    "Quiz Score (%)",
    "Quiz Passed",
    "Certificate URL",
    "Certified Date",
  ];

  const rows: string[][] = [];

  for (const s of staff) {
    if (s.watchProgress.length === 0) {
      rows.push([
        sanitizeCsvCell(tenantName),
        sanitizeCsvCell(s.name),
        sanitizeCsvCell(s.email),
        sanitizeCsvCell("No module started"),
        sanitizeCsvCell("0%"),
        sanitizeCsvCell("0"),
        sanitizeCsvCell("No"),
        sanitizeCsvCell("N/A"),
        sanitizeCsvCell("No"),
        sanitizeCsvCell("N/A"),
        sanitizeCsvCell("N/A"),
      ]);
    } else {
      for (const wp of s.watchProgress) {
        const percent =
          wp.durationSeconds > 0
            ? Math.round((wp.watchedSeconds / wp.durationSeconds) * 100)
            : 0;

        const attempt = s.quizAttempts.find((qa: { moduleId: string; score: number; passed: boolean }) => qa.moduleId === wp.moduleId);
        const cert = s.certificates.find((c: { moduleId: string; pdfUrl: string; issuedAt: Date }) => c.moduleId === wp.moduleId);

        rows.push([
          sanitizeCsvCell(tenantName),
          sanitizeCsvCell(s.name),
          sanitizeCsvCell(s.email),
          sanitizeCsvCell(wp.module.title),
          sanitizeCsvCell(`${percent}%`),
          sanitizeCsvCell(`${Math.round(wp.watchedSeconds)}`),
          sanitizeCsvCell(wp.completed ? "Yes" : "No"),
          sanitizeCsvCell(attempt ? `${attempt.score}%` : "Not Attempted"),
          sanitizeCsvCell(attempt && attempt.passed ? "Yes" : "No"),
          sanitizeCsvCell(cert ? cert.pdfUrl : "N/A"),
          sanitizeCsvCell(cert ? new Date(cert.issuedAt).toISOString().split("T")[0] : "N/A"),
        ]);
      }
    }
  }

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const safeTenant = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${safeTenant}_compliance_report_${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

