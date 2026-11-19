"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Layers } from "lucide-react";
import { needsReview, useProgress, type Progress } from "@/lib/progress";
import { WORDS, type Word } from "@/lib/words";
import FlashcardMode from "./FlashcardMode";
import Wivi from "./Wivi";
import { Art, Bubble, TopBar } from "./ui";

export type ReviewScope = "all" | "1" | "2";
const SCOPES: { scope: ReviewScope; ka: string; sub: string; art: string }[] = [
  { scope: "all", ka: "ორივე დონე", sub: "ყველა სიტყვიდან", art: "sparkles" },
  { scope: "1", ka: "დონე 1", sub: "პირველი 120", art: "seedling" },
  { scope: "2", ka: "დონე 2", sub: "ახალი 120", art: "rocket" },
];
const SESSION = 12;

const inScope = (w: Word, scope: ReviewScope) => scope === "all" || String(w.level) === scope;
/** studied = the child has met the word at least once */
const studied = (p: Progress, w: Word) => !!p.words[w.id] && (p.words[w.id].seen > 0 || p.words[w.id].status !== "new");

/** Review list: words needing review first, then studied words practised least. */
export function buildReview(p: Progress, scope: ReviewScope): Word[] {
  const pool = WORDS.filter((w) => inScope(w, scope) && studied(p, w));
  const score = (w: Word) => {
    const r = p.words[w.id];
    return (r?.review ? 1000 : 0) + (needsReview(p, w.id) ? 500 : 0) + (r?.wrong ?? 0) * 10 - (r?.correct ?? 0);
  };
  return pool.sort((a, b) => score(b) - score(a) || a.id - b.id).slice(0, SESSION);
}

export function ReviewSetup() {
  const [p, hydrated] = useProgress();
  return (
    <main>
      <TopBar back="/" title="შერეული გამეორება" sub="ჯერ გასამეორებელი სიტყვები" />
      <div className="px-4 lg:mx-auto lg:max-w-xl">
        <div className="flex items-end gap-2">
          <Wivi mood="thinking" size={92} className="-mb-1 shrink-0" />
          <Bubble className="mb-5 flex-1">
            <p className="font-ka text-[0.95rem] font-bold leading-snug">საიდან გავიმეოროთ? ბარათებზე მიმართულებასაც აირჩევ: EN → ქა ან ქა → EN.</p>
          </Bubble>
        </div>
        <ul className="mt-4 space-y-3">
          {SCOPES.map(({ scope, ka, sub, art }) => {
            const all = WORDS.filter((w) => inScope(w, scope));
            const toReview = hydrated ? all.filter((w) => needsReview(p, w.id)).length : 0;
            const met = hydrated ? all.filter((w) => studied(p, w)).length : 0;
            const empty = hydrated && met === 0;
            return (
              <li key={scope}>
                <Link
                  href={`/review/${scope}`}
                  aria-disabled={empty}
                  className={`press focus-ring flex min-h-20 items-center gap-3 rounded-[1.5rem] bg-white p-3 ${empty ? "pointer-events-none opacity-50" : ""}`}
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lavender-soft">
                    <Art name={art} className="h-9 w-9" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-ka block text-base font-extrabold">{ka}</span>
                    <span className="font-ka block text-xs text-ink-soft" suppressHydrationWarning>
                      {empty ? "ჯერ სიტყვები არ გინახავს" : `${sub} · ${toReview} გასამეორებელი · ${met} ნანახი`}
                    </span>
                  </span>
                  <ChevronRight size={22} className="text-ink-soft" />
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="font-ka mt-4 flex items-center gap-1.5 text-xs text-ink-soft">
          <Layers size={14} /> ერთ ჯერზე {SESSION}-მდე სიტყვა
        </p>
      </div>
    </main>
  );
}

export function ReviewSession({ scope }: { scope: ReviewScope }) {
  const [p, hydrated] = useProgress();
  // build the list once, so answering doesn't reshuffle the session
  const [words, setWords] = useState<Word[] | null>(null);
  useEffect(() => {
    if (hydrated && words === null) {
      const id = requestAnimationFrame(() => setWords(buildReview(p, scope)));
      return () => cancelAnimationFrame(id);
    }
  }, [hydrated, words, p, scope]);
  const label = SCOPES.find((s) => s.scope === scope)?.ka ?? "";
  if (!words) return <TopBar back="/review" title="შერეული გამეორება" />;
  return <FlashcardMode words={words} title={`გამეორება · ${label}`} back="/review" keepOrder sub="გამეორება" />;
}
