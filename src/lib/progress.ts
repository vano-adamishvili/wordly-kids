"use client";

import { useSyncExternalStore } from "react";

export type WordStatus = "new" | "learning" | "learned";

export type Direction = "en-ka" | "ka-en";
export type DirStat = { known: number; again: number };

export type WordProgress = {
  status: WordStatus;
  seen: number;
  correct: number;
  wrong: number;
  /** v1.2 (optional): needs review – set by "გასამეორებელია"/wrong answer, cleared by "ვიცი"/correct */
  review?: boolean;
  /** v1.2 (optional): flashcard recognition per translation direction */
  dirs?: Partial<Record<Direction, DirStat>>;
};

export type QuizRecord = { best: number; total: number; plays: number };

export type Progress = {
  version: 1;
  words: Record<number, WordProgress>;
  stars: number;
  quizzes: Record<string, QuizRecord>;
  days: string[]; // active days (YYYY-MM-DD), for the streak
  lastCategory?: string;
  /** ids of words practised per day (YYYY-MM-DD) – added in v1.1, optional */
  daily?: Record<string, number[]>;
  /** v1.2 (optional): selected level on the dashboard */
  level?: 1 | 2;
  /** v1.2 (optional): Wivi's Level 2 intro was shown */
  seenLevel2Intro?: boolean;
  /** v1.2 (optional): Wivi's Daily 5 – persisted per day */
  dailyPick?: { date: string; ids: number[] };
};

/** Words to practise per day for the daily goal ring */
export const DAILY_GOAL = 5;

const KEY = "wordly-kids-progress-v1";
/** one-time safety copy of the progress as it was before the Level 2 update */
export const BACKUP_KEY = "wordly-kids-progress-v1-backup-before-level2";
const EMPTY: Progress = { version: 1, words: {}, stars: 0, quizzes: {}, days: [] };

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function read(): Progress {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw && window.localStorage.getItem(BACKUP_KEY) === null) {
      // non-destructive: keep an untouched copy before any v1.2 field is written
      window.localStorage.setItem(BACKUP_KEY, raw);
    }
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

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function update(fn: (p: Progress) => Progress, touchedId?: number) {
  const cur = read();
  const next = fn(cur);
  const t = today();
  if (!next.days.includes(t)) next.days = [...next.days, t].slice(-60);
  if (touchedId !== undefined) {
    const daily = { ...(next.daily ?? {}) };
    const ids = daily[t] ?? [];
    if (!ids.includes(touchedId)) daily[t] = [...ids, touchedId];
    // keep the last 30 days only
    const keys = Object.keys(daily).sort();
    for (const k of keys.slice(0, Math.max(0, keys.length - 30))) delete daily[k];
    next.daily = daily;
  }
  write(next);
}

/** Number of distinct words practised today (from stored data). */
export function todayCount(p: Progress): number {
  return p.daily?.[today()]?.length ?? 0;
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
    }, id);
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
    }, id);
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
        words: { ...p.words, [id]: { ...w, correct, wrong: w.wrong + (ok ? 0 : 1), status, review: !ok } },
      };
    }, id);
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
  /** Flashcard result for one translation direction (additive, keeps existing logic). */
  flashcard(id: number, dir: Direction, ok: boolean) {
    update((p) => {
      const w = wp(p, id);
      const d = w.dirs?.[dir] ?? { known: 0, again: 0 };
      return {
        ...p,
        words: {
          ...p.words,
          [id]: { ...w, review: !ok, dirs: { ...(w.dirs ?? {}), [dir]: { known: d.known + (ok ? 1 : 0), again: d.again + (ok ? 0 : 1) } } },
        },
      };
    }, id);
  },
  setLevel(level: 1 | 2) {
    const cur = read();
    if (cur.level !== level) write({ ...cur, level });
  },
  dismissLevel2Intro(goToLevel2: boolean) {
    const cur = read();
    write({ ...cur, seenLevel2Intro: true, level: goToLevel2 ? 2 : (cur.level ?? 1) });
  },
  setDailyPick(ids: number[]) {
    const cur = read();
    write({ ...cur, dailyPick: { date: today(), ids } });
  },
  /** Replace all progress with an imported backup (current data is saved first). */
  restore(data: Progress) {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) window.localStorage.setItem(`${KEY}-backup-before-restore`, raw);
    } catch {}
    write({ ...EMPTY, ...data, version: 1 });
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

