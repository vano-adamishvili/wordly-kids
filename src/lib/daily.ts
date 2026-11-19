"use client";

import { useEffect } from "react";
import { categoryBySlug } from "@/data/categories";
import { needsReview, progressActions, statusOf, today, useProgress, type Progress } from "./progress";
import { WORDS, type Word } from "./words";

export const DAILY_SIZE = 5;

/**
 * Wivi's Daily 5 – deterministic choice from the stored learning state:
 *   1. words that need review (marked "გასამეორებელია" / answered wrong first)
 *   2. new words – current level first, the category the child is working on first
 *   3. if everything is learned: the least-practised learned words
 */
export function pickDaily(p: Progress): number[] {
  const level = p.level ?? 1;
  const picked: number[] = [];
  const add = (ws: Word[]) => {
    for (const w of ws) {
      if (picked.length >= DAILY_SIZE) return;
      if (!picked.includes(w.id)) picked.push(w.id);
    }
  };

  const review = WORDS.filter((w) => needsReview(p, w.id)).sort((a, b) => {
    const A = p.words[a.id];
    const B = p.words[b.id];
    return Number(B?.review ?? false) - Number(A?.review ?? false) || (B?.wrong ?? 0) - (A?.wrong ?? 0) || a.id - b.id;
  });
  add(review.slice(0, DAILY_SIZE));

  const lastCat = p.lastCategory ? categoryBySlug(p.lastCategory) : undefined;
  const fresh = WORDS.filter((w) => statusOf(p, w.id) === "new").sort((a, b) => {
    const la = a.level === level ? 0 : 1;
    const lb = b.level === level ? 0 : 1;
    const ca = lastCat && a.category === lastCat.name ? 0 : 1;
    const cb = lastCat && b.category === lastCat.name ? 0 : 1;
    return la - lb || ca - cb || a.id - b.id;
  });
  add(fresh);

  const learned = WORDS.filter((w) => statusOf(p, w.id) === "learned").sort(
    (a, b) => (p.words[a.id]?.correct ?? 0) - (p.words[b.id]?.correct ?? 0) || a.id - b.id,
  );
  add(learned);
  return picked;
}

/** Returns today's Daily 5 (creating and saving it once per day). */
export function useDailyFive(): { words: Word[]; doneIds: number[]; ready: boolean } {
  const [p, hydrated] = useProgress();
  const pick = p.dailyPick;
  const isToday = hydrated && pick?.date === today();

  useEffect(() => {
    if (hydrated && !isToday) progressActions.setDailyPick(pickDaily(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isToday]);

  if (!isToday || !pick) return { words: [], doneIds: [], ready: false };
  const words = pick.ids.map((id) => WORDS.find((w) => w.id === id)).filter(Boolean) as Word[];
  const practised = p.daily?.[pick.date] ?? [];
  return { words, doneIds: words.filter((w) => practised.includes(w.id)).map((w) => w.id), ready: true };
}
