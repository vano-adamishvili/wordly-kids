"use client";

import Link from "next/link";
import { CATEGORIES, categoryBySlug } from "@/data/categories";
import { streak, useProgress, statusOf } from "@/lib/progress";
import { WORDS, wordsForCategory } from "@/lib/words";
import CategoryGrid from "./CategoryGrid";
import WordArt from "./WordArt";
import { ProgressBar } from "./ui";

export default function HomeDashboard() {
  const [p, hydrated] = useProgress();
  const learned = WORDS.filter((w) => statusOf(p, w.id) === "learned").length;
  const days = streak(p);

  // Next category to continue: last opened (if unfinished) or first unfinished
  const unfinished = (slug: string) => wordsForCategory(slug).some((w) => statusOf(p, w.id) !== "learned");
  const next =
    (p.lastCategory && unfinished(p.lastCategory) ? categoryBySlug(p.lastCategory) : undefined) ??
    CATEGORIES.find((c) => unfinished(c.slug)) ??
    CATEGORIES[0];
  const nextWords = wordsForCategory(next.slug);
  const nextLearned = nextWords.filter((w) => statusOf(p, w.id) === "learned").length;
  const nextWord = nextWords.find((w) => statusOf(p, w.id) !== "learned") ?? nextWords[0];

  return (
    <main className="px-4 pt-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="animate-floaty text-4xl">🦉</span>
          <div>
            <p className="text-2xl font-black leading-none text-brand">
              Wordly <span className="text-amber-400">Kids</span>
            </p>
            <p className="font-ka text-xs font-semibold text-slate-500">ინგლისური სიტყვები სახალისოდ</p>
          </div>
        </div>
        <div className="btn-3d flex items-center gap-1 rounded-2xl bg-white px-3 py-2 text-lg font-black ring-1 ring-amber-200">
          ⭐ <span suppressHydrationWarning>{hydrated ? p.stars : 0}</span>
        </div>
      </div>

      {/* Greeting */}
      <section className="mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand to-fuchsia-500 p-5 text-white shadow-lg shadow-violet-200">
        <p className="font-ka text-2xl font-extrabold">გამარჯობა! 👋</p>
        <p className="font-ka mt-1 text-sm opacity-90">დღეს ახალ ინგლისურ სიტყვებს ვისწავლით. მზად ხარ?</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat icon="📗" value={`${learned}/${WORDS.length}`} label="ნასწავლი" />
          <Stat icon="🔥" value={String(days)} label="დღე ზედიზედ" />
          <Stat icon="🧩" value={String(Object.values(p.quizzes).reduce((a, q) => a + q.plays, 0))} label="ქვიზი" />
        </div>
        <ProgressBar value={learned} max={WORDS.length} color="bg-sun" className="mt-4 bg-white/30" />
      </section>

      {/* Continue */}
      <section className="mt-5">
        <h2 className="font-ka mb-2 text-lg font-extrabold">გააგრძელე სწავლა</h2>
        <div className={`rounded-[2rem] bg-gradient-to-br ${next.bg} p-4 ring-2 ${next.ring}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/80">
              {nextWord ? <WordArt word={nextWord} size="sm" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-ka truncate text-lg font-extrabold">
                {next.emoji} {next.ka}
              </p>
              <p className="text-sm font-bold text-slate-600">
                {nextLearned}/{nextWords.length} · {nextWord?.en}
              </p>
              <ProgressBar value={nextLearned} max={nextWords.length} color={next.bar} className="mt-2" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <ModeButton href={`/category/${next.slug}/learn`} icon="📖" label="სწავლა" className="bg-brand text-white" />
            <ModeButton href={`/category/${next.slug}/flashcards`} icon="🃏" label="ბარათები" className="bg-white text-ink" />
            <ModeButton href={`/category/${next.slug}/quiz`} icon="🧩" label="ქვიზი" className="bg-white text-ink" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-6">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-ka text-lg font-extrabold">12 თემა · 120 სიტყვა</h2>
          <Link href="/quiz" className="font-ka text-sm font-bold text-brand">
            შერეული ქვიზი →
          </Link>
        </div>
        <CategoryGrid />
      </section>
    </main>
  );
}

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-2 py-2 backdrop-blur">
      <div className="text-xl">{icon}</div>
      <div className="text-lg font-black" suppressHydrationWarning>
        {value}
      </div>
      <div className="font-ka text-[0.7rem] font-semibold opacity-90">{label}</div>
    </div>
  );
}

function ModeButton({ href, icon, label, className }: { href: string; icon: string; label: string; className: string }) {
  return (
    <Link href={href} className={`btn-3d flex flex-col items-center rounded-2xl py-2.5 font-bold ${className}`}>
      <span className="text-2xl">{icon}</span>
      <span className="font-ka text-sm">{label}</span>
    </Link>
  );
}
