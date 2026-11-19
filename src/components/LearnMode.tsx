"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Layers, Puzzle, RotateCcw } from "lucide-react";
import { categoryBySlug, categoryVars } from "@/data/categories";
import { progressActions, statusOf, useProgress } from "@/lib/progress";
import { playEnglish } from "@/lib/audio";
import { wordsForCategory } from "@/lib/words";
import VocabCard from "./VocabCard";
import Wobble from "./Wobble";
import { Bubble, Confetti, ProgressBar, TopBar } from "./ui";

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
      <main style={categoryVars(cat)}>
        <Confetti />
        <TopBar back={`/category/${slug}`} title={cat.ka} sub="სწავლა" />
        <div className="animate-pop card mx-4 mt-4 flex flex-col items-center p-6 text-center">
          <Wobble mood="excited" size={150} />
          <p className="font-ka mt-2 text-2xl font-extrabold">ყოჩაღ! ყველა სიტყვა ნახე!</p>
          <p className="font-ka mt-1 text-ink-soft">
            ნასწავლი: <b className="text-ink">{learnedCount}/{words.length}</b>. ახლა ბარათებით ან ქვიზით შეამოწმე თავი.
          </p>
          <div className="mt-6 grid w-full gap-3">
            <Link href={`/category/${slug}/flashcards`} className="press focus-ring font-ka flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-lavender text-lg font-extrabold text-white [--edge:#6a4fd0]">
              <Layers size={22} /> ბარათები
            </Link>
            <Link href={`/category/${slug}/quiz`} className="press focus-ring font-ka flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-sun text-lg font-extrabold text-ink [--edge:#e8bf2c]">
              <Puzzle size={22} /> ქვიზი
            </Link>
            <button
              onClick={() => {
                setI(0);
                setFinished(false);
              }}
              className="press focus-ring font-ka flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-lavender-soft font-extrabold text-lavender-deep [--edge:#d9cffa]"
            >
              <RotateCcw size={20} /> თავიდან
            </button>
          </div>
        </div>
      </main>
    );
  }

  const isLearned = statusOf(p, word.id) === "learned";

  return (
    <main style={categoryVars(cat)} className="lg:mx-auto lg:w-full lg:max-w-xl">
      <TopBar back={`/category/${slug}`} title={cat.ka} sub="სწავლა" />
      <div className="px-4">
        <ProgressBar value={i + 1} max={words.length} color="var(--accent)" className="mb-4" />
        <VocabCard key={word.id} word={word} category={cat} index={i} total={words.length} />

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => go(-1)}
            disabled={i === 0}
            aria-label="წინა სიტყვა"
            className="press focus-ring flex h-15 w-15 shrink-0 items-center justify-center rounded-2xl bg-white text-ink disabled:opacity-35"
          >
            <ArrowLeft size={26} strokeWidth={2.6} />
          </button>
          <button
            onClick={() => {
              if (!isLearned) progressActions.setStatus(word.id, "learned");
              go(1);
            }}
            className={`press focus-ring font-ka flex h-15 flex-1 items-center justify-center gap-2 rounded-2xl text-lg font-extrabold ${
              isLearned ? "bg-mint-soft text-mint-deep [--edge:#bfeedd]" : "bg-mint text-ink [--edge:#3fb98c]"
            }`}
          >
            <Check size={24} strokeWidth={3} />
            {isLearned ? "შემდეგი" : "ვისწავლე!"}
          </button>
          <button
            onClick={() => go(1)}
            aria-label="შემდეგი სიტყვა"
            className="press focus-ring flex h-15 w-15 shrink-0 items-center justify-center rounded-2xl bg-white text-ink"
          >
            <ArrowRight size={26} strokeWidth={2.6} />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <Wobble mood="encouraging" size={64} className="shrink-0" />
          <Bubble className="flex-1 !py-2.5">
            <p className="font-ka text-sm font-semibold text-ink-soft">მოუსმინე, ხმამაღლა გაიმეორე და დააჭირე „ვისწავლე“.</p>
          </Bubble>
        </div>
      </div>
    </main>
  );
}
