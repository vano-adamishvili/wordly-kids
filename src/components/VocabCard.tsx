"use client";

import type { Word } from "@/lib/words";
import { highlightParts } from "@/lib/words";
import { categoryVars, type Category } from "@/data/categories";
import WordArt from "./WordArt";
import { ParentAudioButton, SpeakButton } from "./ui";

/** Learn-mode card, inspired by the printed vocabulary cards (PDF reference). */
export default function VocabCard({ word, category, index, total }: { word: Word; category: Category; index: number; total: number }) {
  return (
    <article
      style={categoryVars(category)}
      className="animate-rise relative overflow-hidden rounded-[2rem] border-[3px] border-[var(--accent)] bg-white shadow-[var(--shadow-lift)]"
    >
      {/* illustration stage */}
      <div className="relative flex flex-col items-center bg-[var(--soft)] px-5 pb-6 pt-4">
        <div className="relative z-10 flex w-full items-center justify-between">
          <span className="font-ka rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-extrabold text-white">{category.ka}</span>
          <span className="font-display rounded-full bg-white/80 px-2.5 py-0.5 text-sm font-semibold text-[var(--deep)]">
            {index + 1} / {total}
          </span>
        </div>
        <svg className="pointer-events-none absolute left-1/2 top-[58%] h-52 w-52 -translate-x-1/2 -translate-y-1/2 text-white" viewBox="0 0 100 100" aria-hidden>
          <path d="M52 4c20 0 40 12 44 34s-8 46-30 54-46 2-58-16S0 32 14 18 32 4 52 4z" fill="currentColor" opacity="0.75" />
        </svg>
        <WordArt key={word.id} word={word} size="lg" className="animate-pop relative mt-4" />
      </div>

      <div className="px-5 pb-5 pt-4 text-center">
        <h2 className="font-display break-words text-[3.25rem] font-semibold leading-none tracking-tight text-ink sm:text-6xl">{word.en}</h2>
        <span className="font-ka mt-3 inline-block rounded-2xl bg-sun px-5 py-2 text-xl font-extrabold text-ink">{word.ka}</span>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <SpeakButton src={word.audioEn} text={word.en} label="მოუსმინე" size="lg" />
          <ParentAudioButton src={word.audioParent} />
        </div>

        {/* example sentence */}
        <div className="mt-5 overflow-hidden rounded-3xl bg-sky-soft text-left">
          <div className="flex items-center gap-3 px-4 pt-3">
            <p className="flex-1 text-lg font-bold leading-snug text-ink">
              {highlightParts(word.sentenceEn, word.en).map((p, i) =>
                p.hit ? (
                  <mark key={i} className="rounded-md bg-sun px-1 text-ink">
                    {p.text}
                  </mark>
                ) : (
                  <span key={i}>{p.text}</span>
                ),
              )}
            </p>
            <SpeakButton src="" text={word.sentenceEn} size="sm" variant="white" />
          </div>
          <p className="font-ka px-4 pb-3 pt-1.5 text-[0.95rem] font-semibold text-ink-soft">{word.sentenceKa}</p>
        </div>
      </div>
    </article>
  );
}
