// ─── File-based progress store (prototype) ────────────────────────────────────

import { promises as fs } from "fs";
import path from "path";

export interface WatchProgress {
  userId: string;
  userName: string;
  moduleId: string;
  watchedSeconds: number;      // current playback position
  maxWatchedSeconds: number;   // high-water mark — furthest point genuinely reached
  durationSeconds: number;
  percentWatched: number;      // based on maxWatchedSeconds
  lastUpdated: string;
  completed: boolean;          // true once maxWatchedSeconds ≥ 80% of duration
  quizScore?: number | null;
  quizPassed?: boolean;
}

const STORE_PATH = path.join(process.cwd(), ".next", "progress-store.json");

async function readStore(): Promise<Record<string, WatchProgress>> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as Record<string, WatchProgress>;
  } catch {
    return {};
  }
}

async function writeStore(data: Record<string, WatchProgress>): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getProgress(
  userId: string,
  moduleId: string
): Promise<WatchProgress | null> {
  const store = await readStore();
  const key = `${userId}:${moduleId}`;
  return store[key] ?? null;
}

export async function upsertProgress(
  data: Omit<WatchProgress, "lastUpdated" | "completed" | "percentWatched">
): Promise<{ record: WatchProgress; rejected: boolean }> {
  const store = await readStore();
  const key = `${data.userId}:${data.moduleId}`;
  const existing = store[key];

  const duration = data.durationSeconds > 0 ? data.durationSeconds : 38;
  const storedMax = existing?.maxWatchedSeconds ?? 0;

  // ── Anti-skip validation ───────────────────────────────────────────────────
  // Allow a 12-second tolerance window for network latency and timer interval.
  const TOLERANCE = 12;
  const candidateMax = Math.max(0, data.maxWatchedSeconds);

  const fallbackRecord: WatchProgress = existing ?? {
    userId: data.userId,
    userName: data.userName,
    moduleId: data.moduleId,
    watchedSeconds: Math.min(data.watchedSeconds, storedMax),
    maxWatchedSeconds: storedMax,
    durationSeconds: duration,
    percentWatched: Math.min(100, Math.round((storedMax / duration) * 100)),
    completed: storedMax >= duration * 0.8,
    lastUpdated: new Date().toISOString(),
  };

  if (candidateMax > storedMax + TOLERANCE) {
    // Suspicious forward jump beyond allowed tolerance
    return { record: fallbackRecord, rejected: true };
  }

  // High-water mark only ever moves forward
  const newMax = Math.min(duration, Math.max(storedMax, candidateMax));
  const percentWatched = Math.min(100, Math.round((newMax / duration) * 100));
  const completed = percentWatched >= 80;

  const record: WatchProgress = {
    userId: data.userId,
    userName: data.userName,
    moduleId: data.moduleId,
    watchedSeconds: Math.min(data.watchedSeconds, duration),
    maxWatchedSeconds: newMax,
    durationSeconds: duration,
    percentWatched,
    completed,
    lastUpdated: new Date().toISOString(),
  };

  store[key] = record;
  await writeStore(store);
  return { record, rejected: false };
}

export async function updateQuizScore(
  userId: string,
  moduleId: string,
  quizScore: number
): Promise<WatchProgress> {
  const store = await readStore();
  const key = `${userId}:${moduleId}`;
  const existing = store[key];

  const quizPassed = quizScore >= 90;
  const record: WatchProgress = {
    userId,
    userName: existing?.userName ?? userId,
    moduleId,
    watchedSeconds: existing?.watchedSeconds ?? 38,
    maxWatchedSeconds: existing?.maxWatchedSeconds ?? 38,
    durationSeconds: existing?.durationSeconds ?? 38,
    percentWatched: existing?.percentWatched ?? 100,
    completed: existing?.completed ?? true,
    quizScore,
    quizPassed,
    lastUpdated: new Date().toISOString(),
  };

  store[key] = record;
  await writeStore(store);
  return record;
}

export async function getAllProgress(): Promise<WatchProgress[]> {
  const store = await readStore();
  return Object.values(store);
}
