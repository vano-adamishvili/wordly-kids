import raw from "@/data/words.json";
import { CATEGORIES, categoryByName, type Category } from "@/data/categories";

export type Word = {
  id: number;
  category: string;
  en: string;
  ka: string;
  sentenceEn: string;
  sentenceKa: string;
  audioEn: string;
  audioParent: string;
  image: string;
};

export const WORDS = raw as Word[];

export function wordsForCategory(slug: string): Word[] {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return [];
  return WORDS.filter((w) => w.category === cat.name);
}

export function categoryOf(word: Word): Category {
  return categoryByName(word.category) ?? CATEGORIES[0];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Split an English sentence so the target word can be highlighted. */
export function highlightParts(sentence: string, word: string): { text: string; hit: boolean }[] {
  const base = word.toLowerCase().replace(/[^a-z-]/g, "");
  const stem = base.length > 3 ? base.replace(/(s|e)$/, "") : base;
  const tokens = sentence.split(/(\s+)/);
  let done = false;
  return tokens.map((t) => {
    const clean = t.toLowerCase().replace(/[^a-z-]/g, "");
    if (!done && clean && (clean === base || clean.startsWith(stem))) {
      done = true;
      const m = t.match(/^([A-Za-z-]+)(.*)$/);
      if (m) return { text: m[1], hit: true, rest: m[2] } as { text: string; hit: boolean; rest?: string };
      return { text: t, hit: true };
    }
    return { text: t, hit: false };
  }).flatMap((p) => {
    const r = (p as { rest?: string }).rest;
    return r ? [{ text: p.text, hit: true }, { text: r, hit: false }] : [{ text: p.text, hit: p.hit }];
  });
}
