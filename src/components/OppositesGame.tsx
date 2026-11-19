"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RotateCcw, Star } from "lucide-react";
import { playEnglish } from "@/lib/audio";
import { progressActions } from "@/lib/progress";
import { shuffle, WORDS, type Word } from "@/lib/words";
import Wivi, { type WiviMood } from "./Wivi";
import WordArt from "./WordArt";
import { Bubble, Confetti, ProgressBar, TopBar } from "./ui";

/** Big/Small, Fast/Slow, Hot/Cold, Long/Short, Clean/Dirty (IDs from the Level 2 database) */
const PAIRS: [number, number][] = [
  [181, 182],
  [183, 184],
  [185, 186],
  [187, 188],
  [189, 190],
];
const PAIR_COLORS = ["#8B6CE8", "#FF8D85", "#5FCFA4", "#F2A33A", "#5BAEEB"];
const byId = (id: number) => WORDS.find((w) => w.id === id)!;

type Phase = { left: Word[]; right: Word[] };

export default function OppositesGame() {
  const [order, setOrder] = useState<Phase>({ left: PAIRS.map(([a]) => byId(a)), right: PAIRS.map(([, b]) => byId(b)) });
  const [selected, setSelected] = useState<number | null>(null); // left id
  const [matched, setMatched] = useState<number[]>([]); // left ids
  const [wrong, setWrong] = useState<number | null>(null); // right id flashing
  const [missed, setMissed] = useState<number[]>([]); // left ids with a mistake
  const [mood, setMood] = useState<WiviMood>("thinking");
  const [msg, setMsg] = useState("შეეხე მარცხნივ სიტყვას, მერე — მის საპირისპიროს მარჯვნივ.");
  const [saved, setSaved] = useState(false);

  const start = () => {
    setOrder({ left: shuffle(PAIRS.map(([a]) => byId(a))), right: shuffle(PAIRS.map(([, b]) => byId(b))) });
    setSelected(null);
    setMatched([]);
    setMissed([]);
    setWrong(null);
    setSaved(false);
    setMood("thinking");
    setMsg("შეეხე მარცხნივ სიტყვას, მერე — მის საპირისპიროს მარჯვნივ.");
  };

  // shuffle on the client only
  useEffect(() => {
    const id = requestAnimationFrame(start);
    return () => cancelAnimationFrame(id);
  }, []);

  const pairOf = (leftId: number) => PAIRS.find(([a]) => a === leftId)![1];
  const pairIndex = (id: number) => PAIRS.findIndex(([a, b]) => a === id || b === id);
  const done = matched.length === PAIRS.length;
  const firstTry = PAIRS.length - missed.length;

  useEffect(() => {
    if (done && !saved) {
      progressActions.finishQuiz("opposites", firstTry, PAIRS.length);
      const id = requestAnimationFrame(() => setSaved(true));
      return () => cancelAnimationFrame(id);
    }
  }, [done, saved, firstTry]);

  function pickLeft(w: Word) {
    if (matched.includes(w.id)) return;
    setSelected(w.id);
    playEnglish(w.audioEn, w.en);
    setMood("thinking");
    setMsg(`${w.en} — რა არის მისი საპირისპირო?`);
  }

  function pickRight(w: Word) {
    if (selected === null || matched.some((l) => pairOf(l) === w.id)) {
      if (selected === null) setMsg("ჯერ მარცხნივ აირჩიე სიტყვა.");
      return;
    }
    const ok = pairOf(selected) === w.id;
    const firstAttempt = !missed.includes(selected);
    progressActions.answer(selected, ok);
    if (ok) {
      progressActions.answer(w.id, firstAttempt);
      playEnglish(w.audioEn, w.en);
      setMatched((m) => [...m, selected]);
      setSelected(null);
      setMood("excited");
      setMsg(`ზუსტად! ${byId(selected).en} ↔ ${w.en}`);
    } else {
      setMissed((m) => (m.includes(selected) ? m : [...m, selected]));
      setWrong(w.id);
      setTimeout(() => setWrong(null), 450);
      setMood("encouraging");
      setMsg("არა უშავს! კიდევ სცადე.");
    }
  }

  if (done) {
    const stars = firstTry === PAIRS.length ? 3 : firstTry >= 4 ? 2 : 1;
    return (
      <main>
        <Confetti />
        <TopBar back="/" title="საპირისპიროები" sub="შედეგი" />
        <div className="animate-pop card mx-4 mt-2 flex flex-col items-center p-6 text-center lg:mx-auto lg:max-w-xl">
          <Wivi mood="excited" size={140} />
          <p className="font-ka mt-1 text-2xl font-extrabold">ყველა წყვილი იპოვე!</p>
          <p className="font-ka mt-1 text-ink-soft">
            პირველივე ცდაზე: <b className="font-display text-lg text-ink">{firstTry}</b>/{PAIRS.length}
          </p>
          <div className="mt-3 flex gap-2" aria-label={`${stars} ვარსკვლავი 3-დან`}>
            {[0, 1, 2].map((s) => (
              <Star key={s} size={44} className={s < stars ? "animate-pop fill-sun text-[#E5B400]" : "fill-ink/5 text-ink/15"} style={{ animationDelay: `${0.2 + s * 0.18}s` }} />
            ))}
          </div>
          <ul className="mt-5 w-full space-y-2">
            {PAIRS.map(([a, b], i) => (
              <li key={a} className="flex items-center justify-between rounded-2xl px-4 py-2" style={{ background: `${PAIR_COLORS[i]}22` }}>
                <span className="font-display text-lg font-semibold">{byId(a).en}</span>
                <span className="font-ka text-xs text-ink-soft">
                  {byId(a).ka} ↔ {byId(b).ka}
                </span>
                <span className="font-display text-lg font-semibold">{byId(b).en}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid w-full gap-3">
            <button onClick={start} className="press focus-ring font-ka flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-lavender text-lg font-extrabold text-white [--edge:#6a4fd0]">
              <RotateCcw size={22} /> კიდევ ერთხელ
            </button>
            <Link href="/category/opposites" className="press focus-ring font-ka flex min-h-13 items-center justify-center rounded-2xl bg-lavender-soft font-extrabold text-lavender-deep [--edge:#d9cffa]">
              თემა „საპირისპიროები“
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const renderCard = (w: Word, side: "left" | "right") => {
    const leftMatched = side === "left" ? matched.includes(w.id) : matched.some((l) => pairOf(l) === w.id);
    const isSel = side === "left" && selected === w.id;
    const pi = pairIndex(w.id);
    const color = leftMatched ? PAIR_COLORS[pi] : undefined;
    return (
      <button
        onClick={() => (side === "left" ? pickLeft(w) : pickRight(w))}
        disabled={leftMatched}
        aria-pressed={isSel}
        className={`press focus-ring flex min-h-24 w-full flex-col items-center justify-center gap-1 rounded-2xl border-[3px] p-2 transition ${
          leftMatched
            ? "text-ink"
            : isSel
              ? "border-lavender bg-lavender-soft"
              : wrong === w.id
                ? "animate-wiggle border-coral bg-coral-soft"
                : "border-transparent bg-white"
        }`}
        style={leftMatched ? { borderColor: color, background: `${color}22` } : undefined}
      >
        <WordArt word={w} size="sm" />
        <span className="font-display text-xl font-semibold leading-none">{w.en}</span>
        {leftMatched ? <span className="font-ka text-[0.7rem] font-bold text-ink-soft">{w.ka}</span> : null}
      </button>
    );
  };

  return (
    <main className="lg:mx-auto lg:w-full lg:max-w-xl">
      <TopBar back="/" title="საპირისპიროები" sub="დააწყვილე სიტყვები" />
      <div className="px-4">
        <ProgressBar value={matched.length} max={PAIRS.length} color="var(--color-lavender)" className="mb-4" />
        <div className="flex items-center gap-2">
          <Wivi mood={mood} size={64} className="shrink-0" />
          <Bubble className="flex-1 !py-2.5">
            <p className="font-ka text-sm font-bold" aria-live="polite">
              {msg}
            </p>
          </Bubble>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <ul className="space-y-3" aria-label="სიტყვები">
            {order.left.map((w) => (
              <li key={w.id}>
                {renderCard(w, "left")}
              </li>
            ))}
          </ul>
          <ul className="space-y-3" aria-label="საპირისპიროები">
            {order.right.map((w) => (
              <li key={w.id}>
                {renderCard(w, "right")}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
