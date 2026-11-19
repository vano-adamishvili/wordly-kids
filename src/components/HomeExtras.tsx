"use client";

import Link from "next/link";
import { Check, ChevronRight, Repeat, Shuffle, Sparkles } from "lucide-react";
import { categoryVars } from "@/data/categories";
import { useDailyFive } from "@/lib/daily";
import { progressActions } from "@/lib/progress";
import { categoryOf } from "@/lib/words";
import Wivi from "./Wivi";
import WordArt from "./WordArt";
import { Art, Bubble } from "./ui";

/** Wivi introduces Level 2 once. */
export function Level2Intro() {
  return (
    <section className="animate-rise relative mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#FFF5D1] to-[#E2F7EF] p-5">
      <div className="pointer-events-none absolute -right-4 -top-2 flex gap-1 opacity-90" aria-hidden>
        <Art name="ringed-planet" className="h-10 w-10 rotate-12" />
        <Art name="sparkles" className="h-7 w-7" />
      </div>
      <div className="flex items-end gap-2">
        <Wivi mood="excited" size={96} className="-mb-1 shrink-0" />
        <Bubble className="mb-5 flex-1">
          <p className="font-ka text-[0.95rem] font-extrabold leading-snug">ახალი სამყაროები გაიხსნა!</p>
          <p className="font-ka mt-0.5 text-sm text-ink-soft">დონე 2: 120 ახალი სიტყვა, 12 ახალი თემა — ცხოველები, კოსმოსი, სპორტი და სხვა.</p>
        </Bubble>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <button
          onClick={() => progressActions.dismissLevel2Intro(true)}
          className="press focus-ring font-ka flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-lavender px-4 text-base font-extrabold text-white [--edge:#6a4fd0]"
        >
          ვნახოთ დონე 2 <ChevronRight size={20} strokeWidth={3} />
        </button>
        <button
          onClick={() => progressActions.dismissLevel2Intro(false)}
          className="press focus-ring font-ka min-h-14 rounded-2xl bg-white px-4 text-sm font-extrabold text-ink-soft"
        >
          მოგვიანებით
        </button>
      </div>
    </section>
  );
}

/** Wivi's Daily 5 – today's five words. */
export function DailyFiveCard() {
  const { words, doneIds, ready } = useDailyFive();
  const done = doneIds.length;
  const complete = ready && words.length > 0 && done >= words.length;
  return (
    <section className="mt-5">
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 p-4 pb-3">
          <Wivi mood={complete ? "excited" : "encouraging"} size={50} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-ka text-base font-extrabold leading-tight">დღის 5 სიტყვა</p>
            <p className="font-ka text-xs font-semibold text-ink-soft" suppressHydrationWarning>
              {!ready ? "ვარჩევ დღევანდელ სიტყვებს…" : complete ? "დღევანდელი 5 სიტყვა გავიარეთ!" : `გავლილია ${done}/${words.length}`}
            </p>
          </div>
          <Link
            href="/daily"
            className="press focus-ring font-ka flex min-h-12 shrink-0 items-center gap-0.5 rounded-2xl bg-sun px-3 text-sm font-extrabold text-ink [--edge:#e8bf2c]"
          >
            {complete ? "გავიმეოროთ" : "დავიწყოთ"} <ChevronRight size={18} strokeWidth={3} />
          </Link>
        </div>
        <ul className="flex gap-2 overflow-x-auto px-4 pb-4" aria-label="დღის სიტყვები">
          {(ready ? words : []).map((w) => {
            const isDone = doneIds.includes(w.id);
            return (
              <li
                key={w.id}
                style={categoryVars(categoryOf(w))}
                className={`relative flex min-w-[4.5rem] flex-1 flex-col items-center rounded-2xl px-2 py-2 ${isDone ? "bg-mint-soft" : "bg-[var(--soft)]"}`}
              >
                <WordArt word={w} size="sm" />
                <span className="font-display mt-1 max-w-full truncate text-sm font-semibold">{w.en}</span>
                {isDone ? (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-mint text-white">
                    <Check size={13} strokeWidth={3.5} />
                  </span>
                ) : null}
              </li>
            );
          })}
          {!ready
            ? Array.from({ length: 5 }, (_, i) => <li key={i} className="h-[5.6rem] min-w-[4.5rem] flex-1 animate-pulse rounded-2xl bg-ink/5" />)
            : null}
        </ul>
      </div>
    </section>
  );
}

/** Extra practice modes. */
export function PracticeTools() {
  return (
    <section className="mt-5 grid grid-cols-2 gap-3">
      <Link
        href="/review"
        className="press focus-ring flex min-h-24 items-center gap-2.5 rounded-[1.5rem] bg-mint-soft p-3 [--edge:#bfeedd]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-mint-deep">
          <Repeat size={24} strokeWidth={2.6} />
        </span>
        <span className="min-w-0">
          <span className="font-ka block text-[0.8rem] font-extrabold leading-tight">შერეული გამეორება</span>
          <span className="font-ka block text-[0.7rem] text-ink-soft">ორივე დონიდან</span>
        </span>
      </Link>
      <Link
        href="/opposites"
        className="press focus-ring flex min-h-24 items-center gap-2.5 rounded-[1.5rem] bg-lavender-soft p-3 [--edge:#d9cffa]"
      >
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white">
          <Art name="whale" className="absolute left-1 top-1 h-6 w-6" />
          <Art name="mouse-face" className="absolute bottom-1.5 right-1.5 h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="font-ka block break-words text-[0.8rem] font-extrabold leading-tight">საპირისპი&shy;როები</span>
          <span className="font-ka block text-[0.7rem] text-ink-soft">დააწყვილე თამაში</span>
        </span>
      </Link>
      <Link
        href="/quiz"
        className="press focus-ring col-span-2 flex min-h-14 items-center justify-center gap-2 rounded-[1.25rem] bg-coral-soft text-coral-deep [--edge:#ffd3cf]"
      >
        <Shuffle size={20} strokeWidth={2.6} />
        <span className="font-ka text-sm font-extrabold">შერეული ქვიზი</span>
        <Sparkles size={16} />
      </Link>
    </section>
  );
}

/** Shown only when this browser has no progress yet (e.g. after moving to wivilo.ge). */
export function ImportHint() {
  return (
    <section className="mt-5 rounded-[1.5rem] border-2 border-dashed border-lavender/40 bg-white p-4">
      <p className="font-ka text-sm font-extrabold">მშობლისთვის: პროგრესი სხვა მისამართზე გაქვს?</p>
      <p className="font-ka mt-1 text-xs text-ink-soft">
        თუ ბავშვი ადრე სხვა მისამართზე (მაგ. wordly-kids-indol.vercel.app) სწავლობდა, იქ ჩამოტვირთე პროგრესის ფაილი და აქ აღადგინე.
      </p>
      <Link
        href="/progress#backup"
        className="press focus-ring font-ka mt-3 inline-flex min-h-11 items-center gap-1 rounded-xl bg-lavender-soft px-4 text-sm font-extrabold text-lavender-deep [--edge:#d9cffa]"
      >
        პროგრესის აღდგენა <ChevronRight size={18} strokeWidth={3} />
      </Link>
    </section>
  );
}
