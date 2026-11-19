"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Check, Hand, Layers, Puzzle, RotateCcw, Repeat } from "lucide-react";
import { categoryBySlug, categoryVars, type Category } from "@/data/categories";
import { playEnglish } from "@/lib/audio";
import { progressActions } from "@/lib/progress";
import { shuffle, wordsForCategory, type Word } from "@/lib/words";
import WordArt from "./WordArt";
import Wobble from "./Wobble";
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
      const t = setTimeout(() => playEnglish(card.audioEn, card.en), 300);
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
      className="press focus-ring flex h-12 items-center gap-1.5 rounded-2xl bg-white px-3 text-sm font-extrabold text-lavender-deep"
      aria-label={`მიმართულება: ${dir === "en-ka" ? "ინგლისური → ქართული" : "ქართული → ინგლისური"}. შეცვლა`}
    >
      <span className="font-display">{dir === "en-ka" ? "EN" : "ქა"}</span>
      <ArrowLeftRight size={16} strokeWidth={2.8} />
      <span className="font-display">{dir === "en-ka" ? "ქა" : "EN"}</span>
    </button>
  );

  if (done) {
    const firstTry = known.filter((id) => !again.includes(id)).length;
    const perfect = firstTry === all.length;
    return (
      <main style={categoryVars(cat)}>
        {firstTry >= all.length * 0.6 ? <Confetti /> : null}
        <TopBar back={`/category/${slug}`} title={cat.ka} sub="ბარათები" />
        <div className="animate-pop card mx-4 mt-4 flex flex-col items-center p-6 text-center">
          <Wobble mood={perfect ? "excited" : "encouraging"} size={140} />
          <p className="font-ka mt-2 text-2xl font-extrabold">{perfect ? "ყველა იცოდი!" : "ბარათები დასრულდა!"}</p>
          <p className="font-ka mt-1 text-ink-soft">
            პირველივე ცდაზე იცოდი: <b className="font-display text-lg text-ink">{firstTry}</b>/{all.length}
          </p>
          {again.length ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {all
                .filter((w) => again.includes(w.id))
                .map((w) => (
                  <span key={w.id} className="rounded-full bg-sun-soft px-3 py-1 text-sm font-bold">
                    <span className="font-display">{w.en}</span> · <span className="font-ka">{w.ka}</span>
                  </span>
                ))}
            </div>
          ) : null}
          <div className="mt-6 grid w-full gap-3">
            {again.length ? (
              <button onClick={() => restart(true)} className="press focus-ring font-ka flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-sun text-lg font-extrabold text-ink [--edge:#e8bf2c]">
                <Repeat size={22} /> გავიმეოროთ რთულები ({again.length})
              </button>
            ) : null}
            <button onClick={() => restart()} className="press focus-ring font-ka flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-lavender text-lg font-extrabold text-white [--edge:#6a4fd0]">
              <RotateCcw size={22} /> ყველა თავიდან
            </button>
            <Link href={`/category/${slug}/quiz`} className="press focus-ring font-ka flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-lavender-soft text-lg font-extrabold text-lavender-deep [--edge:#d9cffa]">
              <Puzzle size={22} /> ქვიზზე გადასვლა
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Face content per direction (see project spec):
  //  EN→KA  front: English word, NO illustration · back: Georgian + illustration
  //  KA→EN  front: Georgian + illustration        · back: English + pronunciation
  const front = dir === "en-ka" ? <EnglishFace word={card} cat={cat} /> : <GeorgianFace word={card} cat={cat} prompt />;
  const back = dir === "en-ka" ? <GeorgianFace word={card} cat={cat} /> : <EnglishFace word={card} cat={cat} answer />;

  return (
    <main style={categoryVars(cat)} className="lg:mx-auto lg:w-full lg:max-w-xl">
      <TopBar back={`/category/${slug}`} title={cat.ka} sub="ბარათები" right={dirToggle} />
      <div className="px-4">
        <div className="mb-4 flex items-center gap-3">
          <ProgressBar value={pos} max={deck.length} color="var(--accent)" />
          <span className="font-display shrink-0 text-sm font-semibold text-ink-soft">
            {pos + 1}/{deck.length}
          </span>
        </div>

        <div
          className="flip-scene focus-ring mx-auto aspect-[3/4] max-h-[60vh] w-full max-w-sm cursor-pointer select-none rounded-[2rem] sm:max-h-[32rem]"
          onClick={() => setFlipped((f) => !f)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (flipped && Math.abs(dx) > 70) answer(dx > 0);
          }}
          role="button"
          aria-pressed={flipped}
          aria-label={flipped ? "ბარათის წინა მხარეზე დაბრუნება" : "ბარათის გადაბრუნება"}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
        >
          <div key={`${card.id}-${pos}-${dir}`} className="animate-pop h-full w-full">
            <div className={`flip-inner h-full w-full ${flipped ? "is-flipped" : ""}`}>
              <div
                className="flip-face overflow-hidden rounded-[2rem] border-[4px] border-[var(--accent)] bg-white shadow-[var(--shadow-lift)]"
                aria-hidden={flipped}
                inert={flipped}
              >
                {front}
              </div>
              <div
                className="flip-face flip-back overflow-hidden rounded-[2rem] border-[4px] border-[var(--accent)] bg-white shadow-[var(--shadow-lift)]"
                aria-hidden={!flipped}
                inert={!flipped}
              >
                {back}
              </div>
            </div>
          </div>
        </div>

        {flipped ? (
          <div className="animate-rise mx-auto mt-5 grid max-w-sm grid-cols-2 gap-3">
            <button
              onClick={() => answer(false)}
              className="press focus-ring font-ka flex min-h-15 items-center justify-center gap-1.5 rounded-2xl bg-coral-soft px-2 text-[0.9rem] font-extrabold text-coral-deep [--edge:#ffd3cf]"
            >
              <Repeat size={18} strokeWidth={2.6} className="shrink-0" /> გასამეორებელია
            </button>
            <button
              onClick={() => answer(true)}
              className="press focus-ring font-ka flex min-h-15 items-center justify-center gap-2 rounded-2xl bg-mint text-lg font-extrabold text-ink [--edge:#3fb98c]"
            >
              <Check size={24} strokeWidth={3} /> ვიცი
            </button>
          </div>
        ) : (
          <button
            onClick={() => setFlipped(true)}
            className="press focus-ring font-ka mx-auto mt-5 flex min-h-15 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-lavender text-lg font-extrabold text-white [--edge:#6a4fd0]"
          >
            <Layers size={22} /> გადააბრუნე
          </button>
        )}
        <p className="font-ka mx-auto mt-3 flex max-w-sm items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
          <Hand size={14} aria-hidden /> შეეხე ბარათს · გადაბრუნების შემდეგ გაასრიალე: → ვიცი, ← გასამეორებელია
        </p>
      </div>
    </main>
  );
}

