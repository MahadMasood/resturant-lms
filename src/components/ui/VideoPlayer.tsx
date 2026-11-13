"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  src: string;
  moduleId: string;
  title: string;
  onCompletionChange?: (completed: boolean) => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ src, moduleId, title, onCompletionChange }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxReached, setMaxReached] = useState(0); // high-water mark
  const [percent, setPercent] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "skip">("idle");
  const [skipNotice, setSkipNotice] = useState<string | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const maxReachedRef = useRef(0);
  const lastReportedRef = useRef(0);
  const playingRef = useRef(false);
  const isSnappingRef = useRef(false);
  const isScrubbingRef = useRef(false);
  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    isScrubbingRef.current = isScrubbing;
  }, [isScrubbing]);

  // Show skip alert banner with auto-dismiss
  const showSkipMessage = useCallback((msg: string) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setSkipNotice(msg);
    noticeTimerRef.current = setTimeout(() => {
      setSkipNotice(null);
    }, 4000);
  }, []);

  // Snaps the video back to last confirmed position without freezing
  const snapBackToAllowed = useCallback(
    (targetPos: number, userInitiated = false) => {
      const v = videoRef.current;
      if (!v || isSnappingRef.current) return;
      isSnappingRef.current = true;

      const safePos = Math.max(0, targetPos);
      v.currentTime = safePos;
      setCurrentTime(safePos);

      const msg = userInitiated
        ? `Forward skipping is disabled. Scrubbing is only allowed within the watched section (${formatTime(safePos)}).`
        : `Unconfirmed skip detected. Returned to last confirmed point (${formatTime(safePos)}).`;

      showSkipMessage(msg);
      setSaveStatus("skip");

      setTimeout(() => {
        isSnappingRef.current = false;
        if (playingRef.current && v.paused) {
          v.play().catch(() => {});
        }
      }, 120);
    },
    [showSkipMessage]
  );

  // ── Load existing user progress on mount ──────────────────────────────────
  useEffect(() => {
    let active = true;
    async function loadInitialProgress() {
      try {
        const res = await fetch(`/api/progress?moduleId=${encodeURIComponent(moduleId)}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && active) {
          const maxSec = Number(data.maxWatchedSeconds) || 0;
          maxReachedRef.current = maxSec;
          lastReportedRef.current = maxSec;
          setMaxReached(maxSec);
          setPercent(Number(data.percentWatched) || 0);

          if (data.completed) {
            setCompleted(true);
            onCompletionChange?.(true);
          }

          if (videoRef.current && Number(data.watchedSeconds) > 0) {
            videoRef.current.currentTime = Math.min(Number(data.watchedSeconds), maxSec);
            setCurrentTime(videoRef.current.currentTime);
          }
        }
      } catch {
        /* Ignore error on load */
      }
    }

    loadInitialProgress();
    return () => {
      active = false;
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, [moduleId, onCompletionChange]);

  // ── Report progress to server ──────────────────────────────────────────────
  const reportProgress = useCallback(
    async (current: number, hwm: number, dur: number) => {
      if (!Number.isFinite(dur) || dur <= 0) return;
      if (!Number.isFinite(current) || current < 0) return;
      if (!Number.isFinite(hwm) || hwm < 0) return;

      const isFirst = lastReportedRef.current === 0 && hwm > 0;
      const isFiveSecInterval = hwm - lastReportedRef.current >= 5;
      const isEnd = current >= dur - 0.5;
      if (!isFirst && !isFiveSecInterval && !isEnd) return;

      lastReportedRef.current = hwm;
      setSaveStatus("saving");

      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleId,
            watchedSeconds: Math.round(current),
            maxWatchedSeconds: Math.round(hwm),
            durationSeconds: Math.round(dur),
          }),
        });

        if (res.status === 422) {
          const data = await res.json().catch(() => null);
          const confirmedPos = Number(
            data?.lastConfirmedSeconds ?? data?.record?.maxWatchedSeconds ?? maxReachedRef.current
          );
          maxReachedRef.current = confirmedPos;
          setMaxReached(confirmedPos);
          snapBackToAllowed(confirmedPos, false);
          return;
        }

        if (!res.ok) {
          setSaveStatus("idle");
          return;
        }

        const data = await res.json();
        if (data?.completed) {
          setCompleted(true);
          onCompletionChange?.(true);
        }
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("idle");
      }
    },
    [moduleId, onCompletionChange, snapBackToAllowed]
  );

  // ── Scrubbing handler (works for clicks AND drag) ──────────────────────────
  const handleScrub = (targetSec: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;

    const allowedMax = maxReachedRef.current;

    if (targetSec > allowedMax + 0.8) {
      // User tried to drag or click past the watched portion
      v.currentTime = allowedMax;
      setCurrentTime(allowedMax);
      showSkipMessage(
        `Forward skipping is locked. You can scrub anywhere up to ${formatTime(allowedMax)}.`
      );
    } else {
      // Allowed scrub within watched portion
      const safeTarget = Math.max(0, targetSec);
      v.currentTime = safeTarget;
      setCurrentTime(safeTarget);
    }
  };

  // ── Intercept browser-level seek attempts (e.g. keyboard shortcuts) ────────
  const handleSeeking = useCallback(() => {
    if (isSnappingRef.current) return;
    const v = videoRef.current;
    if (!v) return;

    if (v.currentTime > maxReachedRef.current + 1.2) {
      snapBackToAllowed(maxReachedRef.current, true);
    }
  }, [snapBackToAllowed]);

  const handleSeeked = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      setCurrentTime(v.currentTime);
    }
  }, []);

  // ── Time update — advance high-water mark during legitimate forward play ──
  const handleTimeUpdate = useCallback(() => {
    if (isSnappingRef.current || isScrubbingRef.current) return;
    const v = videoRef.current;
    if (!v) return;

    const ct = v.currentTime;
    const dur = v.duration;
    if (!Number.isFinite(dur) || dur <= 0) return;

    // Check for abnormal leaps
    if (ct > maxReachedRef.current + 2.5) {
      snapBackToAllowed(maxReachedRef.current, true);
      return;
    }

    setCurrentTime(ct);

    // High-water mark advances only when watching new content forward
    if (playing && ct > maxReachedRef.current) {
      maxReachedRef.current = ct;
      setMaxReached(ct);
      const pct = Math.min(100, Math.round((ct / dur) * 100));
      setPercent(pct);
    }

    if (playing) {
      reportProgress(ct, maxReachedRef.current, dur);
    }
  }, [playing, reportProgress, snapBackToAllowed]);

  const handleLoadedMetadata = () => {
    if (videoRef.current && Number.isFinite(videoRef.current.duration)) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleEnded = useCallback(() => {
    const v = videoRef.current;
    if (v && Number.isFinite(v.duration)) {
      reportProgress(v.duration, v.duration, v.duration);
    }
    setPlaying(false);
  }, [reportProgress]);

  // Rate change check — enforce max 1.5x
  const handleRateChange = useCallback(() => {
    const v = videoRef.current;
    if (v && v.playbackRate > 1.5) {
      v.playbackRate = 1;
      showSkipMessage("Playback speed is capped at 1.5x for accredited training.");
    }
  }, [showSkipMessage]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.addEventListener("seeking", handleSeeking);
    v.addEventListener("seeked", handleSeeked);
    v.addEventListener("ratechange", handleRateChange);
    return () => {
      v.removeEventListener("seeking", handleSeeking);
      v.removeEventListener("seeked", handleSeeked);
      v.removeEventListener("ratechange", handleRateChange);
    };
  }, [handleSeeking, handleSeeked, handleRateChange]);

  // Report on unmount
  useEffect(() => {
    return () => {
      const v = videoRef.current;
      if (v && Number.isFinite(v.duration) && v.duration > 0) {
        reportProgress(v.currentTime, maxReachedRef.current, v.duration);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  // Jump relative seconds (e.g. rewind 5s)
  const jumpRelative = (deltaSeconds: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const target = v.currentTime + deltaSeconds;
    handleScrub(target);
  };

  const durSafe = duration > 0 ? duration : 1;
  const watchedPct = Math.min(100, (maxReached / durSafe) * 100);
  const currentPct = Math.min(100, Math.max(0, (currentTime / durSafe) * 100));

  return (
    <div className="relative overflow-hidden rounded-xl border border-neutral-700 bg-black">
      {/* Skip Warning Toast / Banner Overlay */}
      {skipNotice && (
        <div className="absolute top-3 left-3 right-3 z-30 flex items-start gap-3 rounded-xl border border-amber-500/60 bg-amber-950/95 p-3.5 shadow-2xl backdrop-blur transition-all duration-300">
          <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1 text-xs">
            <p className="font-bold text-amber-200 uppercase tracking-wider text-[10px]">Notice</p>
            <p className="text-amber-100/90 mt-0.5 leading-relaxed">{skipNotice}</p>
          </div>
          <button
            type="button"
            onClick={() => setSkipNotice(null)}
            className="rounded-lg bg-amber-900/60 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-800 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        className="w-full cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        preload="metadata"
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
      />

      <div className="bg-neutral-900 px-4 py-3 space-y-2.5">
        {/* Interactive Scrub Bar with Drag + Click Support */}
        <div className="relative flex items-center h-5 w-full select-none group">
          {/* Background track (full duration) */}
          <div className="absolute inset-x-0 h-2 rounded-full bg-neutral-800 overflow-hidden">
            {/* Watched portion (unlocked zone — indigo) */}
            <div
              className="h-full bg-indigo-600 transition-all duration-100"
              style={{ width: `${watchedPct}%` }}
            />
          </div>

          {/* Locked zone visual hint (dimmed hatched overlay) */}
          <div
            className="absolute right-0 h-2 rounded-r-full bg-neutral-950/50 pointer-events-none"
            style={{ width: `${Math.max(0, 100 - watchedPct)}%` }}
          />

          {/* Interactive Native Range Slider — captures mouse drag, click, and touch natively */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onPointerDown={() => setIsScrubbing(true)}
            onPointerUp={() => {
              setIsScrubbing(false);
              const v = videoRef.current;
              if (v && playingRef.current && v.paused) {
                v.play().catch(() => {});
              }
            }}
            onChange={(e) => handleScrub(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Drag to scrub through watched portion"
          />

          {/* Visual Thumb / Playhead */}
          <div
            className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-md border border-neutral-300 pointer-events-none transition-transform duration-75 ${
              isScrubbing ? "scale-125 ring-2 ring-indigo-400" : "group-hover:scale-110"
            }`}
            style={{ left: `calc(${currentPct}% - 7px)` }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-3">
          {/* Play/Pause + Rewind buttons + Time */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              title={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Quick Rewind 5s within watched part */}
            <button
              type="button"
              onClick={() => jumpRelative(-5)}
              className="flex items-center gap-1 rounded-md bg-neutral-800 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-700 hover:text-white transition font-medium"
              title="Rewind 5 seconds"
            >
              -5s
            </button>

            {/* Quick Forward 5s (capped to watched part) */}
            <button
              type="button"
              onClick={() => jumpRelative(5)}
              className="flex items-center gap-1 rounded-md bg-neutral-800 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-700 hover:text-white transition font-medium"
              title="Forward 5 seconds (within watched section)"
            >
              +5s
            </button>

            <span className="ml-1 text-xs text-neutral-400 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Percent pill */}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                percent >= 80
                  ? "bg-emerald-900/40 text-emerald-400"
                  : "bg-neutral-800 text-neutral-400"
              }`}
            >
              {percent}% watched
            </span>

            {/* Save status indicator */}
            {saveStatus === "saving" && (
              <span className="text-xs text-neutral-500 animate-pulse">saving...</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-emerald-400">saved</span>
            )}
            {saveStatus === "skip" && (
              <span className="text-xs text-amber-400 font-medium">snapped back</span>
            )}

            {completed && (
              <span className="rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Info hint */}
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-0.5">
          <span>
            {maxReached > 0
              ? `Scrub freely between 0:00 and ${formatTime(maxReached)} · Locked after ${formatTime(maxReached)}`
              : "Watch forward to unlock the timeline"}
          </span>
          <span className="text-neutral-600">{title}</span>
        </div>
      </div>
    </div>
  );
}
