"use client";

import Link from "next/link";
import { BookOpen, Check, Layers } from "lucide-react";
import { categoryVars } from "@/data/categories";
import { useDailyFive } from "@/lib/daily";
import { needsReview, statusOf, useProgress } from "@/lib/progress";
import { categoryOf } from "@/lib/words";
import FlashcardMode from "./FlashcardMode";
import LearnMode from "./LearnMode";
import Wobble from "./Wobble";
import WordArt from "./WordArt";
import { Bubble, SpeakButton, TopBar } from "./ui";

export function DailyOverview() {
  const [p] = useProgress();
  const { words, doneIds, ready } = useDailyFive();
  const complete = ready && words.length > 0 && doneIds.length >= words.length;
  return (
    <main>
      <TopBar back="/" title="ვობლის დღის 5 სიტყვა" sub="ყოველდღე ახალი ხუთეული" />
      <div className="px-4 lg:mx-auto lg:max-w-xl">
        <div className="flex items-end gap-2">
          <Wobble mood={complete ? "excited" : "happy"} size={96} className="-mb-1 shrink-0" />
          <Bubble className="mb-5 flex-1">
            <p className="font-ka text-[0.95rem] font-bold leading-snug">
              {complete
                ? "ყოჩაღ! დღევანდელი ხუთივე სიტყვა გავიარეთ. ხვალ ახლებს შეგირჩევ!"
                : "ჯერ გასამეორებელ სიტყვებს ვირჩევ, მერე — ახლებს. დღეს ეს ხუთია:"}
            </p>
          </Bubble>
        </div>

        <ul className="mt-4 space-y-2.5">
          {(ready ? words : []).map((w) => {
            const c = categoryOf(w);
            const isDone = doneIds.includes(w.id);
            const tag = needsReview(p, w.id) ? "გასამეორებელი" : statusOf(p, w.id) === "new" ? "ახალი" : "ნასწავლი";
            return (
              <li key={w.id} style={categoryVars(c)} className="card flex items-center gap-3 p-2.5 pr-3">
                <div className="flex h-15 w-15 shrink-0 items-center justify-center rounded-2xl bg-[var(--soft)]">
                  <WordArt word={w} size="sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display truncate text-xl font-semibold leading-tight">{w.en}</p>
                  <p className="font-ka truncate text-xs font-bold text-[var(--deep)]">
                    {tag} · {c.ka} · დონე {w.level}
                  </p>
                </div>
                {isDone ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint text-white" aria-label="გავლილია">
                    <Check size={16} strokeWidth={3.5} />
                  </span>
                ) : null}
                <SpeakButton src={w.audioEn} text={w.en} size="sm" variant="soft" />
              </li>
            );
          })}
        </ul>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link href="/daily/learn" className="press focus-ring font-ka flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-lavender text-lg font-extrabold text-white [--edge:#6a4fd0]">
            <BookOpen size={22} /> სწავლა
          </Link>
          <Link href="/daily/cards" className="press focus-ring font-ka flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-mint text-lg font-extrabold text-ink [--edge:#3fb98c]">
            <Layers size={22} /> ბარათები
          </Link>
        </div>
      </div>
    </main>
  );
}

export function DailyLearn() {
  const { words, ready } = useDailyFive();
  if (!ready) return <TopBar back="/daily" title="დღის 5 სიტყვა" />;
  return <LearnMode words={words} title="დღის 5 სიტყვა" back="/daily" flashcardsHref="/daily/cards" />;
}

export function DailyCards() {
  const { words, ready } = useDailyFive();
  if (!ready) return <TopBar back="/daily" title="დღის 5 სიტყვა" />;
  return <FlashcardMode words={words} title="დღის 5 სიტყვა" back="/daily" keepOrder />;
}
