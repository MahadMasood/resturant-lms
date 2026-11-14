"use client";

import { useState, useEffect, useCallback } from "react";
import ModuleEditorModal, { ModuleDraft } from "@/components/ui/ModuleEditorModal";
import InviteStaffModal from "@/components/ui/InviteStaffModal";
import StaffProgressTable from "@/components/ui/StaffProgressTable";
import StatsCard from "@/components/ui/StatsCard";

interface ModuleItem {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  questionCount: number;
  createdAt: string;
}

interface StaffItem {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface ManagerViewProps {
  tenantName: string;
  managerName: string;
}

export default function ManagerView({ tenantName, managerName }: ManagerViewProps) {
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleDraft | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [modRes, staffRes] = await Promise.all([
        fetch("/api/manager/modules"),
        fetch("/api/manager/staff"),
      ]);

      if (modRes.ok) {
        const modData = await modRes.json();
        setModules(modData);
      }
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData);
      }
    } catch (err) {
      console.error("Failed to fetch manager data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreateModal = () => {
    setSelectedModule(null);
    setIsModuleModalOpen(true);
  };

  const handleEditModule = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/manager/modules/${moduleId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedModule(data);
        setIsModuleModalOpen(true);
      }
    } catch (err) {
      console.error("Error fetching module details:", err);
    }
  };

  const handleExportCSV = () => {
    window.location.href = "/api/manager/export/compliance";
  };

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 px-3 py-1 text-xs text-neutral-400 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {tenantName} Manager Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Welcome, {managerName}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Assign video curriculums, review compliance scores, and verify employee certificates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition shadow-sm"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Compliance
          </button>

          <button
            onClick={() => setIsStaffModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Staff Member
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/25"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Training Module
          </button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard
          label="Active Staff"
          value={staff.length}
          icon={
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
          accent="text-indigo-400"
        />
        <StatsCard
          label="Published Modules"
          value={modules.length}
          icon={
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          }
          accent="text-purple-400"
        />
        <StatsCard
          label="Passing Standard"
          value="90%"
          icon={
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
          accent="text-emerald-400"
        />
        <StatsCard
          label="Anti-Cheat System"
          value="Frame-Sync"
          icon={
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          }
          accent="text-amber-400"
        />
      </div>

      {/* Modules Management Section */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              Training Modules ({modules.length})
            </h2>
            <p className="text-xs text-neutral-400">
              Video courses with anti-cheat monitoring and custom quiz evaluations.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
          >
            <span>+ Create Module</span>
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-neutral-500 py-4">Loading modules from database...</p>
        ) : modules.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No training modules created yet. Click &quot;Create Training Module&quot; to publish your first course.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((m) => (
              <div
                key={m.id}
                className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 space-y-4 hover:border-neutral-700 transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-950/60 border border-indigo-500/20 text-indigo-400">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                        {m.title}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-1">
                        {m.description || "Video training and evaluation module"}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 shrink-0">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-800/80 pt-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {m.questionCount} Questions
                  </span>

                  <button
                    onClick={() => handleEditModule(m.id)}
                    className="flex items-center gap-1 text-xs text-neutral-300 hover:text-white transition font-medium rounded-lg bg-neutral-800/80 px-2.5 py-1 border border-neutral-700/60"
                  >
                    <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit &amp; Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live staff progress & compliance table */}
      <StaffProgressTable />

      {/* Modals */}
      <ModuleEditorModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSaved={loadData}
        initialModule={selectedModule}
      />

      <InviteStaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onStaffAdded={loadData}
      />
    </div>
  );
}