function Corner({ label, tone }: { label: string; tone: "en" | "ka" }) {
  return (
    <span
      className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-extrabold ${
        tone === "en" ? "font-display bg-lavender-soft text-lavender-deep" : "font-ka bg-sun-soft text-[#8A6400]"
      }`}
    >
      {label}
    </span>
  );
}

function CardPattern() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <circle cx="270" cy="30" r="70" fill="var(--soft)" />
      <circle cx="20" cy="390" r="90" fill="var(--soft)" />
      <circle cx="250" cy="120" r="8" fill="var(--accent)" opacity="0.35" />
      <circle cx="46" cy="300" r="6" fill="var(--accent)" opacity="0.3" />
    </svg>
  );
}

/** English side. On the front (EN→KA) it has no illustration so it doesn't give the meaning away. */
function EnglishFace({ word, answer = false }: { word: Word; cat: Category; answer?: boolean }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
      <CardPattern />
      <Corner label="ENGLISH" tone="en" />
      <p className="font-display relative break-words text-[3.5rem] font-semibold leading-none text-ink sm:text-6xl">{word.en}</p>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <SpeakButton src={word.audioEn} text={word.en} size="lg" label={answer ? undefined : "მოუსმინე"} />
      </div>
      {answer ? (
        <p className="relative max-w-[16rem] text-base font-bold text-ink-soft">{word.sentenceEn}</p>
      ) : (
        <p className="font-ka relative text-sm font-semibold text-ink-soft">რას ნიშნავს ქართულად?</p>
      )}
    </div>
  );
}

/** Georgian side, always with the illustration. */
function GeorgianFace({ word, prompt = false }: { word: Word; cat: Category; prompt?: boolean }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <CardPattern />
      <Corner label="ქართული" tone="ka" />
      <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-[var(--soft)] sm:h-48 sm:w-48">
        <WordArt word={word} size="lg" />
      </div>
      <p className="font-ka relative rounded-2xl bg-sun px-5 py-2 text-3xl font-extrabold text-ink sm:text-4xl">{word.ka}</p>
      {prompt ? (
        <p className="font-ka relative text-sm font-semibold text-ink-soft">როგორ არის ინგლისურად?</p>
      ) : (
        <p className="font-ka relative max-w-[17rem] text-sm font-semibold text-ink-soft">{word.sentenceKa}</p>
      )}
    </div>
  );
}
