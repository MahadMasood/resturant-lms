"use client";

import { useState, useEffect, useCallback } from "react";
import StaffModuleCard from "@/components/ui/StaffModuleCard";

interface StaffModuleItem {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  watchedSeconds: number;
  durationSeconds: number;
  completed: boolean;
  quizPassed: boolean;
  quizScore: number | null;
  certificateUrl: string | null;
}

interface CertificateItem {
  id: string;
  moduleId: string;
  moduleName: string;
  pdfUrl: string;
  issuedAt: string;
}

interface StaffViewProps {
  staffName: string;
  tenantName: string;
}

export default function StaffView({ staffName, tenantName }: StaffViewProps) {
  const [modules, setModules] = useState<StaffModuleItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [modRes, certRes] = await Promise.all([
        fetch("/api/staff/modules", { cache: "no-store" }),
        fetch("/api/staff/certificates", { cache: "no-store" }),
      ]);

      if (modRes.ok) {
        const modData = await modRes.json();
        setModules(modData);
      }
      if (certRes.ok) {
        const certData = await certRes.json();
        setCertificates(certData);
      }
    } catch (err) {
      console.error("Failed to load staff data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const completedCount = modules.filter((m) => m.quizPassed).length;
  const inProgressCount = modules.filter((m) => !m.quizPassed && m.watchedSeconds > 0).length;

  return (
    <div className="space-y-8">
      {/* Welcome & Context Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-3 py-1 text-xs text-neutral-400 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {tenantName} Training Portal
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Welcome back, {staffName}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Complete your required video lessons, pass compliance evaluations, and earn digital certificates.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-400">{modules.length}</p>
          <p className="text-xs text-neutral-400 mt-1">Assigned Modules</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
          <p className="text-xs text-neutral-400 mt-1">Certified Complete</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{inProgressCount}</p>
          <p className="text-xs text-neutral-400 mt-1">In Progress</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{certificates.length}</p>
          <p className="text-xs text-neutral-400 mt-1">Certificates Earned</p>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
            Training Curriculums
          </h2>
          <span className="text-xs text-neutral-500">
            {completedCount} of {modules.length} Completed
          </span>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-12 text-center text-sm text-neutral-500">
            Loading your modules from database...
          </div>
        ) : modules.length === 0 ? (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-12 text-center text-sm text-neutral-500">
            No training modules currently assigned. Check back later or notify your manager.
          </div>
        ) : (
          <div className="space-y-6">
            {modules.map((m) => (
              <StaffModuleCard
                key={m.id}
                module={m}
                staffName={staffName}
                onRefresh={loadData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Earned Certificates Section */}
      {certificates.length > 0 && (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h2 className="text-base font-bold text-white tracking-tight">Your Digital Certificates</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{cert.moduleName}</p>
                  <p className="text-xs text-neutral-500">
                    Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={cert.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

