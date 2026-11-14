"use client";

import { useState } from "react";
import Link from "next/link";
import VideoPlayer from "@/components/ui/VideoPlayer";

interface StaffModuleCardProps {
  module: {
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
  };
  staffName: string;
  onRefresh?: () => void;
}

export default function StaffModuleCard({ module, staffName, onRefresh }: StaffModuleCardProps) {
  const [videoCompleted, setVideoCompleted] = useState(
    module.completed || (module.durationSeconds > 0 && module.watchedSeconds >= module.durationSeconds * 0.8)
  );

  const handleCompletionChange = (isDone: boolean) => {
    setVideoCompleted(isDone);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 md:p-7 shadow-lg space-y-5 transition">
      {/* Header Badge & Title */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                module.quizPassed
                  ? "bg-emerald-950/80 border border-emerald-500/30 text-emerald-400"
                  : videoCompleted
                  ? "bg-indigo-950/80 border border-indigo-500/30 text-indigo-400"
                  : "bg-amber-950/80 border border-amber-500/30 text-amber-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  module.quizPassed
                    ? "bg-emerald-400"
                    : videoCompleted
                    ? "bg-indigo-400"
                    : "bg-amber-400 animate-pulse"
                }`}
              />
              {module.quizPassed
                ? "Accreditation Passed"
                : videoCompleted
                ? "Video Complete — Quiz Unlocked"
                : "Watch Verification Required"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{module.title}</h2>
          <p className="mt-1 text-xs md:text-sm text-neutral-400">
            {module.description ||
              "Watch at least 80% of the training video without skipping to unlock the accreditation evaluation."}
          </p>
        </div>

        {module.quizScore !== null && (
          <div className="text-right shrink-0">
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Score</p>
            <p
              className={`text-lg font-bold ${
                module.quizPassed ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {module.quizScore}%
            </p>
          </div>
        )}
      </div>

      {/* Embedded Video Player with Anti-Cheat Skip Detection */}
      <VideoPlayer
        src={module.videoUrl || "/videos/module1-safety-protocols.mp4"}
        moduleId={module.id}
        title={`${module.title} · ${staffName}`}
        onCompletionChange={handleCompletionChange}
      />

      {/* Bottom Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/80 pt-4">
        <div className="text-xs text-neutral-400">
          Passing mark: <span className="font-semibold text-white">90%</span> to qualify for digital certification.
        </div>

        <div className="flex items-center gap-3">
          {module.certificateUrl ? (
            <a
              href={module.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              View Certificate
            </a>
          ) : null}

          {videoCompleted ? (
            <Link
              href={`/dashboard/staff/quiz?moduleId=${encodeURIComponent(module.id)}`}
              className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition shadow-lg ${
                module.quizPassed
                  ? "bg-neutral-800 border border-neutral-700 hover:bg-neutral-700"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25"
              }`}
            >
              <span>{module.quizPassed ? "Review / Retake Quiz" : "Take Evaluation Quiz"}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div className="group relative">
              <button
                disabled
                className="flex items-center gap-2 rounded-xl bg-neutral-800/80 px-5 py-2.5 text-xs font-semibold text-neutral-500 cursor-not-allowed border border-neutral-800"
              >
                <svg className="w-3.5 h-3.5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Take Evaluation Quiz</span>
                <span className="text-[10px] text-neutral-600">(Locked)</span>
              </button>
              <div className="pointer-events-none absolute -top-8 right-0 hidden rounded-md bg-neutral-800 border border-neutral-700 px-2.5 py-1 text-[11px] text-neutral-300 shadow-lg group-hover:block whitespace-nowrap">
                Watch 80% of video to unlock
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
