import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tenantId = session.user.tenantId;
  const tenantName = session.user.tenantName || "Restaurant";

  // Fetch all staff members in this tenant with progress and certificates
  const staff = await prisma.user.findMany({
    where: {
      tenantId: tenantId ?? undefined,
      role: "STAFF",
    },
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
        `"${tenantName}"`,
        `"${s.name}"`,
        `"${s.email}"`,
        `"No module started"`,
        "0%",
        "0",
        "No",
        "N/A",
        "No",
        "N/A",
        "N/A",
      ]);
    } else {
      for (const wp of s.watchProgress) {
        const percent =
          wp.durationSeconds > 0
            ? Math.round((wp.watchedSeconds / wp.durationSeconds) * 100)
            : 0;

        const attempt = s.quizAttempts.find((qa) => qa.moduleId === wp.moduleId);
        const cert = s.certificates.find((c) => c.moduleId === wp.moduleId);

        rows.push([
          `"${tenantName}"`,
          `"${s.name}"`,
          `"${s.email}"`,
          `"${wp.module.title}"`,
          `${percent}%`,
          `${Math.round(wp.watchedSeconds)}`,
          wp.completed ? "Yes" : "No",
          attempt ? `${attempt.score}%` : "Not Attempted",
          attempt && attempt.passed ? "Yes" : "No",
          cert ? `"${cert.pdfUrl}"` : "N/A",
          cert ? `"${new Date(cert.issuedAt).toISOString().split("T")[0]}"` : "N/A",
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

