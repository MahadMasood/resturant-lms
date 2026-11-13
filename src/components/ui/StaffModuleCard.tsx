"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import VideoPlayer from "@/components/ui/VideoPlayer";

export default function StaffModuleCard({ staffName }: { staffName: string }) {
  const [videoCompleted, setVideoCompleted] = useState(false);

  useEffect(() => {
    fetch("/api/progress?moduleId=module-1", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.completed) setVideoCompleted(true);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${videoCompleted ? "text-emerald-400" : "text-amber-400"}`}>
          {videoCompleted ? "Video Complete" : "Pending Verification"}
        </span>
      </div>
      <h2 className="text-lg font-bold text-white">Module 1: Safety Protocols</h2>
      <p className="text-sm text-neutral-400">
        Watch at least <span className="text-white font-semibold">80%</span> of the video (no skipping) to unlock the quiz. Pass with <span className="text-white font-semibold">90%+</span> to earn your certificate.
      </p>

      <VideoPlayer
        src="/videos/module1-safety-protocols.mp4"
        moduleId="module-1"
        title={`Module 1: Safety Protocols · ${staffName}`}
        onCompletionChange={setVideoCompleted}
      />

      <div className="flex gap-3 pt-1">
        {videoCompleted ? (
          <Link
            href="/dashboard/staff/quiz"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Take Quiz →
          </Link>
        ) : (
          <div className="group relative">
            <button
              disabled
              className="rounded-lg bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-neutral-500 cursor-not-allowed flex items-center gap-1.5"
            >
              <span>Take Quiz</span>
              <span className="text-xs text-neutral-600">(Locked)</span>
            </button>
            <span className="absolute -top-8 left-0 hidden rounded bg-neutral-700 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap">
              Watch 80% of the video first
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