/** Longest run of consecutive active days ever recorded. */
export function longestStreak(p: Progress): number {
  const ds = [...new Set(p.days)].sort();
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of ds) {
    const [y, m, dd] = d.split("-").map(Number);
    const t = Date.UTC(y, m - 1, dd) / 86400000;
    run = prev !== null && t - prev === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  return best;
}

/** Practised-word counts for the last `n` days (oldest first). */
export function lastDays(p: Progress, n = 7): { key: string; date: Date; count: number }[] {
  const out: { key: string; date: Date; count: number }[] = [];
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  for (let i = 0; i < n; i++) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push({ key, date: new Date(d), count: p.daily?.[key]?.length ?? 0 });
    d.setDate(d.getDate() + 1);
  }
  return out;
}


/** A word needs review when it was marked "გასამეორებელია"/answered wrong, or is seen but not learned yet. */
export function needsReview(p: Progress, id: number): boolean {
  const w = p.words[id];
  if (!w) return false;
  return w.review === true || w.status === "learning";
}

/** Backup files: written as "wivilo"; files from the old "wordly-kids" name are still accepted. */
const BACKUP_APPS = ["wivilo", "wordly-kids"];
export const BACKUP_FORMAT = 1;
const STATUSES = ["new", "learning", "learned"];
const isNum = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0;

/** Validates an imported backup file. Returns the progress or an error message (Georgian). */
export function parseBackup(text: string): Progress | string {
  let d: unknown;
  try {
    d = JSON.parse(text);
  } catch {
    return "ფაილის წაკითხვა ვერ მოხერხდა (არასწორი JSON)";
  }
  const wrap = d as { app?: string; format?: number; progress?: unknown };
  if (wrap && typeof wrap === "object" && "app" in wrap) {
    if (!BACKUP_APPS.includes(String(wrap.app))) return "ფაილი არ არის Wivilo-ს სარეზერვო ასლი";
    if (wrap.format !== undefined && wrap.format > BACKUP_FORMAT) return "ეს ასლი უფრო ახალი ვერსიიდანაა — ჯერ საიტი განაახლე";
  }
  const data = (wrap && typeof wrap === "object" && "progress" in wrap ? wrap.progress : d) as Progress;
  if (!data || typeof data !== "object") return "ფაილი არ არის Wivilo-ს სარეზერვო ასლი";
  if (data.version !== 1) return "სარეზერვო ასლის ვერსია უცნობია";
  if (!data.words || typeof data.words !== "object" || Array.isArray(data.words)) return "ფაილში სიტყვების პროგრესი არ არის";
  for (const [id, w] of Object.entries(data.words)) {
    const n = Number(id);
    if (!Number.isInteger(n) || n < 1 || n > 10000) return `არასწორი სიტყვის ID: ${id}`;
    if (!w || !STATUSES.includes(w.status) || !isNum(w.seen) || !isNum(w.correct) || !isNum(w.wrong)) return `სიტყვა ${id}: მონაცემები დაზიანებულია`;
  }
  if (!isNum(data.stars)) return "ვარსკვლავების რაოდენობა დაზიანებულია";
  if (!Array.isArray(data.days) || data.days.some((x) => typeof x !== "string")) return "აქტიური დღეების სია დაზიანებულია";
  if (data.quizzes && (typeof data.quizzes !== "object" || Object.values(data.quizzes).some((q) => !q || !isNum(q.best) || !isNum(q.total) || !isNum(q.plays))))
    return "ქვიზების ისტორია დაზიანებულია";
  return { ...data, quizzes: data.quizzes ?? {} };
}

export function backupJSON(p: Progress): string {
  return JSON.stringify({ app: "wivilo", format: BACKUP_FORMAT, exportedAt: new Date().toISOString(), progress: p }, null, 2);
}
