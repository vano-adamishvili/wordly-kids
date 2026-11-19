"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categoryBySlug } from "@/data/categories";
import { progressActions, statusOf, useProgress } from "@/lib/progress";
import { playEnglish } from "@/lib/audio";
import { wordsForCategory } from "@/lib/words";
import VocabCard from "./VocabCard";
import { Confetti, ProgressBar, TopBar } from "./ui";

export default function LearnMode({ slug }: { slug: string }) {
  const cat = categoryBySlug(slug)!;
  const words = wordsForCategory(slug);
  const [p] = useProgress();
  const [i, setI] = useState(0);
  const [finished, setFinished] = useState(false);
  const word = words[i];

  // Allow deep link ?i=3 from the word list
  useEffect(() => {
    const q = Number(new URLSearchParams(window.location.search).get("i"));
    progressActions.visitCategory(slug);
    if (Number.isInteger(q) && q > 0 && q < words.length) {
      const id = requestAnimationFrame(() => setI(q));
      return () => cancelAnimationFrame(id);
    }
  }, [slug, words.length]);

  useEffect(() => {
    if (word) progressActions.markSeen(word.id, slug);
  }, [word, slug]);

  function go(d: number) {
    const n = i + d;
    if (n >= words.length) setFinished(true);
    else if (n >= 0) setI(n);
  }

  // keyboard: ← → space
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === " " && word) {
        e.preventDefault();
        playEnglish(word.audioEn, word.en);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const learnedCount = words.filter((w) => statusOf(p, w.id) === "learned").length;

  if (finished) {
    return (
      <main>
        <Confetti />
        <TopBar back={`/category/${slug}`} title={`${cat.emoji} ${cat.ka}`} />
        <div className="animate-pop mx-4 mt-6 rounded-[2rem] bg-white p-6 text-center ring-2 ring-violet-100">
          <div className="text-7xl">🎉</div>
          <p className="font-ka mt-3 text-2xl font-extrabold">ყოჩაღ! ყველა სიტყვა ნახე!</p>
          <p className="font-ka mt-1 text-slate-500">
            ნასწავლი: {learnedCount}/{words.length}. ახლა ბარათებით ან ქვიზით შეამოწმე თავი.
          </p>
          <div className="mt-6 grid gap-3">
            <Link href={`/category/${slug}/flashcards`} className="btn-3d font-ka rounded-2xl bg-brand py-3 text-lg font-bold text-white">
              🃏 ბარათები
            </Link>
            <Link href={`/category/${slug}/quiz`} className="btn-3d font-ka rounded-2xl bg-sun py-3 text-lg font-bold text-ink">
              🧩 ქვიზი
            </Link>
            <button
              onClick={() => {
                setI(0);
                setFinished(false);
              }}
              className="btn-3d font-ka rounded-2xl bg-white py-3 font-bold text-brand ring-1 ring-violet-200"
            >
              🔁 თავიდან
            </button>
          </div>
        </div>
      </main>
    );
  }

  const isLearned = statusOf(p, word.id) === "learned";

  return (
    <main>
      <TopBar back={`/category/${slug}`} title={`📖 ${cat.ka}`} />
      <div className="px-4">
        <ProgressBar value={i + 1} max={words.length} className="mb-4" />
        <VocabCard key={word.id} word={word} category={cat} index={i} total={words.length} />

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => go(-1)}
            disabled={i === 0}
            aria-label="წინა"
            className="btn-3d h-14 w-14 shrink-0 rounded-2xl bg-white text-2xl text-brand ring-1 ring-violet-200 disabled:opacity-40"
          >
            ←
          </button>
          <button
            onClick={() => {
              if (!isLearned) progressActions.setStatus(word.id, "learned");
              go(1);
            }}
            className={`btn-3d font-ka h-14 flex-1 rounded-2xl text-lg font-extrabold ${
              isLearned ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500 text-white"
            }`}
          >
            {isLearned ? "⭐ ნასწავლია · შემდეგი" : "✓ ვისწავლე!"}
          </button>
          <button
            onClick={() => go(1)}
            aria-label="შემდეგი"
            className="btn-3d h-14 w-14 shrink-0 rounded-2xl bg-white text-2xl text-brand ring-1 ring-violet-200"
          >
            →
          </button>
        </div>
        <p className="font-ka mt-3 text-center text-xs text-slate-400">მოუსმინე, გაიმეორე ხმამაღლა და დააჭირე „ვისწავლე“ ⭐</p>
      </div>
    </main>
  );
}
