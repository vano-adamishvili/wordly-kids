"use client";

import { useSyncExternalStore } from "react";

export type WordStatus = "new" | "learning" | "learned";

export type WordProgress = {
  status: WordStatus;
  seen: number;
  correct: number;
  wrong: number;
};

export type QuizRecord = { best: number; total: number; plays: number };

export type Progress = {
  version: 1;
  words: Record<number, WordProgress>;
  stars: number;
  quizzes: Record<string, QuizRecord>;
  days: string[]; // active days (YYYY-MM-DD), for the streak
  lastCategory?: string;
};

const KEY = "wordly-kids-progress-v1";
const EMPTY: Progress = { version: 1, words: {}, stars: 0, quizzes: {}, days: [] };

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function read(): Progress {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Progress) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: Progress) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked – keep in memory */
  }
  listeners.forEach((l) => l());
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function update(fn: (p: Progress) => Progress) {
  const cur = read();
  const next = fn(cur);
  const t = today();
  if (!next.days.includes(t)) next.days = [...next.days, t].slice(-60);
  write(next);
}

function wp(p: Progress, id: number): WordProgress {
  return p.words[id] ?? { status: "new", seen: 0, correct: 0, wrong: 0 };
}

const rank: Record<WordStatus, number> = { new: 0, learning: 1, learned: 2 };
const maxStatus = (a: WordStatus, b: WordStatus) => (rank[a] >= rank[b] ? a : b);

export const progressActions = {
  visitCategory(slug: string) {
    const cur = read();
    if (cur.lastCategory !== slug) write({ ...cur, lastCategory: slug });
  },
  markSeen(id: number, category?: string) {
    update((p) => {
      const w = wp(p, id);
      return {
        ...p,
        lastCategory: category ?? p.lastCategory,
        words: { ...p.words, [id]: { ...w, seen: w.seen + 1, status: maxStatus(w.status, "learning") } },
      };
    });
  },
  setStatus(id: number, status: WordStatus) {
    update((p) => {
      const w = wp(p, id);
      const gainedStar = status === "learned" && w.status !== "learned";
      return {
        ...p,
        stars: p.stars + (gainedStar ? 1 : 0),
        words: { ...p.words, [id]: { ...w, status } },
      };
    });
  },
  answer(id: number, ok: boolean) {
    update((p) => {
      const w = wp(p, id);
      const correct = w.correct + (ok ? 1 : 0);
      let status: WordStatus = maxStatus(w.status, "learning");
      if (ok && correct >= 2) status = "learned";
      const gainedStar = status === "learned" && w.status !== "learned";
      return {
        ...p,
        stars: p.stars + (gainedStar ? 1 : 0),
        words: { ...p.words, [id]: { ...w, correct, wrong: w.wrong + (ok ? 0 : 1), status } },
      };
    });
  },
  finishQuiz(key: string, score: number, total: number) {
    update((p) => {
      const prev = p.quizzes[key] ?? { best: 0, total, plays: 0 };
      const bonus = score === total ? 3 : score >= total * 0.7 ? 2 : score > 0 ? 1 : 0;
      return {
        ...p,
        stars: p.stars + bonus,
        quizzes: { ...p.quizzes, [key]: { best: Math.max(prev.best, score), total, plays: prev.plays + 1 } },
      };
    });
  },
  reset() {
    write({ ...EMPTY, days: [] });
  },
};

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

/** Returns [progress, hydrated]. On the server / first render progress is empty. */
export function useProgress(): [Progress, boolean] {
  const p = useSyncExternalStore(subscribe, read, () => EMPTY);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return [p, hydrated];
}

export function statusOf(p: Progress, id: number): WordStatus {
  return p.words[id]?.status ?? "new";
}

export function streak(p: Progress): number {
  if (p.days.length === 0) return 0;
  const set = new Set(p.days);
  let n = 0;
  const d = new Date();
  // allow streak to continue if today not yet active
  if (!set.has(today())) d.setDate(d.getDate() - 1);
  for (;;) {
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!set.has(k)) break;
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
