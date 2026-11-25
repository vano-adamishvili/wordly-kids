"use client";

import { useSyncExternalStore } from "react";
import { MALTA_ITEMS, type MaltaItem } from "./malta";

/**
 * Adult learner progress — stored completely separately from the children's
 * progress (`wordly-kids-progress-v1` is never read or written here).
 */
export const ADULT_KEY = "wivilo-adult-progress-v1";

export type AdultStatus = "new" | "learning" | "known";
export type AdultItemProgress = {
  status: AdultStatus;
  seen: number;
  correct: number;
  wrong: number;
  difficult: boolean;
  dirs?: Partial<Record<"en-ka" | "ka-en", { known: number; again: number }>>;
  last?: string; // YYYY-MM-DD of last practice
};
export type AdultProgress = {
  version: 1;
  items: Record<string, AdultItemProgress>;
  quizzes: Record<string, { best: number; total: number; plays: number; last: number }>;
  days: string[];
  lastSet?: string;
  slowAudio?: boolean;
};

const EMPTY: AdultProgress = { version: 1, items: {}, quizzes: {}, days: [] };
let cache: AdultProgress | null = null;
const listeners = new Set<() => void>();

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function read(): AdultProgress {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(ADULT_KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as AdultProgress) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}
function write(next: AdultProgress) {
  cache = next;
  try {
    window.localStorage.setItem(ADULT_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}
function update(fn: (p: AdultProgress) => AdultProgress) {
  const next = fn(read());
  const t = todayKey();
  if (!next.days.includes(t)) next.days = [...next.days, t].slice(-60);
  write(next);
}
const ip = (p: AdultProgress, id: string): AdultItemProgress =>
  p.items[id] ?? { status: "new", seen: 0, correct: 0, wrong: 0, difficult: false };

export const adultActions = {
  seen(id: string, set?: string) {
    update((p) => {
      const w = ip(p, id);
      return {
        ...p,
        lastSet: set ?? p.lastSet,
        items: { ...p.items, [id]: { ...w, seen: w.seen + 1, status: w.status === "new" ? "learning" : w.status, last: todayKey() } },
      };
    });
  },
  /** "ვიცი" / "რთულია" from learn mode or flashcards */
  rate(id: string, known: boolean, dir?: "en-ka" | "ka-en") {
    update((p) => {
      const w = ip(p, id);
      const dirs = dir
        ? { ...(w.dirs ?? {}), [dir]: { known: (w.dirs?.[dir]?.known ?? 0) + (known ? 1 : 0), again: (w.dirs?.[dir]?.again ?? 0) + (known ? 0 : 1) } }
        : w.dirs;
      return {
        ...p,
        items: { ...p.items, [id]: { ...w, status: known ? "known" : "learning", difficult: !known, dirs, last: todayKey() } },
      };
    });
  },
  /** quiz answer: mistakes are kept for review */
  answer(id: string, ok: boolean) {
    update((p) => {
      const w = ip(p, id);
      const correct = w.correct + (ok ? 1 : 0);
      const status: AdultStatus = !ok ? "learning" : correct >= 2 || w.status === "known" ? "known" : "learning";
      return {
        ...p,
        items: { ...p.items, [id]: { ...w, correct, wrong: w.wrong + (ok ? 0 : 1), status, difficult: ok ? w.difficult && !(correct >= 2) : true, last: todayKey() } },
      };
    });
  },
  finishQuiz(key: string, score: number, total: number) {
    update((p) => {
      const prev = p.quizzes[key] ?? { best: 0, total, plays: 0, last: 0 };
      return { ...p, quizzes: { ...p.quizzes, [key]: { best: Math.max(prev.best, score), total, plays: prev.plays + 1, last: score } } };
    });
  },
  setLastSet(set: string) {
    const cur = read();
    if (cur.lastSet !== set) write({ ...cur, lastSet: set });
  },
  setSlow(slow: boolean) {
    write({ ...read(), slowAudio: slow });
  },
  restore(data: AdultProgress) {
    try {
      const raw = window.localStorage.getItem(ADULT_KEY);
      if (raw) window.localStorage.setItem(`${ADULT_KEY}-backup-before-restore`, raw);
    } catch {}
    write({ ...EMPTY, ...data, version: 1 });
  },
};

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === ADULT_KEY) {
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

export function useAdultProgress(): [AdultProgress, boolean] {
  const p = useSyncExternalStore(subscribe, read, () => EMPTY);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return [p, hydrated];
}

export const statusOfItem = (p: AdultProgress, id: string): AdultStatus => p.items[id]?.status ?? "new";
export const isStudied = (p: AdultProgress, id: string) => statusOfItem(p, id) !== "new";

/**
 * Due for review: marked difficult / answered wrong, still "learning",
 * or known but not practised for 3+ days.
 */
export function isDue(p: AdultProgress, id: string): boolean {
  const w = p.items[id];
  if (!w || w.status === "new") return false;
  if (w.difficult || w.status === "learning") return true;
  if (!w.last) return false;
  const days = (Date.parse(todayKey()) - Date.parse(w.last)) / 86400000;
  return days >= 3;
}

/** Quick Review list: difficult first, then most mistakes, then oldest. */
export function reviewItems(p: AdultProgress, limit = 15): MaltaItem[] {
  const score = (i: MaltaItem) => {
    const w = p.items[i.id]!;
    return (w.difficult ? 1000 : 0) + (w.status === "learning" ? 300 : 0) + w.wrong * 20 - w.correct;
  };
  return MALTA_ITEMS.filter((i) => isDue(p, i.id))
    .sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function parseAdultBackup(text: string): AdultProgress | string {
  try {
    const d = JSON.parse(text);
    const data = d && d.app === "wivilo-adult" ? d.progress : d;
    if (!data || data.version !== 1 || typeof data.items !== "object" || !Array.isArray(data.days)) return "ფაილი არ არის Wivilo-ს (მოზრდილების) სარეზერვო ასლი";
    for (const [id, w] of Object.entries(data.items as Record<string, AdultItemProgress>)) {
      if (!/^MT-\d{3}$/.test(id) || !w || !["new", "learning", "known"].includes(w.status)) return `ჩანაწერი ${id} დაზიანებულია`;
    }
    return { ...data, quizzes: data.quizzes ?? {} } as AdultProgress;
  } catch {
    return "ფაილის წაკითხვა ვერ მოხერხდა";
  }
}
export const adultBackupJSON = (p: AdultProgress) =>
  JSON.stringify({ app: "wivilo-adult", format: 1, exportedAt: new Date().toISOString(), progress: p }, null, 2);
