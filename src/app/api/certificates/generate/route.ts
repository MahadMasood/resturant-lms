import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  let body: {
    userId: string;
    moduleId: string;
    userName: string;
    moduleName: string;
    score: number;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, moduleId, userName, moduleName, score } = body;

  // Check if cert already exists
  const existing = await prisma.certificate.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });
  if (existing) {
    return NextResponse.json({ pdfUrl: existing.pdfUrl });
  }

  const issuedAt = new Date();
  const dateStr = issuedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certId = `CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Official Certificate of Accreditation — ${userName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #09090b;
    color: #18181b;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .controls {
    margin-bottom: 24px;
    display: flex;
    gap: 12px;
  }
  .print-btn {
    background: #0071e3;
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 113, 227, 0.4);
    transition: background 0.2s;
  }
  .print-btn:hover { background: #0077ed; }
  .close-btn {
    background: #27272a;
    color: #a1a1aa;
    border: none;
    padding: 10px 20px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
  }
  .close-btn:hover { color: white; background: #3f3f46; }

  .cert-container {
    background: #ffffff;
    width: 100%;
    max-width: 860px;
    padding: 64px 72px;
    border-radius: 28px;
    box-shadow: 0 25px 70px rgba(0,0,0,0.45);
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .cert-inner-border {
    position: absolute;
    top: 18px; left: 18px; right: 18px; bottom: 18px;
    border: 1.5px solid #e4e4e7;
    border-radius: 18px;
    pointer-events: none;
  }
  .header {
    text-align: center;
    margin-bottom: 36px;
  }
  .emblem {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: #09090b;
    color: #ffffff;
    margin-bottom: 16px;
  }
  .brand {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #71717a;
  }
  .badge {
    display: inline-block;
    margin-top: 10px;
    padding: 4px 16px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #15803d;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
  }
  .title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 38px;
    font-weight: 700;
    color: #09090b;
    letter-spacing: -0.02em;
    margin-top: 14px;
  }
  .certifies {
    font-size: 14px;
    color: #71717a;
    margin-top: 20px;
  }
  .recipient-name {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 34px;
    font-weight: 700;
    color: #0071e3;
    letter-spacing: -0.01em;
    margin: 12px 0 16px;
  }
  .statement {
    font-size: 15px;
    line-height: 1.6;
    color: #3f3f46;
    max-width: 600px;
    margin: 0 auto;
  }
  .course-title {
    font-weight: 700;
    color: #09090b;
  }
  .stats-row {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin: 36px 0;
    padding: 16px 0;
    border-top: 1px solid #f4f4f5;
    border-bottom: 1px solid #f4f4f5;
  }
  .stat-item {
    text-align: center;
  }
  .stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #71717a;
    font-weight: 600;
  }
  .stat-val {
    font-size: 18px;
    font-weight: 700;
    color: #09090b;
    margin-top: 4px;
  }
  .footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: 40px;
    padding-top: 20px;
  }
  .signature-block {
    text-align: left;
  }
  .sig-line {
    width: 180px;
    height: 1px;
    background: #d4d4d8;
    margin-bottom: 8px;
  }
  .sig-title {
    font-size: 12px;
    font-weight: 600;
    color: #09090b;
  }
  .sig-subtitle {
    font-size: 11px;
    color: #71717a;
  }
  .cert-id-block {
    text-align: right;
    font-size: 11px;
    color: #a1a1aa;
    font-family: monospace;
  }

  @media print {
    body { background: white; padding: 0; }
    .controls { display: none; }
    .cert-container { box-shadow: none; border: none; padding: 48px; }
  }
</style>
</head>
<body>
  <div class="controls">
    <button onclick="window.print()" class="print-btn">Print or Save as PDF</button>
    <a href="/dashboard/staff" class="close-btn">Return to Dashboard</a>
  </div>

  <div class="cert-container">
    <div class="cert-inner-border"></div>

    <div class="header">
      <div class="emblem">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2z"/>
          <path d="M5 12.5l7 3.5 7-3.5"/>
        </svg>
      </div>
      <div class="brand">Hospitality Excellence & Compliance Institute</div>
      <div class="badge">Accreditation Verified</div>
      <h1 class="title">Certificate of Completion</h1>
      <p class="certifies">This is officially presented to</p>
      <div class="recipient-name">${userName}</div>
      <p class="statement">
        for demonstrating mastery and successfully completing all curriculum standards and anti-cheat verified video training for
        <br/><span class="course-title">${moduleName}</span>.
      </p>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-label">Evaluation Score</div>
        <div class="stat-val">${score}%</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Issue Date</div>
        <div class="stat-val">${dateStr}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Verification Status</div>
        <div class="stat-val" style="color: #15803d;">Authentic</div>
      </div>
    </div>

    <div class="footer">
      <div class="signature-block">
        <div class="sig-line"></div>
        <div class="sig-title">Accreditation Director</div>
        <div class="sig-subtitle">LMS Platform Training Council</div>
      </div>
      <div class="cert-id-block">
        <div>Verification ID:</div>
        <div style="font-weight: 700; color: #52525b; margin-top: 2px;">${certId}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const certDir = path.join(process.cwd(), "public", "certificates");
  if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

  const certFilename = `cert-${userId}-${moduleId}.html`;
  fs.writeFileSync(path.join(certDir, certFilename), html, "utf-8");

  const pdfUrl = `/certificates/${certFilename}`;

  await prisma.certificate.create({
    data: {
      userId,
      moduleId,
      pdfUrl,
      issuedAt,
    },
  });

  return NextResponse.json({ pdfUrl, certId });
}
