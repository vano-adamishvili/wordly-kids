"use client";

import Link from "next/link";
import { useEffect } from "react";
import { categoryBySlug } from "@/data/categories";
import { progressActions, statusOf, useProgress } from "@/lib/progress";
import { wordsForCategory } from "@/lib/words";
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
    <main>
      <TopBar back="/categories" title={`${cat.emoji} ${cat.ka}`} />
      <div className="px-4">
        <section className={`rounded-[2rem] bg-gradient-to-br ${cat.bg} p-5 ring-2 ${cat.ring}`}>
          <div className="flex items-center gap-4">
            <span className="text-6xl">{cat.emoji}</span>
            <div className="flex-1">
              <p className="font-ka text-xl font-extrabold">{cat.ka}</p>
              <p className="text-sm font-bold text-slate-600">{cat.name}</p>
              <ProgressBar value={learned} max={words.length} color={cat.bar} className="mt-2" />
              <p className="font-ka mt-1 text-xs font-bold text-slate-600">
                ნასწავლი: {learned}/{words.length}
                {quiz ? ` · საუკეთესო ქვიზი: ${quiz.best}/${quiz.total}` : ""}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Mode href={`/category/${slug}/learn`} icon="📖" title="სწავლა" sub="Learn" primary />
            <Mode href={`/category/${slug}/flashcards`} icon="🃏" title="ბარათები" sub="Flashcards" />
            <Mode href={`/category/${slug}/quiz`} icon="🧩" title="ქვიზი" sub="Quiz" />
          </div>
        </section>

        <h2 className="font-ka mb-2 mt-6 text-lg font-extrabold">სიტყვები</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {words.map((w, i) => (
            <li key={w.id} className="flex items-center gap-3 rounded-2xl bg-white p-2 pr-3 ring-1 ring-violet-100">
              <Link
                href={`/category/${slug}/learn?i=${i}`}
                onClick={() => progressActions.markSeen(w.id, slug)}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                  <WordArt word={w} size="sm" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-extrabold leading-tight">{w.en}</p>
                  <p className="font-ka truncate text-sm text-slate-500">{w.ka}</p>
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

function Mode({ href, icon, title, sub, primary }: { href: string; icon: string; title: string; sub: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`btn-3d flex flex-col items-center rounded-2xl py-3 ${primary ? "bg-brand text-white" : "bg-white text-ink"}`}
    >
      <span className="text-3xl">{icon}</span>
      <span className="font-ka text-sm font-extrabold">{title}</span>
      <span className="text-[0.7rem] font-bold opacity-70">{sub}</span>
    </Link>
  );
}
