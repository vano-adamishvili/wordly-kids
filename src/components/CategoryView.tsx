"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BookOpen, Layers, Puzzle } from "lucide-react";
import { categoryBySlug, categoryVars } from "@/data/categories";
import { progressActions, statusOf, useProgress } from "@/lib/progress";
import { wordsForCategory } from "@/lib/words";
import { CategoryArt } from "./CategoryGrid";
import { ModeTile } from "./HomeDashboard";
import WordArt from "./WordArt";
import { ProgressBar, SpeakButton, StatusDot, TopBar } from "./ui";

export default function CategoryView({ slug }: { slug: string }) {
  const cat = categoryBySlug(slug)!;
  const words = wordsForCategory(slug);
  const [p] = useProgress();
  const learned = words.filter((w) => statusOf(p, w.id) === "learned").length;
  const quiz = p.quizzes[slug];

  useEffect(() => {
    // remember where the child was, for "continue" on the dashboard
    progressActions.visitCategory(slug);
  }, [slug]);

  return (
    <main style={categoryVars(cat)}>
      <TopBar back="/categories" title={cat.ka} sub={cat.name} />
      <div className="px-4">
        <section className="card overflow-hidden">
          <div className="relative flex items-center gap-4 bg-[var(--soft)] px-5 py-6">
            <CategoryArt c={cat} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-ka text-xl font-extrabold leading-tight">{cat.ka}</p>
              <p className="font-display text-sm text-[var(--deep)]">{cat.name} · 10 სიტყვა</p>
              <div className="mt-3 flex items-center gap-2">
                <ProgressBar value={learned} max={words.length} color="var(--accent)" track="rgb(255 255 255 / 0.9)" />
                <span className="shrink-0 text-sm font-extrabold text-[var(--deep)]">
                  {learned}/{words.length}
                </span>
              </div>
              {quiz ? (
                <p className="font-ka mt-1.5 text-xs font-bold text-[var(--deep)]">
                  საუკეთესო ქვიზი: {quiz.best}/{quiz.total}
                </p>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3">
            <ModeTile href={`/category/${slug}/learn`} Icon={BookOpen} label="სწავლა" tone="lavender" />
            <ModeTile href={`/category/${slug}/flashcards`} Icon={Layers} label="ბარათები" tone="mint" />
            <ModeTile href={`/category/${slug}/quiz`} Icon={Puzzle} label="ქვიზი" tone="coral" />
          </div>
        </section>

        <h2 className="font-ka mb-3 mt-7 text-lg font-extrabold">სიტყვები</h2>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {words.map((w, i) => (
            <li key={w.id} className="card flex items-center gap-3 p-2.5 pr-3">
              <Link href={`/category/${slug}/learn?i=${i}`} className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-2xl">
                <div className="flex h-15 w-15 shrink-0 items-center justify-center rounded-2xl bg-[var(--soft)]">
                  <WordArt word={w} size="sm" />
                </div>
                <div className="min-w-0">
                  <p className="font-display truncate text-xl font-semibold leading-tight">{w.en}</p>
                  <p className="font-ka truncate text-sm text-ink-soft">{w.ka}</p>
                </div>
              </Link>
              <StatusDot status={statusOf(p, w.id)} />
              <SpeakButton src={w.audioEn} text={w.en} size="sm" variant="soft" />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
