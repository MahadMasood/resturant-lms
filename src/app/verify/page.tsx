"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface VerifiedCert {
  id: string;
  issuedAt: string;
  pdfUrl: string;
  recipientName: string;
  recipientEmail: string;
  venueName: string;
  courseTitle: string;
  score: number;
  passingThreshold: number;
  antiCheatVerification: {
    videoWatchedThresholdMet: boolean;
    highWaterMarkVerified: boolean;
    serverJitterTolerancePassed: boolean;
  };
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const certIdParam = searchParams.get("certId") || searchParams.get("id") || "";

  const [inputVal, setInputVal] = useState(certIdParam);
  const [loading, setLoading] = useState(Boolean(certIdParam));
  const [data, setData] = useState<VerifiedCert | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVerification = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`/api/verify?certId=${encodeURIComponent(id.trim())}`);
      const json = await res.json();
      if (!res.ok || !json.valid) {
        throw new Error(json.error || "Certificate record could not be found.");
      }
      setData(json.certificate);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to verify certificate.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certIdParam) {
      fetchVerification(certIdParam);
    }
  }, [certIdParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      fetchVerification(inputVal.trim());
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-200 px-4 py-12 flex flex-col justify-between">
      <div className="mx-auto max-w-2xl w-full space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Platform Home</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 border border-neutral-800 px-3 py-1 text-xs text-neutral-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Public Verification Portal
          </span>
        </div>

        {/* Verification Lookup Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
            <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Accreditation Credential Verification
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 max-w-md mx-auto">
            Instant cryptographic verification of food safety and compliance certificates for health inspectors, venue operators, and regulatory auditors.
          </p>
        </div>

        {/* Search / Lookup Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter Certificate ID or Verification Hash..."
            className="flex-1 rounded-2xl border border-neutral-800 bg-neutral-900/90 px-4 py-3 text-xs md:text-sm text-white placeholder-neutral-500 outline-none focus:border-blue-500 font-mono transition"
          />
          <button
            type="submit"
            disabled={loading || !inputVal.trim()}
            className="rounded-2xl bg-blue-600 px-6 py-3 text-xs md:text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            <span>Verify</span>
          </button>
        </form>

        {/* Error Notification */}
        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-5 text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Verification Unsuccessful</span>
            </div>
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {/* Verified Result Card */}
        {data && (
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-neutral-900 to-neutral-950 p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Top Seal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/20">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      Accreditation Verified
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Authentic Certificate</h2>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Verification ID</span>
                <span className="font-mono text-xs text-neutral-300 font-bold">{data.id}</span>
              </div>
            </div>

            {/* Recipient and Venue Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold block mb-1">
                  Accredited Staff Member
                </span>
                <p className="text-base font-bold text-white">{data.recipientName}</p>
                <p className="text-xs text-neutral-400 mt-0.5 font-mono">{data.recipientEmail}</p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold block mb-1">
                  Hospitality Organization / Venue
                </span>
                <p className="text-base font-bold text-white">{data.venueName}</p>
                <p className="text-xs text-neutral-400 mt-0.5">Licensed Multi-Tenant Venue</p>
              </div>
            </div>

            {/* Curriculum & Score */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold block mb-1">
                    Completed Curriculum
                  </span>
                  <p className="text-base font-bold text-white">{data.courseTitle}</p>
                </div>
                <div className="sm:text-right">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold block mb-1">
                    Score Achieved
                  </span>
                  <div className="flex items-center sm:justify-end gap-2">
                    <span className="text-xl font-bold font-mono text-emerald-400">{data.score}%</span>
                    <span className="text-[10px] text-neutral-500">(Passing: {data.passingThreshold}%)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 text-xs text-neutral-400 flex items-center justify-between">
                <span>Issued: {new Date(data.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                <span className="text-emerald-400 font-medium">Compliance Standards Met</span>
              </div>
            </div>

            {/* Anti-Cheat Audit Trail Box */}
            <div className="rounded-2xl border border-neutral-800/90 bg-neutral-950/50 p-4 space-y-2.5">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                Cryptographic Anti-Cheat Audit Verification
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Video Watched &ge; 80%</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>High-Water Mark Verified</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Jitter-Tolerant Rejection</span>
                </div>
              </div>
            </div>

            {/* Document Action Button */}
            <div className="pt-2 flex justify-center">
              <a
                href={data.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-6 py-3 text-xs font-semibold text-white transition shadow-lg"
              >
                <svg className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>View Original Certificate Document</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-neutral-600">
        Restaurant LMS Accreditation Verification System &middot; Official Compliance Engine
      </footer>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-neutral-500 text-sm">
          Loading verification portal...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
