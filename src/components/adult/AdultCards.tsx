"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeftRight, Check, Flag, Puzzle, RotateCcw } from "lucide-react";
import { categoryBySlug, setLabel, type MaltaItem } from "@/lib/adult/malta";
import { adultActions } from "@/lib/adult/progress";
import { useSetItems } from "@/lib/adult/useSet";
import { shuffle } from "@/lib/words";
import Wivi from "../Wivi";
import { Empty } from "./AdultLearn";
import { AdultTopBar, Bar, CatIcon, LevelBadge, SayButton, useSay } from "./ui";

type Dir = "en-ka" | "ka-en";

export default function AdultCards({ set }: { set: string }) {
  const { items, level } = useSetItems(set);
  const [deck, setDeck] = useState<MaltaItem[] | null>(null);
  const [pos, setPos] = useState(0);
  const [dir, setDir] = useState<Dir>("en-ka");
  const [flipped, setFlipped] = useState(false);
  const [again, setAgain] = useState<string[]>([]);
  const [knownIds, setKnownIds] = useState<string[]>([]);
  const say = useSay();

  useEffect(() => {
    if (items && deck === null) {
      const id = requestAnimationFrame(() => setDeck(set === "review" ? items : shuffle(items)));
      return () => cancelAnimationFrame(id);
    }
  }, [items, deck, set]);

  const card = deck?.[pos];
  // pronounce when the English side becomes visible
  useEffect(() => {
    if (!card) return;
    if ((dir === "en-ka" && !flipped) || (dir === "ka-en" && flipped)) {
      const t = setTimeout(() => say(card.en, { file: card.wordAudio }), 250);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, dir, flipped]);

  const q = level ? `?lvl=${level}` : "";
  const top = (
    <AdultTopBar
      back={set === "review" ? "/adults" : `/adults/set/${set}`}
      title={setLabel(set)}
      sub="ბარათები"
      right={
        <button
          onClick={() => {
            setDir((d) => (d === "en-ka" ? "ka-en" : "en-ka"));
            setFlipped(false);
          }}
          className="focus-ring flex h-11 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-extrabold text-lavender-deep shadow-[var(--shadow-soft)]"
          aria-label={`მიმართულება: ${dir === "en-ka" ? "ინგლისური → ქართული" : "ქართული → ინგლისური"}. შეცვლა`}
        >
          {dir === "en-ka" ? "EN" : "ქა"} <ArrowLeftRight size={14} /> {dir === "en-ka" ? "ქა" : "EN"}
        </button>
      }
    />
  );
  if (!deck) return <main>{top}</main>;
  if (deck.length === 0)
    return (
      <main>
        {top}
        <Empty />
      </main>
    );

  function answer(ok: boolean) {
    if (!card) return;
    adultActions.rate(card.id, ok, dir);
    if (ok) setKnownIds((k) => (k.includes(card.id) ? k : [...k, card.id]));
    else {
      setAgain((a) => (a.includes(card.id) ? a : [...a, card.id]));
      if (deck!.filter((c) => c.id === card.id).length < 2) setDeck((d) => [...d!, card]);
    }
    setFlipped(false);
    setPos((x) => x + 1);
  }

  if (pos >= deck.length) {
    const firstTry = knownIds.filter((id) => !again.includes(id)).length;
    const total = new Set(deck.map((c) => c.id)).size;
    return (
      <main>
        {top}
        <div className="card mx-4 mt-4 flex flex-col items-center rounded-2xl p-6 text-center lg:mx-auto lg:max-w-xl">
          <Wivi mood={firstTry === total ? "cheering" : "encouraging"} size={80} animate={false} />
          <p className="font-ka mt-2 text-lg font-extrabold">ბარათები დასრულდა</p>
          <p className="font-ka text-sm text-ink-soft">
            პირველივე ცდაზე: {firstTry}/{total} · რთული: {again.length}
          </p>
          <div className="mt-5 grid w-full grid-cols-2 gap-2">
            <button
              onClick={() => {
                setDeck(shuffle(again.length ? deck.filter((c, i, a) => again.includes(c.id) && a.findIndex((x) => x.id === c.id) === i) : deck));
                setPos(0);
                setAgain([]);
                setKnownIds([]);
              }}
              className="focus-ring font-ka flex min-h-12 items-center justify-center gap-2 rounded-xl bg-lavender font-extrabold text-white"
            >
              <RotateCcw size={18} /> {again.length ? "რთულები" : "თავიდან"}
            </button>
            <Link href={`/adults/quiz/${set}${q}`} className="focus-ring font-ka flex min-h-12 items-center justify-center gap-2 rounded-xl bg-lavender-soft font-extrabold text-lavender-deep">
              <Puzzle size={18} /> ქვიზი
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const c = card!;
  const cat = categoryBySlug(c.cat)!;
  // EN→KA: front = English only · back = Georgian + example sentence
  // KA→EN: front = Georgian only · back = English + example sentence
  const front = dir === "en-ka" ? <EnFace item={c} /> : <KaFace item={c} />;
  const back = <BackFace item={c} dir={dir} />;

  return (
    <main className="lg:mx-auto lg:max-w-xl">
      {top}
      <div className="px-4 pt-3">
        <div className="mb-3 flex items-center gap-3">
          <Bar value={pos} max={deck.length} />
          <span className="shrink-0 text-xs font-extrabold text-ink-soft">
            {pos + 1}/{deck.length}
          </span>
        </div>
        <div
          className="flip-scene focus-ring h-[22rem] w-full cursor-pointer select-none rounded-2xl"
          onClick={() => setFlipped((f) => !f)}
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-label={flipped ? "წინა მხარე" : "გადაბრუნება"}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
        >
          <div key={`${c.id}-${pos}-${dir}`} className="animate-pop h-full w-full">
            <div className={`flip-inner h-full w-full ${flipped ? "is-flipped" : ""}`}>
              <div className="flip-face card overflow-hidden rounded-2xl" aria-hidden={flipped} inert={flipped}>
                <FaceHeader slug={c.cat} ka={cat.ka} level={c.level} />
                {front}
              </div>
              <div className="flip-face flip-back card overflow-hidden rounded-2xl" aria-hidden={!flipped} inert={!flipped}>
                <FaceHeader slug={c.cat} ka={cat.ka} level={c.level} />
                {back}
              </div>
            </div>
          </div>
        </div>
        {flipped ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => answer(false)} className="focus-ring font-ka flex h-13 items-center justify-center gap-1.5 rounded-xl bg-coral-soft font-extrabold text-coral-deep">
              <Flag size={18} /> რთულია
            </button>
            <button onClick={() => answer(true)} className="focus-ring font-ka flex h-13 items-center justify-center gap-1.5 rounded-xl bg-mint font-extrabold text-ink">
              <Check size={20} strokeWidth={3} /> ვიცი
            </button>
          </div>
        ) : (
          <button onClick={() => setFlipped(true)} className="focus-ring font-ka mt-4 h-13 w-full rounded-xl bg-lavender font-extrabold text-white">
            გადაბრუნება
          </button>
        )}
      </div>
    </main>
  );
}

function FaceHeader({ slug, ka, level }: { slug: string; ka: string; level: "B1" | "B2" }) {
  return (
    <div className="flex items-center gap-2 border-b border-ink/5 px-4 py-2.5 text-ink-soft">
      <CatIcon slug={slug} size={16} />
      <span className="font-ka flex-1 truncate text-xs font-bold">{ka}</span>
      <LevelBadge level={level} />
    </div>
  );
}

function EnFace({ item }: { item: MaltaItem }) {
  return (
    <div className="flex h-[calc(100%-2.6rem)] flex-col items-center justify-center gap-4 p-5 text-center">
      <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-ink-soft">English</span>
      <p className="break-words text-[2rem] font-extrabold leading-tight">{item.en}</p>
      <div onClick={(e) => e.stopPropagation()}>
        <SayButton text={item.en} file={item.wordAudio} />
      </div>
    </div>
  );
}

function KaFace({ item }: { item: MaltaItem }) {
  return (
    <div className="flex h-[calc(100%-2.6rem)] flex-col items-center justify-center gap-3 p-5 text-center">
      <span className="font-ka text-[0.7rem] font-extrabold tracking-wide text-ink-soft">ქართული</span>
      <p className="font-ka break-words text-[1.6rem] font-extrabold leading-snug text-lavender-deep">{item.ka}</p>
      <p className="font-ka text-xs text-ink-soft">როგორ არის ინგლისურად?</p>
    </div>
  );
}

function BackFace({ item, dir }: { item: MaltaItem; dir: Dir }) {
  return (
    <div className="flex h-[calc(100%-2.6rem)] flex-col justify-center gap-3 overflow-y-auto p-5">
      {dir === "en-ka" ? (
        <>
          <p className="font-ka text-center text-[1.5rem] font-extrabold leading-snug text-lavender-deep">{item.ka}</p>
          <p className="text-center text-sm font-bold text-ink-soft">{item.en}</p>
        </>
      ) : (
        <>
          <p className="break-words text-center text-[1.8rem] font-extrabold leading-tight">{item.en}</p>
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <SayButton text={item.en} file={item.wordAudio} size="sm" />
          </div>
        </>
      )}
      <div className="rounded-xl bg-sky-soft p-3 text-left">
        <p className="text-[0.95rem] font-semibold leading-snug">{item.sentenceEn}</p>
        <p className="font-ka mt-1 text-xs text-ink-soft">{item.sentenceKa}</p>
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <SayButton text={item.sentenceEn} file={item.sentenceAudio} variant="soft" size="sm" />
        </div>
      </div>
    </div>
  );
}
