"use client";

import type { Word } from "@/lib/words";
import { highlightParts } from "@/lib/words";
import type { Category } from "@/data/categories";
import WordArt from "./WordArt";
import { ParentAudioButton, SpeakButton } from "./ui";

/** Learn-mode card modelled on the printed vocabulary cards (PDF reference). */
export default function VocabCard({ word, category, index, total }: { word: Word; category: Category; index: number; total: number }) {
  return (
    <article className="relative overflow-hidden rounded-[2rem] border-[3px] border-brand bg-white p-5 shadow-[0_10px_0_0_#e4dcff]">
      <div className="flex items-center justify-between">
        <span className="font-ka rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
          {category.emoji} {category.ka}
        </span>
        <span className="text-sm font-extrabold text-slate-400">
          {index + 1} / {total}
        </span>
      </div>

      <div className="mt-3 flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="order-2 flex flex-col items-center sm:order-1 sm:items-start">
          <h2 className="text-5xl font-black tracking-tight text-ink sm:text-6xl">{word.en}</h2>
          <span className="font-ka mt-3 rounded-2xl bg-sun px-4 py-1.5 text-xl font-bold text-ink shadow-sm">{word.ka}</span>
        </div>
        <div className="order-1 flex h-44 w-44 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-violet-50 to-amber-50 sm:order-2 sm:h-52 sm:w-52">
          <WordArt key={word.id} word={word} size="lg" className="animate-pop" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <SpeakButton src={word.audioEn} text={word.en} label="სიტყვა" />
        <SpeakButton src="" text={word.sentenceEn} label="წინადადება" variant="soft" />
        <ParentAudioButton src={word.audioParent} />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <p className="rounded-2xl bg-cream px-4 py-3 text-center text-lg font-bold text-ink ring-1 ring-amber-100">
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
        <p className="font-ka rounded-2xl bg-sky-soft px-4 py-3 text-center text-base font-semibold text-ink">{word.sentenceKa}</p>
      </div>
    </article>
  );
}
