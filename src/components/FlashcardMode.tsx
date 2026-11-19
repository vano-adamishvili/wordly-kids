"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { categoryBySlug } from "@/data/categories";
import { playEnglish } from "@/lib/audio";
import { progressActions } from "@/lib/progress";
import { shuffle, wordsForCategory, type Word } from "@/lib/words";
import WordArt from "./WordArt";
import { Confetti, ProgressBar, SpeakButton, TopBar } from "./ui";

type Direction = "en-ka" | "ka-en";

export default function FlashcardMode({ slug }: { slug: string }) {
  const cat = categoryBySlug(slug)!;
  const all = wordsForCategory(slug);
  const [dir, setDir] = useState<Direction>("en-ka");
  const [deck, setDeck] = useState<Word[]>(all);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<number[]>([]);
  const [again, setAgain] = useState<number[]>([]);
  const touchX = useRef<number | null>(null);

  // Shuffle on the client only (avoids hydration mismatch)
  useEffect(() => {
    const id = requestAnimationFrame(() => setDeck(shuffle(all)));
    progressActions.visitCategory(slug);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const card = deck[pos];
  const done = pos >= deck.length;

  // Auto-pronounce whenever the English side becomes visible
  useEffect(() => {
    if (!card) return;
    const englishVisible = (dir === "en-ka" && !flipped) || (dir === "ka-en" && flipped);
    if (englishVisible) {
      const t = setTimeout(() => playEnglish(card.audioEn, card.en), 250);
      return () => clearTimeout(t);
    }
  }, [card, dir, flipped]);

  function answer(ok: boolean) {
    if (!card) return;
    progressActions.markSeen(card.id, slug);
    if (ok) {
      setKnown((k) => (k.includes(card.id) ? k : [...k, card.id]));
      if (!again.includes(card.id)) progressActions.setStatus(card.id, "learned");
    } else {
      setAgain((a) => (a.includes(card.id) ? a : [...a, card.id]));
      // show this card once more at the end of the deck
      if (deck.filter((w) => w.id === card.id).length < 2) setDeck((d) => [...d, card]);
    }
    setFlipped(false);
    setPos((x) => x + 1);
  }

  function restart(onlyAgain = false) {
    const base = onlyAgain ? all.filter((w) => again.includes(w.id)) : all;
    setDeck(shuffle(base.length ? base : all));
    setPos(0);
    setKnown([]);
    setAgain([]);
    setFlipped(false);
  }

  const dirToggle = (
    <button
      onClick={() => {
        setDir((d) => (d === "en-ka" ? "ka-en" : "en-ka"));
        setFlipped(false);
      }}
      className="btn-3d flex h-11 items-center gap-1 rounded-2xl bg-white px-3 text-sm font-extrabold text-brand ring-1 ring-violet-200"
      aria-label="მიმართულების შეცვლა"
    >
      {dir === "en-ka" ? "EN → ქარ" : "ქარ → EN"} ⇄
    </button>
  );

  if (done) {
    const firstTry = known.filter((id) => !again.includes(id)).length;
    return (
      <main>
        <Confetti />
        <TopBar back={`/category/${slug}`} title={`🃏 ${cat.ka}`} />
        <div className="animate-pop mx-4 mt-6 rounded-[2rem] bg-white p-6 text-center ring-2 ring-violet-100">
          <div className="text-7xl">🏅</div>
          <p className="font-ka mt-3 text-2xl font-extrabold">ბარათები დასრულდა!</p>
          <p className="font-ka mt-2 text-slate-600">
            პირველივე ცდაზე იცოდი: <b>{firstTry}</b>/{all.length}
          </p>
          {again.length ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {all
                .filter((w) => again.includes(w.id))
                .map((w) => (
                  <span key={w.id} className="font-ka rounded-full bg-amber-100 px-3 py-1 text-sm font-bold">
                    {w.en} · {w.ka}
                  </span>
                ))}
            </div>
          ) : null}
          <div className="mt-6 grid gap-3">
            {again.length ? (
              <button onClick={() => restart(true)} className="btn-3d font-ka rounded-2xl bg-amber-400 py-3 text-lg font-bold text-ink">
                🔁 გავიმეოროთ რთულები ({again.length})
              </button>
            ) : null}
            <button onClick={() => restart()} className="btn-3d font-ka rounded-2xl bg-brand py-3 text-lg font-bold text-white">
              🃏 ყველა თავიდან
            </button>
            <Link href={`/category/${slug}/quiz`} className="btn-3d font-ka rounded-2xl bg-sun py-3 text-lg font-bold text-ink">
              🧩 ქვიზზე გადასვლა
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const front = dir === "en-ka" ? <EnglishFace word={card} /> : <GeorgianFace word={card} withArt />;
  const back = dir === "en-ka" ? <GeorgianFace word={card} /> : <EnglishFace word={card} />;

  return (
    <main>
      <TopBar back={`/category/${slug}`} title={`🃏 ${cat.ka}`} right={dirToggle} />
      <div className="px-4">
        <div className="mb-3 flex items-center gap-3">
          <ProgressBar value={pos} max={deck.length} />
          <span className="shrink-0 text-sm font-extrabold text-slate-500">
            {pos + 1}/{deck.length}
          </span>
        </div>

        <div
          className="flip-scene h-[26rem] w-full cursor-pointer select-none sm:h-[28rem]"
          onClick={() => setFlipped((f) => !f)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (flipped && Math.abs(dx) > 70) answer(dx > 0);
          }}
          role="button"
          aria-label="ბარათის გადაბრუნება"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
        >
          <div key={`${card.id}-${pos}`} className="animate-pop h-full w-full">
          <div className={`flip-inner h-full w-full ${flipped ? "is-flipped" : ""}`}>
            <div className="flip-face rounded-[2rem] border-[3px] border-brand bg-white shadow-[0_10px_0_0_#e4dcff]">{front}</div>
            <div className="flip-face flip-back rounded-[2rem] border-[3px] border-amber-300 bg-gradient-to-br from-amber-50 to-white shadow-[0_10px_0_0_#ffe8a3]">
              {back}
            </div>
          </div>
          </div>
        </div>

        {flipped ? (
          <div className="animate-pop mt-5 grid grid-cols-2 gap-3">
            <button onClick={() => answer(false)} className="btn-3d font-ka rounded-2xl bg-rose-100 py-4 text-lg font-extrabold text-rose-600">
              🔁 ისევ ვივარჯიშებ
            </button>
            <button onClick={() => answer(true)} className="btn-3d font-ka rounded-2xl bg-emerald-500 py-4 text-lg font-extrabold text-white">
              ✓ ვიცი!
            </button>
          </div>
        ) : (
          <button
            onClick={() => setFlipped(true)}
            className="btn-3d font-ka mt-5 w-full rounded-2xl bg-brand py-4 text-lg font-extrabold text-white"
          >
            👆 გადააბრუნე
          </button>
        )}
        <p className="font-ka mt-3 text-center text-xs text-slate-400">
          შეეხე ბარათს გადასაბრუნებლად · გადაბრუნების შემდეგ გაასრიალე → „ვიცი“, ← „ისევ“
        </p>
      </div>
    </main>
  );
}

function EnglishFace({ word }: { word: Word }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-extrabold text-brand">ENGLISH</span>
      <WordArt word={word} size="lg" />
      <p className="text-5xl font-black text-ink">{word.en}</p>
      <div onClick={(e) => e.stopPropagation()}>
        <SpeakButton src={word.audioEn} text={word.en} size="md" />
      </div>
    </div>
  );
}

function GeorgianFace({ word, withArt }: { word: Word; withArt?: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
      <span className="font-ka rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">ქართული</span>
      {withArt ? <WordArt word={word} size="lg" /> : <WordArt word={word} size="md" />}
      <p className="font-ka rounded-2xl bg-sun px-5 py-2 text-4xl font-extrabold text-ink">{word.ka}</p>
      {!withArt ? (
        <div className="mt-1 space-y-1">
          <p className="text-base font-bold text-slate-700">{word.sentenceEn}</p>
          <p className="font-ka rounded-xl bg-sky-soft px-3 py-1.5 text-sm text-ink">{word.sentenceKa}</p>
        </div>
      ) : (
        <p className="font-ka text-sm text-slate-400">როგორ არის ინგლისურად?</p>
      )}
    </div>
  );
}
