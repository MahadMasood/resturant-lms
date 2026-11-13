"use client";

import { useEffect, useState } from "react";
import type { WatchProgress } from "@/lib/progressStore";
import StatusBadge from "@/components/ui/StatusBadge";

// Staff roster — keyed by email to match what NextAuth stores as userId
const ALL_STAFF = [
  { userId: "john.doe@restaurant-a.com", userName: "John Doe", email: "john.doe@restaurant-a.com" },
  { userId: "jane.smith@restaurant-a.com", userName: "Jane Smith", email: "jane.smith@restaurant-a.com" },
];

const EMAIL_BY_ID: Record<string, string> = {
  "john.doe@restaurant-a.com": "john.doe@restaurant-a.com",
  "jane.smith@restaurant-a.com": "jane.smith@restaurant-a.com",
};

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-28 overflow-hidden rounded-full bg-neutral-700">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
            percent >= 80 ? "bg-emerald-500" : "bg-indigo-500"
          }`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-neutral-400">{percent}%</span>
    </div>
  );
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export default function StaffProgressTable() {
  const [progressMap, setProgressMap] = useState<Record<string, WatchProgress>>({});
  const [lastRefresh, setLastRefresh] = useState<string>("");
  const [error, setError] = useState("");

  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/progress/all", { cache: "no-store" });
      if (!res.ok) { setError(`API error ${res.status}`); return; }
      const data: WatchProgress[] = await res.json();
      // Key by userId for easy lookup
      const map: Record<string, WatchProgress> = {};
      data.forEach((p) => { map[p.userId] = p; });
      setProgressMap(map);
      setLastRefresh(new Date().toLocaleTimeString());
      setError("");
    } catch (e) {
      setError(String(e));
    }
  };

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
      {/* Header */}
      <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
          Staff Watch Progress
        </h2>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-neutral-500">
            {lastRefresh ? `Updated ${lastRefresh}` : "Loading…"}
          </span>
          <button
            onClick={fetchProgress}
            title="Refresh progress"
            className="ml-2 rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-700 transition"
          >
            Refresh
          </button>
          <button
            onClick={async () => {
              if (confirm("Reset all test watch & quiz progress to 0?")) {
                await fetch("/api/progress/reset", { method: "POST" });
                fetchProgress();
              }
            }}
            title="Clear all test progress back to 0%"
            className="rounded-md border border-red-900/50 bg-red-950/40 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/50 hover:text-red-300 transition"
          >
            Reset Test Data
          </button>
        </div>
      </div>

      {error && (
        <p className="px-6 py-3 text-xs text-red-400">Error: {error}</p>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-800 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
            <th className="px-6 py-3">Staff Member</th>
            <th className="px-6 py-3">Module</th>
            <th className="px-6 py-3">Watch Progress</th>
            <th className="px-6 py-3">Time Watched</th>
            <th className="px-6 py-3">Video Status</th>
            <th className="px-6 py-3">Quiz Score</th>
            <th className="px-6 py-3">Certificate</th>
            <th className="px-6 py-3">Last Active</th>
          </tr>
        </thead>
        <tbody>
          {ALL_STAFF.map((staff) => {
            const p = progressMap[staff.userId];
            const statusLabel: "Pending" | "In Progress" | "Completed" = !p
              ? "Pending"
              : p.completed
              ? "Completed"
              : "In Progress";

            return (
              <tr
                key={staff.userId}
                className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-800/40 transition"
              >
                {/* Name */}
                <td className="px-6 py-4">
                  <p className="font-medium text-white">
                    {p?.userName ?? staff.userName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {EMAIL_BY_ID[staff.userId]}
                  </p>
                </td>

                {/* Module */}
                <td className="px-6 py-4 text-neutral-300 text-xs">
                  Module 1: Safety Protocols
                </td>

                {/* Progress bar */}
                <td className="px-6 py-4">
                  <ProgressBar percent={p?.percentWatched ?? 0} />
                </td>

                {/* Time */}
                <td className="px-6 py-4 text-xs text-neutral-400 tabular-nums">
                  {p ? (
                    <>
                      <span className="text-white">{fmt(p.watchedSeconds)}</span>
                      <span className="text-neutral-600"> / {fmt(p.durationSeconds)}</span>
                    </>
                  ) : "—"}
                </td>

                {/* Status badge */}
                <td className="px-6 py-4">
                  <StatusBadge status={statusLabel} />
                </td>

                {/* Quiz score */}
                <td className="px-6 py-4 text-xs">
                  {typeof p?.quizScore === "number" ? (
                    <span
                      className={`font-semibold ${
                        p.quizScore >= 90 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {p.quizScore}% {p.quizScore >= 90 ? "(Passed)" : ""}
                    </span>
                  ) : (
                    <span className="text-neutral-500">—</span>
                  )}
                </td>

                {/* Certificate */}
                <td className="px-6 py-4 text-xs">
                  {p?.quizPassed ? (
                    <span className="rounded-full bg-emerald-900/30 px-2.5 py-0.5 text-emerald-400 font-medium">
                      Eligible
                    </span>
                  ) : (
                    <span className="text-neutral-500">—</span>
                  )}
                </td>

                {/* Last active */}
                <td className="px-6 py-4 text-xs text-neutral-500">
                  {p
                    ? new Date(p.lastUpdated).toLocaleTimeString()
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
