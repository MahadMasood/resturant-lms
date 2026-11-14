"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import StaffModuleCard from "@/components/ui/StaffModuleCard";

interface StaffModuleItem {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  orderIndex?: number;
  questionCount?: number;
  watchedSeconds: number;
  durationSeconds: number;
  completed: boolean;
  quizPassed: boolean;
  quizScore: number | null;
  attemptsCount?: number;
  certificateUrl: string | null;
  isLocked?: boolean;
  requiredPreviousTitle?: string | null;
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

type TabType = "all" | "in_progress" | "certified" | "locked";

export default function StaffView({ staffName, tenantName }: StaffViewProps) {
  const [modules, setModules] = useState<StaffModuleItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const loadData = useCallback(async () => {
    try {
      const [modRes, certRes] = await Promise.all([
        fetch("/api/staff/modules", { cache: "no-store" }),
        fetch("/api/staff/certificates", { cache: "no-store" }),
      ]);

      if (modRes.ok) {
        const modData = await modRes.json();
        setModules(Array.isArray(modData) ? modData : []);
      }
      if (certRes.ok) {
        const certData = await certRes.json();
        setCertificates(Array.isArray(certData) ? certData : []);
      }
    } catch (err) {
      console.error("Failed to load staff training data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const certifiedCount = useMemo(() => modules.filter((m) => m.quizPassed).length, [modules]);
  const inProgressCount = useMemo(
    () => modules.filter((m) => !m.quizPassed && !m.isLocked && m.watchedSeconds > 0).length,
    [modules]
  );
  const lockedCount = useMemo(() => modules.filter((m) => m.isLocked).length, [modules]);
  const completionPercentage = useMemo(() => {
    if (modules.length === 0) return 0;
    return Math.round((certifiedCount / modules.length) * 100);
  }, [modules.length, certifiedCount]);

  const filteredModules = useMemo(() => {
    switch (activeTab) {
      case "in_progress":
        return modules.filter((m) => !m.quizPassed && !m.isLocked && m.watchedSeconds > 0);
      case "certified":
        return modules.filter((m) => m.quizPassed);
      case "locked":
        return modules.filter((m) => m.isLocked);
      case "all":
      default:
        return modules;
    }
  }, [modules, activeTab]);

  return (
    <div className="space-y-8">
      {/* Welcome & Context Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-3 py-1 text-xs text-neutral-400 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {tenantName} Training Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Welcome back, {staffName}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Complete your required anti-cheat video modules, pass evaluations, and maintain compliance accreditation.
          </p>
        </div>

        {/* Live sync badge */}
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 self-start md:self-auto rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
          title="Refresh progress data"
        >
          <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sync Progress
        </button>
      </div>

      {/* Curriculum Overall Progress Bar Card */}
      <div className="rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1">
              Curriculum Accreditation Status
            </div>
            <div className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <span>{certifiedCount} of {modules.length} Modules Certified</span>
              <span className="text-sm font-semibold text-neutral-400 font-mono">
                ({completionPercentage}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                completionPercentage === 100
                  ? "bg-emerald-950/80 border border-emerald-500/30 text-emerald-400"
                  : "bg-blue-950/80 border border-blue-500/30 text-blue-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  completionPercentage === 100 ? "bg-emerald-400" : "bg-blue-400"
                }`}
              />
              {completionPercentage === 100 ? "Fully Accredited" : "Accreditation In Progress"}
            </span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center mt-3 text-[11px] text-neutral-500">
          <span>Minimum 80% video verification required to unlock evaluation quizzes</span>
          <span>90% score required for certification</span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
          <p className="text-2xl font-bold text-white font-mono">{modules.length}</p>
          <p className="text-xs text-neutral-400 mt-1">Total Curriculums</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400 font-mono">{certifiedCount}</p>
          <p className="text-xs text-neutral-400 mt-1">Certified Complete</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
          <p className="text-2xl font-bold text-amber-400 font-mono">{inProgressCount}</p>
          <p className="text-xs text-neutral-400 mt-1">In Progress</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
          <p className="text-2xl font-bold text-purple-400 font-mono">{certificates.length}</p>
          <p className="text-xs text-neutral-400 mt-1">Certificates Earned</p>
        </div>
      </div>

      {/* Filter Tabs & Section Heading */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              Training Modules
            </h2>
            <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-neutral-400">
              {filteredModules.length}
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 rounded-2xl border border-neutral-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-neutral-800 text-white font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              All ({modules.length})
            </button>
            <button
              onClick={() => setActiveTab("in_progress")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                activeTab === "in_progress"
                  ? "bg-amber-950/70 border border-amber-500/30 text-amber-300 font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setActiveTab("certified")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                activeTab === "certified"
                  ? "bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Certified ({certifiedCount})
            </button>
            {lockedCount > 0 && (
              <button
                onClick={() => setActiveTab("locked")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                  activeTab === "locked"
                    ? "bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Locked ({lockedCount})
              </button>
            )}
          </div>
        </div>

        {/* Modules Render List */}
        {loading ? (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-12 text-center text-sm text-neutral-500">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Loading training curriculums...</span>
            </div>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-12 text-center text-sm text-neutral-500">
            {activeTab === "all"
              ? "No training modules currently assigned. Check back later or notify your manager."
              : `No modules match the "${activeTab.replace("_", " ")}" filter.`}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredModules.map((m) => (
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
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 md:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              <h2 className="text-base font-bold text-white tracking-tight">Your Digital Certificates</h2>
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              {certificates.length} Verified
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-700"
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
                  className="rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>View</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
