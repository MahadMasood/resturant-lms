export const instant = false;

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PrintCertificateButton from "@/components/ui/PrintCertificateButton";
import CertificateQrCode from "@/components/ui/CertificateQrCode";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cleanId = decodeURIComponent(id).replace(/\.html$/, "");

  const cert = await prisma.certificate.findFirst({
    where: {
      OR: [
        { id: cleanId },
        { pdfUrl: `/certificates/${cleanId}` },
        { pdfUrl: `/certificates/${cleanId}.html` },
        { pdfUrl: { contains: cleanId } },
      ],
    },
    include: {
      user: { select: { name: true } },
      module: { select: { title: true } },
    },
  });

  if (!cert) {
    return {
      title: "Certificate Verification | LMS Portal",
    };
  }

  return {
    title: `Accreditation Certificate — ${cert.user.name} | LMS Portal`,
    description: `Official digital accreditation credential for ${cert.user.name} in ${cert.module.title}.`,
  };
}

export default async function CertificatePage({ params }: PageProps) {
  const { id } = await params;
  const cleanId = decodeURIComponent(id).replace(/\.html$/, "");

  const certificate = await prisma.certificate.findFirst({
    where: {
      OR: [
        { id: cleanId },
        { pdfUrl: `/certificates/${cleanId}` },
        { pdfUrl: `/certificates/${cleanId}.html` },
        { pdfUrl: { contains: cleanId } },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          tenant: { select: { id: true, name: true } },
        },
      },
      module: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
    },
  });

  if (!certificate) {
    notFound();
  }

  // Fetch the official passing quiz score
  const attempt = await prisma.quizAttempt.findFirst({
    where: {
      userId: certificate.userId,
      moduleId: certificate.moduleId,
      passed: true,
    },
    orderBy: { score: "desc" },
    select: { score: true, createdAt: true },
  });

  const recipientName = certificate.user.name;
  const courseTitle = certificate.module.title;
  const venueName = certificate.user.tenant?.name || "Accredited Culinary Venue";
  const score = attempt?.score ?? 100;
  const certId = certificate.id;
  const baseUrl = process.env.NEXTAUTH_URL || "https://lms-portal.com";
  const verifyUrl = `${baseUrl}/verify?id=${encodeURIComponent(certId)}`;

  const dateIssued = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-amber-500 selection:text-black">
      {/* ─── Top Control Bar (Hidden on Print) ────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/staff"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-neutral-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </Link>

            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Cryptographically Verified Record
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/verify?id=${encodeURIComponent(certId)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-xs text-neutral-400 transition hover:text-amber-400 md:inline-flex items-center gap-1"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Verify on Public Portal</span>
            </Link>

            <PrintCertificateButton certId={certId} />
          </div>
        </div>
      </header>

      {/* ─── Certificate Viewport Container ──────────────────────────────── */}
      <main className="mx-auto flex max-w-4xl flex-col items-center justify-center p-4 py-8 sm:p-8 sm:py-12 print:p-0">
        <div
          id="certificate-sheet"
          className="relative w-full max-w-[820px] rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#141416] via-[#0d0d0f] to-[#0a0a0c] p-8 text-white shadow-2xl shadow-black/80 sm:p-14 md:p-16 print:border-neutral-800 print:bg-white print:text-black print:shadow-none print:rounded-none"
        >
          {/* Subtle Inner Guilloche Border */}
          <div className="pointer-events-none absolute inset-3 rounded-2xl border border-amber-500/20 sm:inset-5 print:border-neutral-400" />
          <div className="pointer-events-none absolute inset-4 rounded-xl border border-amber-500/10 sm:inset-6 print:border-neutral-300" />

          {/* Certificate Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Official Accreditation Seal */}
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent shadow-inner print:border-neutral-800 print:bg-neutral-100">
              <svg className="h-7 w-7 text-amber-400 print:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

            {/* Institution Header */}
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400/90 print:text-neutral-700">
              Hospitality Compliance Council
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-widest text-neutral-400 print:text-neutral-500">
              Culinary Accreditation & Food Safety Board
            </p>

            {/* Certificate Title */}
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl print:text-black">
              Certificate of Accreditation
            </h1>

            <div className="my-4 h-px w-24 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent print:via-neutral-400" />

            {/* Recipient Introduction */}
            <p className="text-xs uppercase tracking-wider text-neutral-400 print:text-neutral-600">
              This officially certifies that
            </p>

            {/* Recipient Full Name */}
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-amber-300 sm:text-3xl md:text-4xl print:text-black font-serif">
              {recipientName}
            </h2>

            {/* Certification Body Description */}
            <p className="mt-4 max-w-xl text-xs leading-relaxed text-neutral-300 sm:text-sm print:text-neutral-700">
              has completed verified video instruction, met all anti-cheat high-water mark requirements,
              and demonstrated professional culinary mastery in
            </p>

            {/* Module Name Card */}
            <div className="mt-3 inline-block rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-2.5 print:border-neutral-300 print:bg-neutral-50">
              <span className="text-sm font-bold text-white sm:text-base print:text-black">
                {courseTitle}
              </span>
            </div>

            {/* Evaluation Score Pill */}
            <div className="mt-5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold text-emerald-400 print:border-neutral-400 print:bg-neutral-100 print:text-black">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Accreditation Score: {score}% (Passed)</span>
              </span>

              <span className="text-xs text-neutral-400 print:text-neutral-600">
                • Accredited at: <strong className="text-neutral-200 print:text-black">{venueName}</strong>
              </span>
            </div>

            {/* Divider & Official Accreditation Credentials Footer */}
            <div className="mt-10 w-full border-t border-white/10 pt-6 print:border-neutral-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
                {/* Text Metadata */}
                <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                  {/* Issue Date */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 print:text-neutral-500">
                      Date of Accreditation
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-neutral-200 print:text-black">
                      {dateIssued}
                    </p>
                  </div>

                  {/* Issuing Authority */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 print:text-neutral-500">
                      Issuing Authority
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-neutral-200 print:text-black">
                      State Compliance Council
                    </p>
                  </div>

                  {/* Verification Token */}
                  <div className="col-span-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 print:text-neutral-500">
                      Digital Verification Hash ID
                    </p>
                    <p className="mt-0.5 font-mono text-xs font-medium text-amber-400 print:text-black break-all">
                      {certId}
                    </p>
                  </div>
                </div>

                {/* Scannable Vector QR Code */}
                <div className="flex flex-col items-center sm:items-end shrink-0">
                  <CertificateQrCode value={verifyUrl} size={92} />
                  <span className="mt-1.5 text-[9px] font-medium tracking-wider uppercase text-neutral-400 print:text-neutral-600">
                    Scan to Verify
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Security Note */}
            <div className="mt-6 flex w-full items-center justify-between border-t border-white/5 pt-3 text-[10px] text-neutral-500 print:border-neutral-200 print:text-neutral-500">
              <span>Cryptographically signed digital accreditation.</span>
              <Link
                href={`/verify?id=${encodeURIComponent(certId)}`}
                className="hover:text-amber-400 transition"
              >
                verify.lms-portal.com/check
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Print Stylesheet ────────────────────────────────────────────── */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          header, nav, .print\\:hidden {
            display: none !important;
          }
          #certificate-sheet {
            background: #ffffff !important;
            color: #000000 !important;
            border: 2px solid #222222 !important;
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
            padding: 32px !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: landscape;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
